from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List
import redis
import json

from app.database import get_db
from app.schemas.matching import FreelancerMatchResponse
from app.services.matching_service import matching_service
from app.core.dependencies import get_current_user
from app.models.user import User
from app.config import settings
from app.tasks.matching_tasks import calculate_recs_task

router = APIRouter(prefix="/jobs", tags=["Matching"])

redis_client = redis.from_url(settings.REDIS_URL)

@router.get("/{job_id}/recommendations", response_model=List[FreelancerMatchResponse])
async def get_job_recommendations(
    job_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve ranked freelancer match recommendations for a job. Checks cache first."""
    cache_key = f"job:recs:{str(job_id)}"
    try:
        cached_recs = redis_client.get(cache_key)
        if cached_recs:
            return json.loads(cached_recs)
    except Exception:
        pass

    # Cache miss: compute recommendations
    results = await matching_service.get_matches_for_job(db, job_id)

    # Trigger background Celery task to cache results
    try:
        calculate_recs_task.delay(str(job_id))
    except Exception:
        pass

    return results
