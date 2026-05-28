from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Any
import uuid

from app.repositories.review_notification_repo import review_repo, notification_repo
from app.repositories.proposal_contract_repo import contract_repo
from app.models.review_notification import Review, Notification
from app.models.proposal_contract import ContractStatus
from app.schemas.review_notification import ReviewCreate, NotificationBase
from app.core.exceptions import BadRequestException, NotFoundException, ForbiddenException

class ReviewService:
    async def create_review(self, db: AsyncSession, reviewer_id: uuid.UUID, review_in: ReviewCreate) -> Review:
        contract = await contract_repo.get(db, review_in.contract_id)
        if not contract:
            raise NotFoundException("Contract not found")

        # The contract status must be COMPLETED
        if contract.status != ContractStatus.COMPLETED:
            raise BadRequestException("Can only review completed contracts")

        # Reviewer must be party to the contract
        if contract.client_id != reviewer_id and contract.freelancer_id != reviewer_id:
            raise ForbiddenException("Not authorized to review this contract")

        # Check if already reviewed
        existing_reviews = await review_repo.get_by_contract_id(db, contract.id)
        for r in existing_reviews:
            if r.reviewer_id == reviewer_id:
                raise BadRequestException("You have already submitted a review for this contract")

        # Set reviewee_id
        if reviewer_id == contract.client_id:
            reviewee_id = contract.freelancer_id
        else:
            reviewee_id = contract.client_id

        review_data = {
            "contract_id": contract.id,
            "reviewer_id": reviewer_id,
            "reviewee_id": reviewee_id,
            "rating": review_in.rating,
            "comment": review_in.comment
        }
        db_review = await review_repo.create(db, review_data)

        # Trigger notification to the reviewee
        await notification_service.create_notification(
            db,
            user_id=reviewee_id,
            title="New Review Received",
            message=f"You received a rating of {review_in.rating} stars for your recent contract."
        )

        return db_review

    async def list_reviews_by_user(self, db: AsyncSession, user_id: uuid.UUID) -> List[Review]:
        return await review_repo.get_by_reviewee_id(db, user_id)

    async def list_reviews_by_contract(self, db: AsyncSession, contract_id: uuid.UUID) -> List[Review]:
        return await review_repo.get_by_contract_id(db, contract_id)


class NotificationService:
    async def create_notification(self, db: AsyncSession, user_id: uuid.UUID, title: str, message: str) -> Notification:
        notification_data = {
            "user_id": user_id,
            "title": title,
            "message": message,
            "is_read": False
        }
        return await notification_repo.create(db, notification_data)

    async def list_my_notifications(self, db: AsyncSession, user_id: uuid.UUID, unread_only: bool = False) -> List[Notification]:
        return await notification_repo.get_by_user_id(db, user_id, unread_only=unread_only)

    async def mark_notification_as_read(self, db: AsyncSession, user_id: uuid.UUID, notification_id: uuid.UUID) -> Notification:
        notification = await notification_repo.get(db, notification_id)
        if not notification:
            raise NotFoundException("Notification not found")
        if notification.user_id != user_id:
            raise ForbiddenException("Not authorized to modify this notification")

        notification.is_read = True
        db.add(notification)
        await db.commit()
        await db.refresh(notification)
        return notification

    async def mark_all_as_read(self, db: AsyncSession, user_id: uuid.UUID) -> None:
        await notification_repo.mark_all_as_read(db, user_id)


review_service = ReviewService()
notification_service = NotificationService()
