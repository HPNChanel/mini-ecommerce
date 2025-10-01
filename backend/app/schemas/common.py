"""Common schema utilities."""
from __future__ import annotations

from datetime import datetime
from typing import Generic, Optional, Sequence, TypeVar

from pydantic import BaseModel, ConfigDict


T = TypeVar("T")


class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Paginated(Generic[T], BaseModel):
    items: Sequence[T]
    total: int
    page: int
    page_size: int
    pages: int
