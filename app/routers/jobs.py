from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List

from app.database import get_db
from app.schemas.job import JobResponse, JobCreate, JobUpdate
from app.models.job import JobStatus
from app.services.job_service import job_service
from app.core.dependencies import get_current_user, RoleChecker
from app.models.user import User

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("", response_model=List[JobResponse])
async def list_jobs(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List all jobs in the matching system."""
    return await job_service.list_jobs(db, skip=skip, limit=limit)

@router.get("/{job_id}", response_model=JobResponse)
async def get_job_by_id(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get detailed information about a job by ID."""
    return await job_service.get_job(db, job_id)

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    job_in: JobCreate,
    current_user: User = Depends(RoleChecker(["client"])),
    db: AsyncSession = Depends(get_db)
):
    """Post a new job. Status defaults to Draft. Restricted to clients."""
    return await job_service.create_job(db, current_user.id, job_in)

@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: uuid.UUID,
    job_in: JobUpdate,
    current_user: User = Depends(RoleChecker(["client"])),
    db: AsyncSession = Depends(get_db)
):
    """Update job details. Restricted to the client who created the job."""
    return await job_service.update_job(db, current_user.id, job_id, job_in)

@router.post("/{job_id}/status", response_model=JobResponse)
async def transition_job_status(
    job_id: uuid.UUID,
    new_status: JobStatus,
    current_user: User = Depends(RoleChecker(["client"])),
    db: AsyncSession = Depends(get_db)
):
    """Transition job status (Draft -> Open -> In Progress -> Completed/Cancelled). Restricted to client owner."""
    return await job_service.transition_job_status(db, current_user.id, job_id, new_status)
