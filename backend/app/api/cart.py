"""Cart endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, status

from ..core.deps import get_cart_service, require_user
from ..schemas.cart import CartItemCreate, CartItemOut, CartItemUpdate, CartOut

router = APIRouter(prefix="/cart")


@router.get("", response_model=CartOut)
async def get_cart(service=Depends(get_cart_service), current_user=Depends(require_user)):
    cart = await service.get_or_create_cart(current_user.id)
    return CartOut.model_validate(cart)


@router.post("/items", response_model=CartItemOut, status_code=status.HTTP_201_CREATED)
async def add_item(
    payload: CartItemCreate,
    service=Depends(get_cart_service),
    current_user=Depends(require_user),
):
    cart = await service.get_or_create_cart(current_user.id)
    item = await service.add_item(cart, product_id=payload.product_id, qty=payload.qty)
    return CartItemOut.model_validate(item)


@router.patch("/items/{item_id}", response_model=CartItemOut)
async def update_item(
    item_id: int,
    payload: CartItemUpdate,
    service=Depends(get_cart_service),
    current_user=Depends(require_user),
):
    cart = await service.get_or_create_cart(current_user.id)
    item = await service.update_item(cart, item_id, payload.qty)
    return CartItemOut.model_validate(item)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: int,
    service=Depends(get_cart_service),
    current_user=Depends(require_user),
) -> None:
    cart = await service.get_or_create_cart(current_user.id)
    await service.delete_item(cart, item_id)
