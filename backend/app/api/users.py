"""User endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends

from ..core.deps import require_user
from ..schemas.user import UserOut

router = APIRouter(prefix="/users")


@router.get("/me", response_model=UserOut)
async def get_me(current_user=Depends(require_user)):
    return UserOut.model_validate(current_user)
