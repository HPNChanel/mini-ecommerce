"""Product schemas."""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, HttpUrl, field_validator

from .common import ORMBase
from ..core.config import settings


class ProductImageIn(BaseModel):
    url: HttpUrl
    alt: Optional[str] = None


class ProductCreate(BaseModel):
    sku: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=255)
    slug: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    price_cents: int = Field(ge=0)
    currency: str = Field(min_length=3, max_length=3)
    stock: int = Field(ge=0)
    category_id: Optional[int] = None
    images: List[ProductImageIn] = Field(default_factory=list)

    @field_validator("images")
    @classmethod
    def validate_images(cls, images: List[ProductImageIn]) -> List[ProductImageIn]:
        import re

        pattern = re.compile(settings.IMAGE_URL_PATTERN)
        for image in images:
            if not pattern.match(str(image.url)):
                raise ValueError("Image URL not allowed")
        return images


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    price_cents: Optional[int] = Field(default=None, ge=0)
    currency: Optional[str] = Field(default=None, min_length=3, max_length=3)
    stock: Optional[int] = Field(default=None, ge=0)
    is_active: Optional[bool] = None
    category_id: Optional[int] = None
    images: Optional[List[ProductImageIn]] = None

    @field_validator("images")
    @classmethod
    def validate_update_images(cls, images: Optional[List[ProductImageIn]]):
        if images is None:
            return images
        import re

        pattern = re.compile(settings.IMAGE_URL_PATTERN)
        for image in images:
            if not pattern.match(str(image.url)):
                raise ValueError("Image URL not allowed")
        return images


class ProductImageOut(ORMBase):
    id: int
    url: HttpUrl
    alt: Optional[str]


class ProductOut(ORMBase):
    id: int
    sku: str
    name: str
    slug: str
    description: Optional[str]
    price_cents: int
    currency: str
    stock: int
    is_active: bool
    created_at: datetime
    category_id: Optional[int]
    images: List[ProductImageOut]
