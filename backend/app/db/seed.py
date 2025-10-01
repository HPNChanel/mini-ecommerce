"""Seed script for development data."""
from __future__ import annotations

import asyncio

from sqlalchemy import text

from ..core.security import get_password_hash
from ..db.session import async_session_factory
from ..models.cart import Cart, CartStatus
from ..models.category import Category
from ..models.product import Product, ProductImage
from ..models.user import User, UserRole


async def seed() -> None:
    async with async_session_factory() as session:
        await session.execute(text("DELETE FROM order_items"))
        await session.execute(text("DELETE FROM orders"))
        await session.execute(text("DELETE FROM cart_items"))
        await session.execute(text("DELETE FROM carts"))
        await session.execute(text("DELETE FROM product_images"))
        await session.execute(text("DELETE FROM products"))
        await session.execute(text("DELETE FROM categories"))
        await session.execute(text("DELETE FROM tokens"))
        await session.execute(text("DELETE FROM addresses"))
        await session.execute(text("DELETE FROM users"))

        admin = User(
            email="admin@example.com",
            hashed_password=get_password_hash("AdminPass123"),
            full_name="Admin User",
            role=UserRole.admin,
        )
        demo = User(
            email="demo@example.com",
            hashed_password=get_password_hash("DemoPass123"),
            full_name="Demo Customer",
            role=UserRole.customer,
        )
        session.add_all([admin, demo])
        await session.flush()

        electronics = Category(name="Electronics", slug="electronics")
        apparel = Category(name="Apparel", slug="apparel")
        session.add_all([electronics, apparel])
        await session.flush()

        products = []
        for idx in range(1, 9):
            category = electronics if idx <= 4 else apparel
            product = Product(
                sku=f"SKU{idx:03d}",
                name=f"Product {idx}",
                slug=f"product-{idx}",
                description="Sample product",
                price_cents=1999 + idx * 100,
                currency="USD",
                stock=50,
                category_id=category.id,
            )
            product.images.append(
                ProductImage(url=f"https://cdn.example.com/products/{idx}.jpg", alt=f"Product {idx}")
            )
            products.append(product)
        session.add_all(products)

        cart = Cart(user_id=demo.id, status=CartStatus.draft)
        session.add(cart)

        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed())
