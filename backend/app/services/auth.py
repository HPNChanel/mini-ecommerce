"""Authentication service."""
from __future__ import annotations

import datetime as dt

from jose import JWTError

from ..core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    validate_refresh_token,
    verify_password,
)
from ..models.token import TokenType
from ..models.user import User, UserRole
from ..repositories.tokens import TokenRepository
from ..repositories.users import UserRepository
from ..schemas.auth import LoginRequest, RegisterRequest
from ..utils.errors import AppErrorCode, conflict, http_error
from ..core.config import Settings


class AuthService:
    """Service responsible for authentication and token lifecycle."""

    def __init__(
        self,
        *,
        users: UserRepository,
        tokens: TokenRepository,
        settings: Settings,
    ) -> None:
        self.users = users
        self.tokens = tokens
        self.settings = settings

    async def register(self, payload: RegisterRequest) -> User:
        existing = await self.users.get_by_email(payload.email)
        if existing:
            raise conflict("Email already registered")
        user = User(
            email=payload.email,
            hashed_password=get_password_hash(payload.password),
            full_name=payload.name,
            role=UserRole.customer,
        )
        await self.users.add(user)
        return user

    async def login(self, payload: LoginRequest) -> tuple[User, dict[str, str | int]]:
        user = await self.users.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise http_error(status_code=401, detail="Invalid credentials", code=AppErrorCode.UNAUTHORIZED)
        tokens = await self._issue_tokens(user)
        return user, tokens

    async def _issue_tokens(self, user: User) -> dict[str, str | int]:
        access_token = create_access_token(str(user.id))
        refresh_data = create_refresh_token(str(user.id))
        await self.tokens.create_refresh_token(
            user_id=user.id, jti=refresh_data["jti"], expires_at=refresh_data["expires"]
        )
        return {
            "access_token": access_token,
            "refresh_token": refresh_data["token"],
            "expires_in": self.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    async def refresh(self, refresh_token: str) -> dict[str, str | int]:
        try:
            payload = validate_refresh_token(refresh_token)
        except JWTError as exc:
            raise http_error(status_code=401, detail="Invalid refresh token", code=AppErrorCode.UNAUTHORIZED) from exc

        jti = payload.get("jti")
        sub = payload.get("sub")
        if not jti or not sub:
            raise http_error(status_code=401, detail="Invalid token payload", code=AppErrorCode.UNAUTHORIZED)

        if await self.tokens.is_jti_revoked(jti):
            raise http_error(status_code=401, detail="Token revoked", code=AppErrorCode.UNAUTHORIZED)

        user = await self.users.get_by_id(int(sub))
        if not user:
            raise http_error(status_code=401, detail="User not found", code=AppErrorCode.UNAUTHORIZED)

        await self.tokens.revoke_by_jti(jti)
        tokens = await self._issue_tokens(user)
        return tokens

    async def logout(self, refresh_token: str) -> None:
        try:
            payload = validate_refresh_token(refresh_token)
        except JWTError as exc:
            raise http_error(status_code=401, detail="Invalid refresh token", code=AppErrorCode.UNAUTHORIZED) from exc
        jti = payload.get("jti")
        if jti:
            await self.tokens.revoke_by_jti(jti)
