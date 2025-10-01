from __future__ import annotations

import asyncio
import os
from collections.abc import AsyncGenerator
from typing import AsyncIterator

import pytest
import pytest_asyncio
from asgi_lifespan import LifespanManager
from fastapi import FastAPI
from httpx import AsyncClient

# Ensure env is configured before importing application modules
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
os.environ.setdefault("FRONTEND_ORIGIN", "http://localhost:5173")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "15")
os.environ.setdefault("REFRESH_TOKEN_EXPIRE_DAYS", "7")
os.environ.setdefault("METRICS_ENABLED", "0")

from app.main import app  # noqa: E402
from app.db.session import Base, async_session_factory, engine
from app.models.category import Category
from app.models.product import Product, ProductImage


@pytest_asyncio.fixture(scope="session")
async def prepare_database() -> AsyncGenerator[None, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client(prepare_database: None) -> AsyncIterator[AsyncClient]:
    async with LifespanManager(app):
        async with AsyncClient(app=app, base_url="http://testserver") as client:
            yield client


@pytest_asyncio.fixture
async def session() -> AsyncIterator:
    async with async_session_factory() as session:
        yield session


@pytest_asyncio.fixture
async def sample_catalog(session) -> AsyncIterator[None]:
    electronics = Category(name="Electronics", slug="electronics")
    session.add(electronics)
    await session.flush()
    product = Product(
        sku="SKU100",
        name="Test Product",
        slug="test-product",
        description="Test",
        price_cents=2500,
        currency="USD",
        stock=10,
        category_id=electronics.id,
    )
    product.images.append(ProductImage(url="https://cdn.example.com/test.jpg", alt="test"))
    session.add(product)
    await session.commit()
    yield
    await session.execute(ProductImage.__table__.delete())
    await session.execute(Product.__table__.delete())
    await session.execute(Category.__table__.delete())
    await session.commit()
