from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import UserCreate, UserResponse, UserLogin, Token, RefreshTokenRequest
from app.services.auth_service import auth_service
from app.models.user import User
from app.core.dependencies import get_current_user, RoleChecker

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    return await auth_service.register_user(db, user_in)

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate and return JWT tokens."""
    user = await auth_service.authenticate_user(db, user_in)
    return await auth_service.create_tokens(db, user)

@router.post("/refresh", response_model=Token)
async def refresh_token(token_req: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Rotate the refresh token and return new credentials."""
    return await auth_service.refresh_token(db, token_req.refresh_token)

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(token_req: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Revoke the provided refresh token to log out the user."""
    await auth_service.logout(db, token_req.refresh_token)
    return {"detail": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user details."""
    return current_user

@router.get("/admin-only", response_model=UserResponse)
async def admin_only(current_user: User = Depends(RoleChecker(["admin"]))):
    """Admin-only access endpoint."""
    return current_user
