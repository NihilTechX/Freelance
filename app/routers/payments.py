import stripe
from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import logging

from app.database import get_db
from app.models.payment import Payment, PaymentStatus
from app.models.proposal_contract import Contract, ContractStatus
from app.schemas.payment import PaymentResponse
from app.core.dependencies import get_current_user
from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from app.models.user import User
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payments", tags=["Payments"])

# Initialise Stripe with the secret key from env
stripe.api_key = settings.STRIPE_SECRET_KEY


# ─── Helper ────────────────────────────────────────────────────────────────────
async def _get_contract(db: AsyncSession, contract_id: uuid.UUID) -> Contract:
    result = await db.execute(select(Contract).filter(Contract.id == contract_id))
    contract = result.scalars().first()
    if not contract:
        raise NotFoundException("Contract not found")
    return contract


# ─── Create Stripe Checkout Session (Client pays) ─────────────────────────────
@router.post("/checkout-session/{contract_id}")
async def create_checkout_session(
    contract_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Creates a Stripe Checkout session for the contract amount.
    Only the contract's client can fund a contract.
    """
    contract = await _get_contract(db, contract_id)

    if contract.client_id != current_user.id:
        raise ForbiddenException("Only the client can fund this contract")

    if contract.status != ContractStatus.ACTIVE:
        raise BadRequestException("Only active contracts can be funded")

    # Check if already paid
    result = await db.execute(select(Payment).filter(Payment.contract_id == contract_id))
    existing = result.scalars().first()
    if existing and existing.status in (PaymentStatus.HELD_IN_ESCROW, PaymentStatus.RELEASED):
        raise BadRequestException("This contract has already been funded")

    amount_cents = int(float(contract.budget) * 100)  # Stripe uses cents

    # Create Stripe Checkout Session
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "usd",
                "product_data": {
                    "name": f"EliteMatch Contract #{str(contract_id)[:8]}",
                    "description": "Secure escrow payment for freelance contract",
                },
                "unit_amount": amount_cents,
            },
            "quantity": 1,
        }],
        mode="payment",
        # Redirect user back to frontend after payment
        success_url=f"{settings.FRONTEND_URL}/contracts?payment=success&contract_id={contract_id}",
        cancel_url=f"{settings.FRONTEND_URL}/contracts?payment=cancelled&contract_id={contract_id}",
        metadata={"contract_id": str(contract_id)},
    )

    # Create a pending Payment record in DB
    if not existing:
        payment = Payment(
            contract_id=contract_id,
            amount=float(contract.budget),
            status=PaymentStatus.PENDING,
        )
        db.add(payment)
        await db.commit()

    return {"checkout_url": session.url, "session_id": session.id}


# ─── Stripe Webhook (Stripe calls this after payment) ─────────────────────────
@router.post("/webhook", include_in_schema=False)
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Stripe sends events here. We listen for 'checkout.session.completed'
    and update the Payment status to 'held_in_escrow'.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        contract_id_str = session.get("metadata", {}).get("contract_id")
        payment_intent_id = session.get("payment_intent")

        if contract_id_str:
            contract_id = uuid.UUID(contract_id_str)
            result = await db.execute(select(Payment).filter(Payment.contract_id == contract_id))
            payment = result.scalars().first()
            if payment:
                payment.status = PaymentStatus.HELD_IN_ESCROW
                payment.stripe_payment_intent_id = payment_intent_id
                await db.commit()
                logger.info(f"Payment held in escrow for contract {contract_id_str}")

    return {"received": True}


# ─── Get Payment Status ────────────────────────────────────────────────────────
@router.get("/{contract_id}", response_model=PaymentResponse)
async def get_payment(
    contract_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get payment status for a contract."""
    contract = await _get_contract(db, contract_id)
    if current_user.id not in (contract.client_id, contract.freelancer_id):
        raise ForbiddenException("Not part of this contract")

    result = await db.execute(select(Payment).filter(Payment.contract_id == contract_id))
    payment = result.scalars().first()
    if not payment:
        raise NotFoundException("No payment record found for this contract")
    return payment


# ─── Release Funds (Client releases after work is done) ───────────────────────
@router.post("/release/{contract_id}", response_model=PaymentResponse)
async def release_funds(
    contract_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Client releases the escrowed funds to the freelancer.
    Also marks the contract as completed.
    """
    contract = await _get_contract(db, contract_id)

    if contract.client_id != current_user.id:
        raise ForbiddenException("Only the client can release funds")

    result = await db.execute(select(Payment).filter(Payment.contract_id == contract_id))
    payment = result.scalars().first()

    if not payment:
        raise NotFoundException("No payment found for this contract")

    if payment.status != PaymentStatus.HELD_IN_ESCROW:
        raise BadRequestException("Funds can only be released from escrow")

    # Mark payment as released
    payment.status = PaymentStatus.RELEASED
    # Mark contract as completed
    contract.status = ContractStatus.COMPLETED
    await db.commit()
    await db.refresh(payment)

    logger.info(f"Funds released for contract {contract_id}")
    return payment
