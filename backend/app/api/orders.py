"""Order endpoints for customers."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from ..core.deps import get_order_repository, require_user
from ..models.order import OrderStatus
from ..schemas.common import Paginated
from ..schemas.order import OrderOut

router = APIRouter(prefix="/orders")


@router.get("", response_model=Paginated[OrderOut])
async def list_orders(
    status: OrderStatus | None = Query(default=None),
    page: int = Query(default=1, ge=1, le=100),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user=Depends(require_user),
    repo=Depends(get_order_repository),
):
    orders, total = await repo.list_by_user(
        user_id=current_user.id,
        status=status,
        page=page,
        page_size=page_size,
    )
    items = [OrderOut.model_validate(order) for order in orders]
    pages = (total + page_size - 1) // page_size if page_size else 1
    return Paginated[OrderOut](items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: int, current_user=Depends(require_user), repo=Depends(get_order_repository)):
    order = await repo.get_by_id(order_id)
    if not order or order.user_id != current_user.id:
        from ..utils.errors import not_found

        raise not_found("Order not found")
    return OrderOut.model_validate(order)
