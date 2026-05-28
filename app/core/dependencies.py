from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError, jwt
from typing import List, Any

from app.database import get_db
from app.config import settings
from app.repositories.user_repo import user_repo
from app.models.user import User
from app.core.exceptions import UnauthorizedException, ForbiddenException

# auto_error=False lets us return 401 instead of FastAPI's default 403
# when no Authorization header is present.
security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency to retrieve the current authenticated user from JWT token."""
    if credentials is None:
        raise UnauthorizedException("Not authenticated")
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = payload.get("sub")
        if not user_id:
            raise UnauthorizedException("Could not validate credentials")
    except JWTError:
        raise UnauthorizedException("Could not validate credentials")

    user = await user_repo.get(db, user_id)
    if not user:
        raise UnauthorizedException("User not found")
        
    if not user.is_active:
        raise UnauthorizedException("User is inactive")
        
    return user


class RoleChecker:
    """Dependency to restrict access to endpoints based on user roles."""
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise ForbiddenException("Operation not permitted for this role")
        return current_user
