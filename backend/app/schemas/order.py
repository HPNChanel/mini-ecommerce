"""Order schemas."""
from __future__ import annotations

from datetime import datetime
from typing import List

from pydantic import BaseModel

from ..models.order import OrderStatus
from .common import ORMBase


class CheckoutRequest(BaseModel):
    cart_id: int


class CheckoutResponse(BaseModel):
    order_id: int
    payment_ref: str
    client_secret: str


class MockPaymentWebhook(BaseModel):
    payment_ref: str


class OrderItemOut(ORMBase):
    id: int
    product_id: int
    sku_snapshot: str
    name_snapshot: str
    price_cents: int
    qty: int


class OrderOut(ORMBase):
    id: int
    status: OrderStatus
    total_cents: int
    currency: str
    payment_ref: str | None
    created_at: datetime
    items: List[OrderItemOut]


class OrderListFilter(BaseModel):
    status: OrderStatus | None = None
    page: int = 1
    page_size: int = 20
