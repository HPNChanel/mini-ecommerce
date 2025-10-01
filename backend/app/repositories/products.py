"""Product repository."""
from __future__ import annotations

from typing import List, Optional

from sqlalchemy import Select, and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.product import Product, ProductImage
from .base import SQLAlchemyRepository


class ProductRepository(SQLAlchemyRepository[Product]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Product)

    def _apply_filters(
        self,
        query: Select,
        *,
        q: str | None = None,
        category_id: int | None = None,
        min_price: int | None = None,
        max_price: int | None = None,
    ) -> Select:
        conditions = []
        if q:
            like = f"%{q.lower()}%"
            conditions.append(func.lower(Product.name).like(like))
        if category_id:
            conditions.append(Product.category_id == category_id)
        if min_price is not None:
            conditions.append(Product.price_cents >= min_price)
        if max_price is not None:
            conditions.append(Product.price_cents <= max_price)
        if conditions:
            query = query.where(and_(*conditions))
        return query

    async def search(
        self,
        *,
        q: str | None = None,
        category_id: int | None = None,
        min_price: int | None = None,
        max_price: int | None = None,
        sort: str | None = None,
        page: int,
        page_size: int,
    ) -> tuple[list[Product], int]:
        query = select(Product).where(Product.is_active.is_(True))
        query = self._apply_filters(
            query, q=q, category_id=category_id, min_price=min_price, max_price=max_price
        )

        if sort == "price_asc":
            query = query.order_by(Product.price_cents.asc())
        elif sort == "price_desc":
            query = query.order_by(Product.price_cents.desc())
        else:
            query = query.order_by(Product.created_at.desc())

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.session.execute(count_query)
        total = total_result.scalar_one()

        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(query)
        return list(result.scalars().unique().all()), total

    async def create_with_images(self, product: Product, images: list[ProductImage]) -> Product:
        await self.add(product)
        for image in images:
            image.product_id = product.id
            self.session.add(image)
        await self.session.flush()
        return product

    async def replace_images(self, product: Product, images: list[ProductImage]) -> None:
        await self.session.execute(
            ProductImage.__table__.delete().where(ProductImage.product_id == product.id)
        )
        for image in images:
            image.product_id = product.id
            self.session.add(image)
        await self.session.flush()
