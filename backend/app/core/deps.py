"""FastAPI dependencies for the application."""
from __future__ import annotations

from typing import AsyncGenerator, Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import async_session_factory
from ..models import user as user_model
from ..repositories.carts import CartRepository
from ..repositories.categories import CategoryRepository
from ..repositories.orders import OrderRepository
from ..repositories.products import ProductRepository
from ..repositories.tokens import TokenRepository
from ..repositories.users import UserRepository
from ..services.auth import AuthService
from ..services.cart import CartService
from ..services.catalog import CatalogService
from ..services.orders import OrderService, PaymentProvider
from .config import settings
from .security import decode_token
from ..utils.errors import AppErrorCode


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(get_db)],
) -> user_model.User:
    repo = UserRepository(session)
    token_repo = TokenRepository(session)
    try:
        payload = decode_token(token)
    except JWTError as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    jti = payload.get("jti")
    if jti and await token_repo.is_jti_revoked(jti):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")

    user = await repo.get_by_id(int(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user")
    return user


async def require_user(
    current_user: Annotated[user_model.User, Depends(get_current_user)]
) -> user_model.User:
    return current_user


async def require_admin(
    current_user: Annotated[user_model.User, Depends(get_current_user)]
) -> user_model.User:
    if current_user.role != user_model.UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"detail": "Insufficient permissions", "code": AppErrorCode.FORBIDDEN},
        )
    return current_user


async def get_auth_service(
    session: Annotated[AsyncSession, Depends(get_db)]
) -> AuthService:
    return AuthService(
        users=UserRepository(session),
        tokens=TokenRepository(session),
        settings=settings,
    )


async def get_catalog_service(
    session: Annotated[AsyncSession, Depends(get_db)]
) -> CatalogService:
    return CatalogService(
        products=ProductRepository(session),
        categories=CategoryRepository(session),
    )


async def get_cart_service(
    session: Annotated[AsyncSession, Depends(get_db)]
) -> CartService:
    return CartService(
        carts=CartRepository(session),
        products=ProductRepository(session),
        session=session,
    )


async def get_order_service(
    session: Annotated[AsyncSession, Depends(get_db)]
) -> OrderService:
    return OrderService(
        orders=OrderRepository(session),
        products=ProductRepository(session),
        session=session,
        payment_provider=PaymentProvider(),
    )


async def get_order_repository(
    session: Annotated[AsyncSession, Depends(get_db)]
) -> OrderRepository:
    return OrderRepository(session)


class RateLimiter:
    """Naive in-memory token bucket rate limiter."""

    def __init__(self, capacity: int, window_seconds: int) -> None:
        self.capacity = capacity
        self.window = window_seconds
        self._counters: dict[str, tuple[int, float]] = {}

    def check(self, key: str) -> bool:
        import time

        now = time.monotonic()
        tokens, last = self._counters.get(key, (self.capacity, now))
        elapsed = now - last
        refill = int(elapsed / self.window) * self.capacity
        tokens = min(self.capacity, tokens + refill)
        if tokens <= 0:
            self._counters[key] = (tokens, now)
            return False
        self._counters[key] = (tokens - 1, now)
        return True


rate_limiter = RateLimiter(
    capacity=settings.RATE_LIMIT_REQUESTS, window_seconds=settings.RATE_LIMIT_WINDOW_SECONDS
)


async def rate_limit(request: Request) -> None:
    client = request.client.host if request.client else "anonymous"
    key = f"{client}:{request.url.path}"
    if not rate_limiter.check(key):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded")
