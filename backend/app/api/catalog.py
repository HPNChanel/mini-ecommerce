"""Catalog endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from ..core.deps import get_catalog_service, rate_limit
from ..schemas.category import CategoryOut
from ..schemas.common import Paginated
from ..schemas.product import ProductOut

router = APIRouter()


@router.get("/categories", response_model=list[CategoryOut], dependencies=[Depends(rate_limit)])
async def list_categories(service=Depends(get_catalog_service)):
    categories = await service.list_categories()
    return [CategoryOut.model_validate(cat) for cat in categories]


@router.get("/products", response_model=Paginated[ProductOut], dependencies=[Depends(rate_limit)])
async def list_products(
    q: str | None = None,
    category_id: int | None = Query(default=None),
    min_price: int | None = Query(default=None, ge=0),
    max_price: int | None = Query(default=None, ge=0),
    sort: str | None = Query(default=None, pattern="^(price_asc|price_desc)$"),
    page: int = Query(default=1, ge=1, le=100),
    page_size: int = Query(default=12, ge=1, le=100),
    service=Depends(get_catalog_service),
):
    products, total = await service.search_products(
        q=q,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        sort=sort,
        page=page,
        page_size=page_size,
    )
    items = [ProductOut.model_validate(prod) for prod in products]
    pages = (total + page_size - 1) // page_size if page_size else 1
    return Paginated[ProductOut](items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.get("/products/{identifier}", response_model=ProductOut, dependencies=[Depends(rate_limit)])
async def get_product(identifier: str, service=Depends(get_catalog_service)):
    product = await service.get_product(identifier)
    return ProductOut.model_validate(product)
