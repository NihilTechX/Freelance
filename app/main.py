from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, profiles, jobs, matching, proposals, contracts, reviews, notifications
from app.core.exceptions import register_exception_handlers


def create_app() -> FastAPI:
    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(auth.router, prefix="/api/v1")
    application.include_router(profiles.router, prefix="/api/v1")
    application.include_router(jobs.router, prefix="/api/v1")
    application.include_router(matching.router, prefix="/api/v1")
    application.include_router(proposals.router, prefix="/api/v1")
    application.include_router(contracts.router, prefix="/api/v1")
    application.include_router(reviews.router, prefix="/api/v1")
    application.include_router(notifications.router, prefix="/api/v1")

    register_exception_handlers(application)

    @application.get("/health", tags=["System"])
    async def health_check():
        return {
            "status": "ok",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
        }

    @application.get("/debug", tags=["System"])
    async def debug_info():
        """Temporary debug endpoint — remove after deployment is verified."""
        import traceback
        from app.database import engine, _db_url
        info = {
            "cors_origins": settings.CORS_ORIGINS,
            "db_url_prefix": _db_url[:40] + "...",
            "db_url_has_sslmode": "sslmode" in _db_url,
            "db_url_has_ssl": "ssl=require" in _db_url,
            "redis_url_set": bool(settings.REDIS_URL and settings.REDIS_URL.strip()),
            "celery_broker_set": bool(settings.CELERY_BROKER_URL and settings.CELERY_BROKER_URL.strip()),
        }
        # Test DB connection
        try:
            from sqlalchemy import text
            async with engine.connect() as conn:
                result = await conn.execute(text("SELECT 1"))
                info["db_connection"] = "OK"
        except Exception as e:
            info["db_connection"] = f"FAILED: {type(e).__name__}: {str(e)}"
        # Test register flow
        try:
            from sqlalchemy.ext.asyncio import AsyncSession
            from app.database import AsyncSessionLocal
            from app.core.security import get_password_hash
            from app.models.user import User
            async with AsyncSessionLocal() as db:
                test_user = User(
                    email="__debug_test__@test.com",
                    hashed_password=get_password_hash("TestPass123!"),
                    role="freelancer"
                )
                db.add(test_user)
                await db.flush()  # test insert without committing
                await db.rollback()  # rollback test user
                info["register_flow"] = "OK"
        except Exception as e:
            info["register_flow"] = f"FAILED: {type(e).__name__}: {str(e)}"
            info["register_traceback"] = traceback.format_exc()
        return info

    return application


app = create_app()
