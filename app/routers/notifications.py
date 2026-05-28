from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List

from app.database import get_db
from app.schemas.review_notification import NotificationResponse
from app.services.review_notification_service import notification_service
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
async def list_my_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve notifications for the current user."""
    return await notification_service.list_my_notifications(db, current_user.id, unread_only=unread_only)

@router.post("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a specific notification as read."""
    return await notification_service.mark_notification_as_read(db, current_user.id, notification_id)

@router.post("/read-all")
async def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark all notifications for the current user as read."""
    await notification_service.mark_all_as_read(db, current_user.id)
    return {"message": "All notifications marked as read"}
