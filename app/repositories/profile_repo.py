from typing import Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.repositories.base import BaseRepository
from app.models.profile import ClientProfile, FreelancerProfile, Skill
from app.schemas.profile import ClientProfileCreate, ClientProfileUpdate, FreelancerProfileCreate, FreelancerProfileUpdate, SkillCreate

class SkillRepository(BaseRepository[Skill, SkillCreate, SkillCreate]):
    def __init__(self):
        super().__init__(Skill)

    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[Skill]:
        result = await db.execute(select(Skill).filter(func.lower(Skill.name) == name.lower()))
        return result.scalars().first()

    async def get_or_create(self, db: AsyncSession, name: str) -> Skill:
        skill = await self.get_by_name(db, name)
        if not skill:
            skill = Skill(name=name.strip())
            db.add(skill)
            await db.commit()
            await db.refresh(skill)
        return skill

class ClientProfileRepository(BaseRepository[ClientProfile, ClientProfileCreate, ClientProfileUpdate]):
    def __init__(self):
        super().__init__(ClientProfile)

    async def get_by_user_id(self, db: AsyncSession, user_id: Any) -> Optional[ClientProfile]:
        result = await db.execute(select(ClientProfile).filter(ClientProfile.user_id == user_id))
        return result.scalars().first()

class FreelancerProfileRepository(BaseRepository[FreelancerProfile, FreelancerProfileCreate, FreelancerProfileUpdate]):
    def __init__(self):
        super().__init__(FreelancerProfile)

    async def get_by_user_id(self, db: AsyncSession, user_id: Any) -> Optional[FreelancerProfile]:
        result = await db.execute(
            select(FreelancerProfile)
            .filter(FreelancerProfile.user_id == user_id)
            .options(selectinload(FreelancerProfile.skills))
        )
        return result.scalars().first()

    async def get_all_with_relations(self, db: AsyncSession) -> List[FreelancerProfile]:
        result = await db.execute(
            select(FreelancerProfile)
            .options(selectinload(FreelancerProfile.skills))
        )
        return list(result.scalars().all())

skill_repo = SkillRepository()
client_profile_repo = ClientProfileRepository()
freelancer_profile_repo = FreelancerProfileRepository()
