"""Cart service."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from ..models.cart import Cart, CartItem, CartStatus
from ..models.product import Product
from ..repositories.carts import CartRepository
from ..repositories.products import ProductRepository
from ..utils.errors import http_error, not_found


class CartService:
    def __init__(
        self,
        *,
        carts: CartRepository,
        products: ProductRepository,
        session: AsyncSession,
    ) -> None:
        self.carts = carts
        self.products = products
        self.session = session

    async def get_or_create_cart(self, user_id: int) -> Cart:
        cart = await self.carts.get_user_draft_cart(user_id)
        if cart:
            return cart
        cart = Cart(user_id=user_id, status=CartStatus.draft)
        await self.carts.add(cart)
        return cart

    async def add_item(self, cart: Cart, *, product_id: int, qty: int) -> CartItem:
        product = await self.products.get_by_id(product_id)
        if not product or not product.is_active:
            raise not_found("Product not found")
        if product.stock < qty:
            raise http_error(status_code=400, detail="Insufficient stock")
        existing = next((item for item in cart.items if item.product_id == product_id), None)
        if existing:
            existing.qty += qty
            if existing.qty > product.stock:
                raise http_error(status_code=400, detail="Insufficient stock")
            await self.session.flush()
            return existing
        item = CartItem(product_id=product_id, qty=qty)
        item.product = product
        await self.carts.add_item(cart, item)
        return item

    async def update_item(self, cart: Cart, item_id: int, qty: int) -> CartItem:
        item = await self.carts.get_item(cart.id, item_id)
        if not item:
            raise not_found("Cart item not found")
        product = await self.products.get_by_id(item.product_id)
        if not product or product.stock < qty:
            raise http_error(status_code=400, detail="Insufficient stock")
        item.qty = qty
        item.product = product
        await self.session.flush()
        return item

    async def delete_item(self, cart: Cart, item_id: int) -> None:
        item = await self.carts.get_item(cart.id, item_id)
        if not item:
            raise not_found("Cart item not found")
        await self.session.delete(item)
        await self.session.flush()
