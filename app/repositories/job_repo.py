from typing import Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.repositories.base import BaseRepository
from app.models.job import Job, JobStatus

class JobRepository(BaseRepository[Job, Any, Any]):
    def __init__(self):
        super().__init__(Job)

    async def get_with_skills(self, db: AsyncSession, id: Any) -> Optional[Job]:
        result = await db.execute(
            select(Job)
            .filter(Job.id == id)
            .options(selectinload(Job.skills))
        )
        return result.scalars().first()

    async def get_multi_with_skills(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Job]:
        result = await db.execute(
            select(Job)
            .options(selectinload(Job.skills))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_client_id(self, db: AsyncSession, client_id: Any) -> List[Job]:
        result = await db.execute(
            select(Job)
            .filter(Job.client_id == client_id)
            .options(selectinload(Job.skills))
        )
        return list(result.scalars().all())

job_repo = JobRepository()
