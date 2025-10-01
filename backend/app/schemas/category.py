"""Category schemas."""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field

from .common import ORMBase


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    slug: str = Field(min_length=1, max_length=120)
    parent_id: Optional[int] = None


class CategoryOut(ORMBase):
    id: int
    name: str
    slug: str
    parent_id: Optional[int]
    children: List["CategoryOut"] = Field(default_factory=list)


CategoryOut.model_rebuild()
