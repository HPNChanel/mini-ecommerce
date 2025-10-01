"""Custom middleware for security headers and metrics."""
from __future__ import annotations

import time
from typing import Callable

from fastapi import Request, Response

from .config import settings
from ..utils.metrics import metrics_registry


SECURITY_HEADERS = {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
}


async def security_headers_middleware(request: Request, call_next: Callable[[Request], Response]) -> Response:
    response = await call_next(request)
    for key, value in SECURITY_HEADERS.items():
        response.headers.setdefault(key, value)
    return response


async def metrics_middleware(request: Request, call_next: Callable[[Request], Response]) -> Response:
    if not settings.METRICS_ENABLED:
        return await call_next(request)

    start = time.perf_counter()
    response = await call_next(request)
    elapsed = time.perf_counter() - start
    route = request.url.path
    metrics_registry.observe_request(route=route, status=response.status_code, elapsed=elapsed)
    return response
