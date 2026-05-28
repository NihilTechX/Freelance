import asyncio
import json
import uuid
import redis
from app.core.celery_app import celery_app
from app.database import AsyncSessionLocal
from app.services.matching_service import matching_service
from app.config import settings

# Import all models so SQLAlchemy can resolve relationship() string references
# (e.g. Job -> 'User') when the mapper initializes inside the Celery worker.
import app.models.user          # noqa: F401
import app.models.job           # noqa: F401
import app.models.profile       # noqa: F401
import app.models.proposal_contract  # noqa: F401
import app.models.review_notification  # noqa: F401

# Initialize Redis client for caching
redis_client = redis.from_url(settings.REDIS_URL)

async def _calculate_and_cache_recommendations(job_id_str: str):
    job_uuid = uuid.UUID(job_id_str)
    async with AsyncSessionLocal() as db:
        recommendations = await matching_service.get_matches_for_job(db, job_uuid)
        
        # Serialize matches
        serialized_matches = []
        for r in recommendations:
            serialized_matches.append({
                "freelancer": {
                    "id": str(r.freelancer.id),
                    "user_id": str(r.freelancer.user_id),
                    "title": r.freelancer.title,
                    "bio": r.freelancer.bio,
                    "hourly_rate": float(r.freelancer.hourly_rate),
                    "portfolio_links": r.freelancer.portfolio_links,
                    "skills": [{"id": str(s.id), "name": s.name} for s in r.freelancer.skills]
                },
                "match_score": r.match_score,
                "breakdown": {
                    "text_similarity": r.breakdown.text_similarity,
                    "skill_match": r.breakdown.skill_match,
                    "budget_fit": r.breakdown.budget_fit,
                    "overall_score": r.breakdown.overall_score
                }
            })
        
        # Save to Redis cache for 1 hour
        cache_key = f"job:recs:{job_id_str}"
        redis_client.setex(cache_key, 3600, json.dumps(serialized_matches))
        return serialized_matches

@celery_app.task(name="app.tasks.matching_tasks.calculate_recs")
def calculate_recs_task(job_id_str: str):
    """Celery task to compute matching recommendations and cache in Redis."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_calculate_and_cache_recommendations(job_id_str))
    finally:
        loop.close()

@celery_app.task(name="app.tasks.matching_tasks.send_matching_alert")
def send_matching_alert_task(freelancer_id_str: str, job_id_str: str):
    """Mock background task to simulate emailing matching alerts to freelancers."""
    print(f"[MOCK ALERT] Notifying Freelancer {freelancer_id_str} about highly compatible Job {job_id_str}!")
    return True
