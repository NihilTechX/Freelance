from pydantic import BaseModel, Field
import uuid
from datetime import datetime
from typing import Optional
from app.models.proposal_contract import ProposalStatus, ContractStatus

class ProposalBase(BaseModel):
    rate: float = Field(gt=0)
    cover_letter: str = Field(min_length=10)

class ProposalCreate(ProposalBase):
    job_id: uuid.UUID

class ProposalUpdate(BaseModel):
    rate: Optional[float] = Field(None, gt=0)
    cover_letter: Optional[str] = Field(None, min_length=10)
    status: Optional[ProposalStatus] = None

class ProposalResponse(ProposalBase):
    id: uuid.UUID
    job_id: uuid.UUID
    freelancer_id: uuid.UUID
    status: ProposalStatus
    created_at: datetime

    class Config:
        from_attributes = True

class ContractBase(BaseModel):
    budget: float = Field(gt=0)
    end_date: Optional[datetime] = None

class ContractCreate(BaseModel):
    proposal_id: uuid.UUID

class ContractUpdate(BaseModel):
    status: Optional[ContractStatus] = None
    end_date: Optional[datetime] = None

class ContractResponse(ContractBase):
    id: uuid.UUID
    job_id: uuid.UUID
    client_id: uuid.UUID
    freelancer_id: uuid.UUID
    proposal_id: uuid.UUID
    status: ContractStatus
    start_date: datetime

    class Config:
        from_attributes = True
