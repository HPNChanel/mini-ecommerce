"""Application API router."""
from __future__ import annotations

from fastapi import APIRouter

from . import auth, catalog, cart, checkout, orders, admin, webhooks, users


api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, tags=["users"])
api_router.include_router(catalog.router, tags=["catalog"])
api_router.include_router(cart.router, tags=["cart"])
api_router.include_router(checkout.router, tags=["checkout"])
api_router.include_router(orders.router, tags=["orders"])
api_router.include_router(admin.router, tags=["admin"])
api_router.include_router(webhooks.router, tags=["webhooks"])
