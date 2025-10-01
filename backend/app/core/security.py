"""Security utilities for password hashing and JWT handling."""
from __future__ import annotations

import datetime as dt
import secrets
from typing import Any, Dict, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(subject: str, expires_delta: Optional[dt.timedelta] = None) -> str:
    """Create an access token for the given subject."""
    expire = dt.datetime.utcnow() + (
        expires_delta or dt.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {"sub": subject, "exp": expire, "jti": secrets.token_hex(8)}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def create_refresh_token(subject: str, jti: Optional[str] = None) -> Dict[str, Any]:
    """Create a refresh token returning both token and metadata."""
    expire = dt.datetime.utcnow() + dt.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    jti_value = jti or secrets.token_hex(16)
    payload = {"sub": subject, "exp": expire, "jti": jti_value, "type": "refresh"}
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return {"token": token, "jti": jti_value, "expires": expire}


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return _pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return _pwd_context.hash(password)


def decode_token(token: str) -> Dict[str, Any]:
    """Decode a JWT token returning the payload."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])


def validate_refresh_token(token: str) -> Dict[str, Any]:
    """Validate refresh token payload ensuring correct type."""
    payload = decode_token(token)
    token_type = payload.get("type")
    if token_type != "refresh":
        raise JWTError("Invalid token type")
    return payload
