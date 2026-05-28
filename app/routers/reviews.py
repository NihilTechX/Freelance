from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List

from app.database import get_db
from app.schemas.review_notification import ReviewResponse, ReviewCreate
from app.services.review_notification_service import review_service
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Leave a review for a completed contract. The reviewer must be a party to the contract."""
    return await review_service.create_review(db, current_user.id, review_in)

@router.get("/user/{user_id}", response_model=List[ReviewResponse])
async def list_user_reviews(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all reviews received by a specific user."""
    return await review_service.list_reviews_by_user(db, user_id)

@router.get("/contract/{contract_id}", response_model=List[ReviewResponse])
async def list_contract_reviews(
    contract_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get reviews associated with a specific contract."""
    return await review_service.list_reviews_by_contract(db, contract_id)
