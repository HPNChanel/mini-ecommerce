"""Checkout endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, status

from ..core.deps import get_cart_service, get_order_service, require_user
from ..utils.errors import http_error
from ..schemas.order import CheckoutRequest, CheckoutResponse

router = APIRouter(prefix="/checkout")


@router.post("", response_model=CheckoutResponse, status_code=status.HTTP_201_CREATED)
async def checkout(
    payload: CheckoutRequest,
    order_service=Depends(get_order_service),
    cart_service=Depends(get_cart_service),
    current_user=Depends(require_user),
):
    cart = await cart_service.get_or_create_cart(current_user.id)
    if cart.id != payload.cart_id:
        raise http_error(status_code=400, detail="Cart mismatch")
    order, payment_ref, client_secret = await order_service.checkout(cart)
    return CheckoutResponse(order_id=order.id, payment_ref=payment_ref, client_secret=client_secret)
