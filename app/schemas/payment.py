from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime
from app.models.payment import PaymentStatus

class PaymentBase(BaseModel):
    amount: float

class PaymentCreate(PaymentBase):
    contract_id: uuid.UUID

class PaymentResponse(PaymentBase):
    id: uuid.UUID
    contract_id: uuid.UUID
    status: PaymentStatus
    stripe_payment_intent_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
