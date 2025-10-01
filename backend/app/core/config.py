"""Application configuration using pydantic-settings."""
from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    APP_NAME: str = "Mini E-commerce"
    ENV: str = Field(default="development", validation_alias="ENV")
    DEBUG: bool = False

    SECRET_KEY: str
    DATABASE_URL: str

    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=15, ge=1, le=1440)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, ge=1, le=30)

    FRONTEND_ORIGIN: AnyHttpUrl
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = Field(default_factory=list)

    RATE_LIMIT_REQUESTS: int = Field(default=60, ge=1)
    RATE_LIMIT_WINDOW_SECONDS: int = Field(default=60, ge=1)

    METRICS_ENABLED: bool = Field(default=True)

    PROMETHEUS_NAMESPACE: str = Field(default="mini_ecommerce")

    IMAGE_URL_PATTERN: str = Field(default=r"^https://.+")


@lru_cache()
def get_settings() -> Settings:
    """Return cached application settings."""

    return Settings()


settings = get_settings()
