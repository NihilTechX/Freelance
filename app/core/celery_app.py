from app.config import settings

celery_app = None

try:
    if settings.CELERY_BROKER_URL and settings.CELERY_BROKER_URL.strip():
        from celery import Celery

        celery_app = Celery(
            "freelance_tasks",
            broker=settings.CELERY_BROKER_URL,
            backend=settings.CELERY_RESULT_BACKEND,
            include=["app.tasks.matching_tasks"]
        )

        celery_app.conf.update(
            task_serializer="json",
            accept_content=["json"],
            result_serializer="json",
            timezone="UTC",
            enable_utc=True,
        )
except Exception:
    celery_app = None
