"""Authentication endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Response, status

from ..core.deps import get_auth_service, rate_limit
from ..schemas.auth import (
    AuthResponse,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RefreshResponse,
    RegisterRequest,
    TokenPair,
)
from ..schemas.user import UserOut

router = APIRouter(prefix="/auth")


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limit)])
async def register(payload: RegisterRequest, service=Depends(get_auth_service)):
    user = await service.register(payload)
    return UserOut.model_validate(user)


@router.post("/login", response_model=AuthResponse, dependencies=[Depends(rate_limit)])
async def login(payload: LoginRequest, service=Depends(get_auth_service)):
    user, tokens = await service.login(payload)
    return AuthResponse(user=UserOut.model_validate(user), tokens=TokenPair(**tokens))


@router.post("/refresh", response_model=RefreshResponse, dependencies=[Depends(rate_limit)])
async def refresh(payload: RefreshRequest, service=Depends(get_auth_service)):
    tokens = await service.refresh(payload.refresh_token)
    return RefreshResponse(access_token=tokens["access_token"], expires_in=tokens["expires_in"])


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    response_class=Response,
    dependencies=[Depends(rate_limit)],
)
async def logout(payload: LogoutRequest, service=Depends(get_auth_service)) -> None:
    await service.logout(payload.refresh_token)
