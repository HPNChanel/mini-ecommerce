"""Webhook endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, status

from ..core.deps import get_order_service
from ..schemas.order import MockPaymentWebhook, OrderOut

router = APIRouter(prefix="/webhooks")


@router.post("/mock-payments", response_model=OrderOut, status_code=status.HTTP_200_OK)
async def mock_payment(payload: MockPaymentWebhook, service=Depends(get_order_service)):
    order = await service.mark_paid(payload.payment_ref)
    return OrderOut.model_validate(order)
