from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List, Any
from app.repositories.profile_repo import client_profile_repo, freelancer_profile_repo, skill_repo
from app.models.profile import ClientProfile, FreelancerProfile, Skill
from app.schemas.profile import ClientProfileCreate, ClientProfileUpdate, FreelancerProfileCreate, FreelancerProfileUpdate
from app.core.exceptions import BadRequestException, NotFoundException

class ProfileService:
    async def get_client_profile(self, db: AsyncSession, user_id: Any) -> ClientProfile:
        profile = await client_profile_repo.get_by_user_id(db, user_id)
        if not profile:
            raise NotFoundException("Client profile not found")
        return profile

    async def get_freelancer_profile(self, db: AsyncSession, user_id: Any) -> FreelancerProfile:
        profile = await freelancer_profile_repo.get_by_user_id(db, user_id)
        if not profile:
            raise NotFoundException("Freelancer profile not found")
        return profile

    async def create_or_update_client_profile(
        self, db: AsyncSession, user_id: Any, profile_in: ClientProfileCreate | ClientProfileUpdate
    ) -> ClientProfile:
        profile = await client_profile_repo.get_by_user_id(db, user_id)
        if profile:
            update_data = profile_in.model_dump(exclude_unset=True)
            return await client_profile_repo.update(db, profile, update_data)
        else:
            create_data = profile_in.model_dump()
            create_data["user_id"] = user_id
            return await client_profile_repo.create(db, create_data)

    async def create_or_update_freelancer_profile(
        self, db: AsyncSession, user_id: Any, profile_in: FreelancerProfileCreate | FreelancerProfileUpdate
    ) -> FreelancerProfile:
        profile = await freelancer_profile_repo.get_by_user_id(db, user_id)
        
        # Extract skills if provided
        skills_names = getattr(profile_in, "skills", None)
        
        # Prepare profile data excluding skills list
        profile_data = profile_in.model_dump(exclude={"skills"}, exclude_unset=True)
        
        if profile:
            # Update base fields
            await freelancer_profile_repo.update(db, profile, profile_data)
        else:
            # Create profile
            profile_data["user_id"] = user_id
            await freelancer_profile_repo.create(db, profile_data)
            
        # Re-fetch with skills relation eagerly loaded
        profile = await freelancer_profile_repo.get_by_user_id(db, user_id)
            
        # Update skills list if provided
        if skills_names is not None:
            skills = []
            for name in skills_names:
                skill = await skill_repo.get_or_create(db, name)
                skills.append(skill)
            profile.skills = skills
            db.add(profile)
            await db.commit()
            await db.refresh(profile)
            
            # Eagerly load again after final refresh
            profile = await freelancer_profile_repo.get_by_user_id(db, user_id)
            
        return profile

profile_service = ProfileService()
