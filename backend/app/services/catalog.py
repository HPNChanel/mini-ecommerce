"""Catalog services."""
from __future__ import annotations

from typing import List, Optional

from ..models.category import Category
from ..models.product import Product, ProductImage
from ..repositories.categories import CategoryRepository
from ..repositories.products import ProductRepository
from ..schemas.product import ProductCreate, ProductUpdate
from ..utils.errors import not_found


class CatalogService:
    def __init__(self, *, products: ProductRepository, categories: CategoryRepository) -> None:
        self.products = products
        self.categories = categories

    async def get_product(self, identifier: str) -> Product:
        product = None
        if identifier.isdigit():
            product = await self.products.get_by_id(int(identifier))
        if not product:
            from sqlalchemy import select

            result = await self.products.session.execute(
                select(Product).where(Product.slug == identifier)
            )
            product = result.scalar_one_or_none()
        if not product:
            raise not_found("Product not found")
        return product

    async def list_categories(self) -> list[Category]:
        categories = await self.categories.list_tree()
        by_parent: dict[int | None, list[Category]] = {}
        for category in categories:
            by_parent.setdefault(category.parent_id, []).append(category)

        def attach_children(node: Category) -> None:
            node.children = by_parent.get(node.id, [])
            for child in node.children:
                attach_children(child)

        roots = by_parent.get(None, [])
        for root in roots:
            attach_children(root)
        return roots

    async def search_products(
        self,
        *,
        q: str | None,
        category_id: int | None,
        min_price: int | None,
        max_price: int | None,
        sort: str | None,
        page: int,
        page_size: int,
    ) -> tuple[list[Product], int]:
        return await self.products.search(
            q=q,
            category_id=category_id,
            min_price=min_price,
            max_price=max_price,
            sort=sort,
            page=page,
            page_size=page_size,
        )

    async def create_product(self, payload: ProductCreate) -> Product:
        product = Product(
            sku=payload.sku,
            name=payload.name,
            slug=payload.slug,
            description=payload.description,
            price_cents=payload.price_cents,
            currency=payload.currency,
            stock=payload.stock,
            category_id=payload.category_id,
        )
        images = [ProductImage(url=image.url, alt=image.alt) for image in payload.images]
        return await self.products.create_with_images(product, images)

    async def update_product(self, product: Product, payload: ProductUpdate) -> Product:
        data = payload.model_dump(exclude_unset=True)
        images = data.pop("images", None)
        for key, value in data.items():
            setattr(product, key, value)
        if images is not None:
            await self.products.replace_images(product, [ProductImage(url=img.url, alt=img.alt) for img in images])
        await self.products.session.flush()
        return product

    async def delete_product(self, product: Product) -> None:
        await self.products.delete(product)
