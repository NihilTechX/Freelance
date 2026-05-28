from typing import Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from app.repositories.base import BaseRepository
from app.models.user import User, RefreshToken
from app.schemas.auth import UserCreate

class UserRepository(BaseRepository[User, UserCreate, UserCreate]):
    def __init__(self):
        super().__init__(User)

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(select(User).filter(func.lower(User.email) == email.lower()))
        return result.scalars().first()

    async def get_valid_refresh_token(self, db: AsyncSession, token_hash: str) -> Optional[RefreshToken]:
        result = await db.execute(
            select(RefreshToken)
            .filter(RefreshToken.token_hash == token_hash)
            .filter(RefreshToken.is_revoked == False)
        )
        return result.scalars().first()

    async def get_refresh_token_by_hash(self, db: AsyncSession, token_hash: str) -> Optional[RefreshToken]:
        result = await db.execute(
            select(RefreshToken).filter(RefreshToken.token_hash == token_hash)
        )
        return result.scalars().first()

    async def revoke_refresh_token(self, db: AsyncSession, token_id: Any):
        await db.execute(
            update(RefreshToken)
            .filter(RefreshToken.id == token_id)
            .values(is_revoked=True)
        )
        await db.commit()

    async def revoke_all_user_refresh_tokens(self, db: AsyncSession, user_id: Any):
        await db.execute(
            update(RefreshToken)
            .filter(RefreshToken.user_id == user_id)
            .values(is_revoked=True)
        )
        await db.commit()
    
    async def save_refresh_token(self, db: AsyncSession, token_data: dict) -> RefreshToken:
        db_token = RefreshToken(**token_data)
        db.add(db_token)
        await db.commit()
        await db.refresh(db_token)
        return db_token

user_repo = UserRepository()
