"""Order repository."""
from __future__ import annotations

from typing import Optional

from sqlalchemy import Select, func, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.order import Order, OrderStatus
from .base import SQLAlchemyRepository


class OrderRepository(SQLAlchemyRepository[Order]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Order)

    async def list_by_user(
        self, *, user_id: int, status: OrderStatus | None, page: int, page_size: int
    ) -> tuple[list[Order], int]:
        query = (
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.user_id == user_id)
        )
        if status:
            query = query.where(Order.status == status)
        total = await self._count(query)
        query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(query)
        return list(result.scalars().unique().all()), total

    async def list_all(
        self, *, status: OrderStatus | None, page: int, page_size: int
    ) -> tuple[list[Order], int]:
        query = select(Order).options(selectinload(Order.items))
        if status:
            query = query.where(Order.status == status)
        total = await self._count(query)
        query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(query)
        return list(result.scalars().unique().all()), total

    async def get_by_id(self, obj_id: int) -> Order | None:
        result = await self.session.execute(
            select(Order)
                .options(selectinload(Order.items))
                .where(Order.id == obj_id)
        )
        return result.scalar_one_or_none()

    async def _count(self, query: Select) -> int:
        count_query = select(func.count()).select_from(query.subquery())
        result = await self.session.execute(count_query)
        return result.scalar_one()
