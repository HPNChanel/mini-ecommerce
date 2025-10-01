"""Request body size limiting middleware."""
from __future__ import annotations

from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, *, max_body_size: int) -> None:
        super().__init__(app)
        self.max_body_size = max_body_size

    async def dispatch(self, request: Request, call_next: Callable[[Request], Response]) -> Response:
        if request.headers.get("content-length"):
            size = int(request.headers["content-length"])
            if size > self.max_body_size:
                from fastapi import status
                from fastapi.responses import JSONResponse

                return JSONResponse(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    content={"detail": "Request body too large", "code": "body_limit"},
                )
        return await call_next(request)
