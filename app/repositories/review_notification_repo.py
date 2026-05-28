from typing import Optional, List, Any
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.repositories.base import BaseRepository
from app.models.review_notification import Review, Notification

class ReviewRepository(BaseRepository[Review, Any, Any]):
    def __init__(self):
        super().__init__(Review)

    async def get_by_contract_id(self, db: AsyncSession, contract_id: uuid.UUID) -> List[Review]:
        result = await db.execute(select(Review).filter(Review.contract_id == contract_id))
        return list(result.scalars().all())

    async def get_by_reviewer_id(self, db: AsyncSession, reviewer_id: uuid.UUID) -> List[Review]:
        result = await db.execute(select(Review).filter(Review.reviewer_id == reviewer_id))
        return list(result.scalars().all())

    async def get_by_reviewee_id(self, db: AsyncSession, reviewee_id: uuid.UUID) -> List[Review]:
        result = await db.execute(select(Review).filter(Review.reviewee_id == reviewee_id))
        return list(result.scalars().all())


class NotificationRepository(BaseRepository[Notification, Any, Any]):
    def __init__(self):
        super().__init__(Notification)

    async def get_by_user_id(self, db: AsyncSession, user_id: uuid.UUID, unread_only: bool = False) -> List[Notification]:
        stmt = select(Notification).filter(Notification.user_id == user_id)
        if unread_only:
            stmt = stmt.filter(Notification.is_read == False)
        stmt = stmt.order_by(Notification.created_at.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def mark_all_as_read(self, db: AsyncSession, user_id: uuid.UUID) -> None:
        await db.execute(
            update(Notification)
            .filter(Notification.user_id == user_id, Notification.is_read == False)
            .values(is_read=True)
        )
        await db.commit()

review_repo = ReviewRepository()
notification_repo = NotificationRepository()
