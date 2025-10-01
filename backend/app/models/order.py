"""Order models."""
from __future__ import annotations

import datetime as dt
from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SQLEnum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..db.session import Base


class OrderStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    shipped = "shipped"
    completed = "completed"
    cancelled = "cancelled"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.pending, nullable=False, index=True)
    total_cents = Column(Integer, nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    payment_ref = Column(String(100), unique=True, nullable=True, index=True)
    created_at = Column(DateTime, default=dt.datetime.utcnow, nullable=False)
    paid_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    sku_snapshot = Column(String(64), nullable=False)
    name_snapshot = Column(String(255), nullable=False)
    price_cents = Column(Integer, nullable=False)
    qty = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
