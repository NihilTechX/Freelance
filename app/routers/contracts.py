from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List

from app.database import get_db
from app.schemas.proposal_contract import ContractResponse, ContractCreate
from app.models.proposal_contract import ContractStatus
from app.services.proposal_contract_service import contract_service
from app.core.dependencies import get_current_user, RoleChecker
from app.models.user import User
from app.core.exceptions import ForbiddenException

router = APIRouter(prefix="/contracts", tags=["Contracts"])

@router.post("", response_model=ContractResponse, status_code=status.HTTP_201_CREATED)
async def create_contract(
    contract_in: ContractCreate,
    current_user: User = Depends(RoleChecker(["client"])),
    db: AsyncSession = Depends(get_db)
):
    """Accept a proposal to hire a freelancer and start a contract. Restricted to clients."""
    return await contract_service.create_contract(db, current_user.id, contract_in)

@router.get("/me", response_model=List[ContractResponse])
async def list_my_contracts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all active/inactive contracts for the current user (client or freelancer)."""
    return await contract_service.list_my_contracts(db, current_user.id)

@router.get("/{contract_id}", response_model=ContractResponse)
async def get_contract_by_id(
    contract_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get details of a contract. Restricted to parties of the contract."""
    contract = await contract_service.get_contract(db, contract_id)
    if contract.client_id != current_user.id and contract.freelancer_id != current_user.id:
        raise ForbiddenException("Not authorized to view this contract")
    return contract

@router.post("/{contract_id}/complete", response_model=ContractResponse)
async def complete_contract(
    contract_id: uuid.UUID,
    current_user: User = Depends(RoleChecker(["client"])),
    db: AsyncSession = Depends(get_db)
):
    """Mark a contract as completed. Restricted to the client who owns the contract."""
    return await contract_service.complete_or_cancel_contract(
        db, current_user.id, contract_id, ContractStatus.COMPLETED
    )

@router.post("/{contract_id}/cancel", response_model=ContractResponse)
async def cancel_contract(
    contract_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a contract as cancelled, transitioning the job status to CANCELLED."""
    return await contract_service.complete_or_cancel_contract(
        db, current_user.id, contract_id, ContractStatus.CANCELLED
    )
