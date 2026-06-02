from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List
import json

from app.database import get_db
from app.schemas.matching import FreelancerMatchResponse
from app.services.matching_service import matching_service
from app.core.dependencies import get_current_user
from app.models.user import User
from app.config import settings

router = APIRouter(prefix="/jobs", tags=["Matching"])

# Redis is optional — gracefully degrade if not configured
_redis_client = None
try:
    if settings.REDIS_URL and settings.REDIS_URL.strip():
        import redis
        _redis_client = redis.from_url(settings.REDIS_URL)
        _redis_client.ping()  # verify connection
except Exception:
    _redis_client = None

@router.get("/{job_id}/recommendations", response_model=List[FreelancerMatchResponse])
async def get_job_recommendations(
    job_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve ranked freelancer match recommendations for a job. Checks cache first."""
    cache_key = f"job:recs:{str(job_id)}"

    # Try to get from Redis cache
    if _redis_client:
        try:
            cached_recs = _redis_client.get(cache_key)
            if cached_recs:
                return json.loads(cached_recs)
        except Exception:
            pass

    # Cache miss or no Redis: compute recommendations synchronously
    results = await matching_service.get_matches_for_job(db, job_id)

    # Try to cache results in Redis for next time
    if _redis_client:
        try:
            from app.tasks.matching_tasks import calculate_recs_task
            calculate_recs_task.delay(str(job_id))
        except Exception:
            pass

    return results
