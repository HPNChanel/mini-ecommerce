"""Cart schemas."""
from __future__ import annotations

from typing import List

from pydantic import BaseModel, Field

from ..models.cart import CartStatus
from .common import ORMBase
from .product import ProductOut


class CartItemCreate(BaseModel):
    product_id: int
    qty: int = Field(ge=1, le=99)


class CartItemUpdate(BaseModel):
    qty: int = Field(ge=1, le=99)


class CartItemOut(ORMBase):
    id: int
    qty: int
    product: ProductOut


class CartOut(ORMBase):
    id: int
    status: CartStatus
    items: List[CartItemOut]
