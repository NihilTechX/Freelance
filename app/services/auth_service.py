from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.auth import UserCreate, UserLogin, Token
from app.models.user import User
from app.repositories.user_repo import user_repo
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.exceptions import BadRequestException, UnauthorizedException
from app.config import settings
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError

class AuthService:
    async def register_user(self, db: AsyncSession, user_in: UserCreate) -> User:
        """Registers a new user after verifying email isn't taken."""
        existing_user = await user_repo.get_by_email(db, user_in.email)
        if existing_user:
            raise BadRequestException("Email already registered")

        hashed_password = get_password_hash(user_in.password)
        
        # Pydantic schemas are passed to repo, mapping to models
        db_user = await user_repo.create(db, {
            "email": user_in.email.lower(),
            "hashed_password": hashed_password,
            "role": user_in.role
        })
        
        return db_user

    async def authenticate_user(self, db: AsyncSession, user_in: UserLogin) -> User:
        """Verifies credentials."""
        user = await user_repo.get_by_email(db, user_in.email)
        if not user:
            raise UnauthorizedException("Incorrect email or password")
        
        if not verify_password(user_in.password, user.hashed_password):
            raise UnauthorizedException("Incorrect email or password")
            
        return user

    async def create_tokens(self, db: AsyncSession, user: User) -> Token:
        """Generates new access and refresh tokens, saving the refresh token in DB."""
        access_token = create_access_token(subject=user.id)
        
        # Create refresh token
        refresh_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        refresh_token_plain = create_access_token(subject=user.id, expires_delta=refresh_expires)
        
        # In a real system, you might hash the refresh token before storing
        await user_repo.save_refresh_token(db, {
            "user_id": user.id,
            "token_hash": refresh_token_plain,
            "expires_at": datetime.now(timezone.utc) + refresh_expires
        })
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token_plain,
            token_type="bearer"
        )

    async def refresh_token(self, db: AsyncSession, refresh_token: str) -> Token:
        """Rotates the refresh token and returns a new access/refresh token pair.
        Implements token reuse detection.
        """
        try:
            payload = jwt.decode(
                refresh_token, 
                settings.JWT_SECRET_KEY, 
                algorithms=[settings.JWT_ALGORITHM]
            )
            user_id = payload.get("sub")
            if not user_id:
                raise UnauthorizedException("Invalid refresh token")
        except ExpiredSignatureError:
            raise UnauthorizedException("Refresh token has expired")
        except JWTError:
            raise UnauthorizedException("Invalid refresh token")

        # Fetch the token from DB (regardless of revocation status)
        db_token = await user_repo.get_refresh_token_by_hash(db, refresh_token)
        if not db_token:
            raise UnauthorizedException("Invalid refresh token")

        # Reuse Detection: If token is already revoked, revoke all tokens for this user
        if db_token.is_revoked:
            await user_repo.revoke_all_user_refresh_tokens(db, db_token.user_id)
            raise UnauthorizedException("Invalid refresh token")

        # Check if the DB token is expired (backup check to the JWT exp claim check)
        if db_token.expires_at < datetime.now(timezone.utc):
            raise UnauthorizedException("Refresh token has expired")

        # Get user
        user = await user_repo.get(db, db_token.user_id)
        if not user:
            raise UnauthorizedException("User not found")

        # Revoke the current refresh token
        await user_repo.revoke_refresh_token(db, db_token.id)

        # Create new tokens (this generates a new access token and fresh refresh token, saving it to DB)
        return await self.create_tokens(db, user)

    async def logout(self, db: AsyncSession, refresh_token: str):
        """Revokes the provided refresh token."""
        try:
            # Verify signature first (ignore expiration so users can log out even with expired tokens)
            jwt.decode(
                refresh_token, 
                settings.JWT_SECRET_KEY, 
                algorithms=[settings.JWT_ALGORITHM],
                options={"verify_exp": False}
            )
        except JWTError:
            raise UnauthorizedException("Invalid refresh token")

        db_token = await user_repo.get_refresh_token_by_hash(db, refresh_token)
        if db_token:
            await user_repo.revoke_refresh_token(db, db_token.id)

auth_service = AuthService()
