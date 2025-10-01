"""User schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import EmailStr

from ..models.user import UserRole
from .common import ORMBase


class UserOut(ORMBase):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
