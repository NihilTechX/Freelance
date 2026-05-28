from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List

from app.database import get_db
from app.schemas.profile import ClientProfileResponse, ClientProfileCreate, ClientProfileUpdate
from app.schemas.profile import FreelancerProfileResponse, FreelancerProfileCreate, FreelancerProfileUpdate
from app.schemas.profile import SkillResponse
from app.services.profile_service import profile_service
from app.repositories.profile_repo import skill_repo
from app.core.dependencies import get_current_user, RoleChecker
from app.models.user import User

router = APIRouter(prefix="/profiles", tags=["Profiles"])

@router.get("/client/me", response_model=ClientProfileResponse)
async def get_my_client_profile(
    current_user: User = Depends(RoleChecker(["client"])),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve current client's profile."""
    return await profile_service.get_client_profile(db, current_user.id)

@router.get("/client/{user_id}", response_model=ClientProfileResponse)
async def get_client_profile_by_id(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve any client profile by user ID."""
    return await profile_service.get_client_profile(db, user_id)

@router.post("/client", response_model=ClientProfileResponse)
async def create_or_update_client_profile(
    profile_in: ClientProfileCreate,
    current_user: User = Depends(RoleChecker(["client"])),
    db: AsyncSession = Depends(get_db)
):
    """Create or update client profile details."""
    return await profile_service.create_or_update_client_profile(db, current_user.id, profile_in)

@router.get("/freelancer/me", response_model=FreelancerProfileResponse)
async def get_my_freelancer_profile(
    current_user: User = Depends(RoleChecker(["freelancer"])),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve current freelancer's profile."""
    return await profile_service.get_freelancer_profile(db, current_user.id)

@router.get("/freelancer/{user_id}", response_model=FreelancerProfileResponse)
async def get_freelancer_profile_by_id(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve any freelancer profile by user ID."""
    return await profile_service.get_freelancer_profile(db, user_id)

@router.post("/freelancer", response_model=FreelancerProfileResponse)
async def create_or_update_freelancer_profile(
    profile_in: FreelancerProfileCreate,
    current_user: User = Depends(RoleChecker(["freelancer"])),
    db: AsyncSession = Depends(get_db)
):
    """Create or update freelancer profile details, linking/creating skills."""
    return await profile_service.create_or_update_freelancer_profile(db, current_user.id, profile_in)

@router.get("/skills", response_model=List[SkillResponse])
async def list_skills(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List available skill taxonomy in the system."""
    return await skill_repo.get_multi(db, skip=skip, limit=limit)
