"""Pagination helpers."""
from __future__ import annotations

from math import ceil
from typing import Iterable, Sequence, TypeVar

from pydantic import BaseModel


T = TypeVar("T")


class PaginatedResponse(BaseModel):
    items: Sequence[T]
    total: int
    page: int
    page_size: int
    pages: int


def paginate_items(items: Sequence[T], total: int, page: int, page_size: int) -> PaginatedResponse:
    pages = ceil(total / page_size) if page_size else 1
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=pages)


def apply_pagination(query, page: int, page_size: int):
    offset = (page - 1) * page_size
    return query.offset(offset).limit(page_size)
