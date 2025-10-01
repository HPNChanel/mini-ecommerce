"""Order service."""
from __future__ import annotations

import secrets

from sqlalchemy.ext.asyncio import AsyncSession

from ..models.cart import Cart, CartItem, CartStatus
from ..models.order import Order, OrderItem, OrderStatus
from ..repositories.orders import OrderRepository
from ..repositories.products import ProductRepository
from ..utils.errors import http_error, not_found


class PaymentProvider:
    """Mock payment provider stub."""

    async def create_payment(self, order: Order) -> tuple[str, str]:
        payment_ref = f"pay_{secrets.token_hex(8)}"
        client_secret = secrets.token_hex(16)
        return payment_ref, client_secret


class OrderService:
    def __init__(
        self,
        *,
        orders: OrderRepository,
        products: ProductRepository,
        session: AsyncSession,
        payment_provider: PaymentProvider | None = None,
    ) -> None:
        self.orders = orders
        self.products = products
        self.session = session
        self.payment_provider = payment_provider or PaymentProvider()

    async def checkout(self, cart: Cart) -> tuple[Order, str, str]:
        if not cart.items:
            raise http_error(status_code=400, detail="Cart is empty")
        total = 0
        order = Order(user_id=cart.user_id, status=OrderStatus.pending, total_cents=0, currency="USD")
        await self.orders.add(order)
        for item in cart.items:
            product = await self.products.get_by_id(item.product_id)
            if not product or product.stock < item.qty:
                raise http_error(status_code=400, detail="Product unavailable")
            product.stock -= item.qty
            total += product.price_cents * item.qty
            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                sku_snapshot=product.sku,
                name_snapshot=product.name,
                price_cents=product.price_cents,
                qty=item.qty,
            )
            order.items.append(order_item)
        order.total_cents = total
        cart.status = CartStatus.ordered
        await self.session.flush()
        payment_ref, client_secret = await self.payment_provider.create_payment(order)
        order.payment_ref = payment_ref
        await self.session.flush()
        return order, payment_ref, client_secret

    async def mark_paid(self, payment_ref: str) -> Order:
        from sqlalchemy import select

        result = await self.session.execute(select(Order).where(Order.payment_ref == payment_ref))
        order = result.scalar_one_or_none()
        if not order:
            raise not_found("Order not found")
        if order.status == OrderStatus.paid:
            return order
        if order.status not in {OrderStatus.pending, OrderStatus.cancelled}:
            return order
        order.status = OrderStatus.paid
        await self.session.flush()
        return order

    async def transition_status(self, order: Order, status: OrderStatus) -> Order:
        valid_transitions = {
            OrderStatus.paid: {OrderStatus.shipped, OrderStatus.cancelled},
            OrderStatus.shipped: {OrderStatus.completed},
        }
        if order.status == OrderStatus.cancelled:
            raise http_error(status_code=400, detail="Order already cancelled")
        if status == OrderStatus.cancelled and order.status in {OrderStatus.completed, OrderStatus.shipped}:
            raise http_error(status_code=400, detail="Cannot cancel fulfilled order")
        if order.status in valid_transitions and status not in valid_transitions[order.status]:
            raise http_error(status_code=400, detail="Invalid status transition")
        order.status = status
        await self.session.flush()
        return order
