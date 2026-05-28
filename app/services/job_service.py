from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Any
from app.repositories.job_repo import job_repo
from app.repositories.profile_repo import skill_repo
from app.models.job import Job, JobStatus
from app.schemas.job import JobCreate, JobUpdate
from app.core.exceptions import BadRequestException, NotFoundException, ForbiddenException

class JobService:
    VALID_TRANSITIONS = {
        JobStatus.DRAFT: {JobStatus.OPEN, JobStatus.CANCELLED},
        JobStatus.OPEN: {JobStatus.IN_PROGRESS, JobStatus.CANCELLED},
        JobStatus.IN_PROGRESS: {JobStatus.COMPLETED, JobStatus.CANCELLED},
        JobStatus.COMPLETED: set(),
        JobStatus.CANCELLED: set()
    }

    async def get_job(self, db: AsyncSession, job_id: Any) -> Job:
        job = await job_repo.get_with_skills(db, job_id)
        if not job:
            raise NotFoundException("Job not found")
        return job

    async def list_jobs(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Job]:
        return await job_repo.get_multi_with_skills(db, skip=skip, limit=limit)

    async def create_job(self, db: AsyncSession, client_id: Any, job_in: JobCreate) -> Job:
        # Create job dict
        job_data = job_in.model_dump(exclude={"skills"})
        job_data["client_id"] = client_id
        job_data["status"] = JobStatus.DRAFT

        db_job = await job_repo.create(db, job_data)

        # Re-fetch with skills relation eagerly loaded
        db_job = await job_repo.get_with_skills(db, db_job.id)

        # Resolve skills
        if job_in.skills:
            skills = []
            for name in job_in.skills:
                skill = await skill_repo.get_or_create(db, name)
                skills.append(skill)
            db_job.skills = skills
            db.add(db_job)
            await db.commit()
            await db.refresh(db_job)
            
            # Eagerly load again after final refresh
            db_job = await job_repo.get_with_skills(db, db_job.id)

        return db_job

    async def update_job(self, db: AsyncSession, client_id: Any, job_id: Any, job_in: JobUpdate) -> Job:
        db_job = await self.get_job(db, job_id)

        # Verify client ownership
        if db_job.client_id != client_id:
            raise ForbiddenException("Not authorized to modify this job")

        # Extract skills update if provided
        skills_names = job_in.skills
        update_data = job_in.model_dump(exclude={"skills"}, exclude_unset=True)

        # Apply basic field updates
        await job_repo.update(db, db_job, update_data)

        # Re-fetch with skills relation eagerly loaded
        db_job = await job_repo.get_with_skills(db, job_id)

        # Apply skills updates
        if skills_names is not None:
            skills = []
            for name in skills_names:
                skill = await skill_repo.get_or_create(db, name)
                skills.append(skill)
            db_job.skills = skills
            db.add(db_job)
            await db.commit()
            await db.refresh(db_job)
            
            # Eagerly load again after final refresh
            db_job = await job_repo.get_with_skills(db, job_id)

        return db_job

    async def transition_job_status(self, db: AsyncSession, client_id: Any, job_id: Any, new_status: JobStatus) -> Job:
        db_job = await self.get_job(db, job_id)

        # Verify ownership
        if db_job.client_id != client_id:
            raise ForbiddenException("Not authorized to modify this job")

        # Validate transition
        current_status = db_job.status
        if new_status not in self.VALID_TRANSITIONS[current_status]:
            raise BadRequestException(f"Invalid status transition from {current_status} to {new_status}")

        # Update status
        db_job.status = new_status
        db.add(db_job)
        await db.commit()
        await db.refresh(db_job)
        return db_job

job_service = JobService()
