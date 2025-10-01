"""Cart repository."""
from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.cart import Cart, CartItem, CartStatus
from .base import SQLAlchemyRepository


class CartRepository(SQLAlchemyRepository[Cart]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Cart)

    async def get_user_draft_cart(self, user_id: int) -> Optional[Cart]:
        result = await self.session.execute(
            select(Cart)
            .options(selectinload(Cart.items).selectinload(CartItem.product))
            .where(Cart.user_id == user_id, Cart.status == CartStatus.draft)
        )
        return result.scalar_one_or_none()

    async def add_item(self, cart: Cart, item: CartItem) -> CartItem:
        cart.items.append(item)
        await self.session.flush()
        return item

    async def get_item(self, cart_id: int, item_id: int) -> Optional[CartItem]:
        result = await self.session.execute(
            select(CartItem)
            .options(selectinload(CartItem.product))
            .where(CartItem.cart_id == cart_id, CartItem.id == item_id)
        )
        return result.scalar_one_or_none()
