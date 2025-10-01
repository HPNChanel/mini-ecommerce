"""Category repository."""
from __future__ import annotations

from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.category import Category
from .base import SQLAlchemyRepository


class CategoryRepository(SQLAlchemyRepository[Category]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Category)

    async def list_tree(self) -> list[Category]:
        result = await self.session.execute(select(Category))
        return list(result.scalars().unique().all())
