"""Webhook endpoints."""
from __future__ import annotations

import hmac

from fastapi import APIRouter, Depends, Header, Request, status

from ..core.config import settings
from ..core.deps import get_order_service
from ..schemas.order import MockPaymentWebhook, OrderOut
from ..utils.errors import http_error

router = APIRouter(prefix="/webhooks")


@router.post("/mock-payments", response_model=OrderOut, status_code=status.HTTP_200_OK)
async def mock_payment(
    request: Request,
    service=Depends(get_order_service),
    signature: str = Header(alias="x-mockpay-signature"),
):
    if not hmac.compare_digest(signature, settings.PAYMENT_WEBHOOK_SECRET):
        raise http_error(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature")

    body = await request.body()
    try:
        payload = MockPaymentWebhook.model_validate_json(body)
    except Exception as exc:  # pragma: no cover - validation error
        raise http_error(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload") from exc

    order = await service.mark_paid(payload.payment_ref)
    return OrderOut.model_validate(order)
