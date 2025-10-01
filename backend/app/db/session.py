"""Database session management."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from ..core.config import settings


class Base(DeclarativeBase):
    pass


def get_engine():
    return create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG, future=True)


engine = get_engine()
async_session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
