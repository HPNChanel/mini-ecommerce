"""Application error helpers."""
from __future__ import annotations

from enum import Enum
from typing import Any

from fastapi import HTTPException, status


class AppErrorCode(str, Enum):
    BAD_REQUEST = "bad_request"
    UNAUTHORIZED = "unauthorized"
    FORBIDDEN = "forbidden"
    NOT_FOUND = "not_found"
    CONFLICT = "conflict"
    VALIDATION_ERROR = "validation_error"
    RATE_LIMIT = "rate_limit"


def http_error(
    *,
    status_code: int,
    detail: str,
    code: AppErrorCode = AppErrorCode.BAD_REQUEST,
    headers: dict[str, Any] | None = None,
) -> HTTPException:
    return HTTPException(status_code=status_code, detail={"detail": detail, "code": code}, headers=headers)


def not_found(detail: str) -> HTTPException:
    return http_error(status_code=status.HTTP_404_NOT_FOUND, detail=detail, code=AppErrorCode.NOT_FOUND)


def conflict(detail: str) -> HTTPException:
    return http_error(status_code=status.HTTP_409_CONFLICT, detail=detail, code=AppErrorCode.CONFLICT)
