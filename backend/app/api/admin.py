"""Admin endpoints."""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, Query, status

from ..core.deps import get_catalog_service, get_order_repository, get_order_service, require_admin
from ..models.order import OrderStatus
from ..schemas.common import Paginated
from ..schemas.order import OrderOut
from ..schemas.product import ProductCreate, ProductOut, ProductUpdate
from ..utils.errors import not_found

router = APIRouter(prefix="/admin")
logger = logging.getLogger("audit")


@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreate, service=Depends(get_catalog_service), admin=Depends(require_admin)):
    product = await service.create_product(payload)
    logger.info("product_created", extra={"product_id": product.id, "admin_id": admin.id})
    return ProductOut.model_validate(product)


@router.patch("/products/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: int,
    payload: ProductUpdate,
    service=Depends(get_catalog_service),
    admin=Depends(require_admin),
):
    product = await service.products.get_by_id(product_id)
    if not product:
        raise not_found("Product not found")
    product = await service.update_product(product, payload)
    logger.info("product_updated", extra={"product_id": product.id, "admin_id": admin.id})
    return ProductOut.model_validate(product)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, service=Depends(get_catalog_service), admin=Depends(require_admin)) -> None:
    product = await service.products.get_by_id(product_id)
    if not product:
        raise not_found("Product not found")
    await service.delete_product(product)
    logger.info("product_deleted", extra={"product_id": product.id, "admin_id": admin.id})


@router.get("/orders", response_model=Paginated[OrderOut])
async def list_orders(
    status: OrderStatus | None = Query(default=None),
    page: int = Query(default=1, ge=1, le=100),
    page_size: int = Query(default=20, ge=1, le=100),
    admin=Depends(require_admin),
    repo=Depends(get_order_repository),
):
    orders, total = await repo.list_all(status=status, page=page, page_size=page_size)
    items = [OrderOut.model_validate(order) for order in orders]
    pages = (total + page_size - 1) // page_size if page_size else 1
    return Paginated[OrderOut](items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.patch("/orders/{order_id}", response_model=OrderOut)
async def update_order_status(
    order_id: int,
    status: OrderStatus,
    service=Depends(get_order_service),
    admin=Depends(require_admin),
    repo=Depends(get_order_repository),
):
    order = await repo.get_by_id(order_id)
    if not order:
        raise not_found("Order not found")
    order = await service.transition_status(order, status)
    logger.info("order_status_updated", extra={"order_id": order.id, "status": order.status, "admin_id": admin.id})
    return OrderOut.model_validate(order)
