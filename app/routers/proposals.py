from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List

from app.database import get_db
from app.schemas.proposal_contract import ProposalResponse, ProposalCreate
from app.services.proposal_contract_service import proposal_service
from app.core.dependencies import get_current_user, RoleChecker
from app.models.user import User
from app.core.exceptions import ForbiddenException

router = APIRouter(prefix="/proposals", tags=["Proposals"])

@router.post("", response_model=ProposalResponse, status_code=status.HTTP_201_CREATED)
async def create_proposal(
    proposal_in: ProposalCreate,
    current_user: User = Depends(RoleChecker(["freelancer"])),
    db: AsyncSession = Depends(get_db)
):
    """Submit a proposal to a job. Restricted to freelancers."""
    return await proposal_service.create_proposal(db, current_user.id, proposal_in)

@router.get("/job/{job_id}", response_model=List[ProposalResponse])
async def list_proposals_by_job(
    job_id: uuid.UUID,
    current_user: User = Depends(RoleChecker(["client"])),
    db: AsyncSession = Depends(get_db)
):
    """List all proposals submitted for a job. Restricted to client owner."""
    return await proposal_service.list_proposals_by_job(db, current_user.id, job_id)

@router.get("/me", response_model=List[ProposalResponse])
async def list_my_proposals(
    current_user: User = Depends(RoleChecker(["freelancer"])),
    db: AsyncSession = Depends(get_db)
):
    """List all proposals submitted by the current freelancer."""
    return await proposal_service.list_my_proposals(db, current_user.id)

@router.get("/{proposal_id}", response_model=ProposalResponse)
async def get_proposal_by_id(
    proposal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get details of a proposal. Restricted to the sender or the job client."""
    proposal = await proposal_service.get_proposal(db, proposal_id)
    # Check authorization safely using proposal values
    # If the user is neither the freelancer nor the client, raise Forbidden
    # Fetch job to get client_id
    from app.repositories.job_repo import job_repo
    job = await job_repo.get(db, proposal.job_id)
    job_owner = job.client_id if job else None
    
    if proposal.freelancer_id != current_user.id and job_owner != current_user.id:
         raise ForbiddenException("Not authorized to view this proposal")
    return proposal
