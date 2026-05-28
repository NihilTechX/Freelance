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

    return application


app = create_app()
