"""FastAPI application entry point."""
from __future__ import annotations

from logging.config import dictConfig

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import PlainTextResponse

from .api.router import api_router
from .core.config import settings
from .core.middleware import metrics_middleware, security_headers_middleware
from .utils.body_limit import BodySizeLimitMiddleware
from .utils.metrics import metrics_registry


def configure_logging() -> None:
    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "class": "pythonjsonlogger.jsonlogger.JsonFormatter",
                    "format": "%(asctime)s %(name)s %(levelname)s %(message)s",
                }
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "default",
                }
            },
            "loggers": {
                "": {"handlers": ["console"], "level": "INFO"},
                "audit": {"handlers": ["console"], "level": "INFO", "propagate": False},
            },
        }
    )


configure_logging()

app = FastAPI(title=settings.APP_NAME, version="0.1.0")

app.add_middleware(BodySizeLimitMiddleware, max_body_size=1_000_000)
app.middleware("http")(security_headers_middleware)
app.middleware("http")(metrics_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(settings.FRONTEND_ORIGIN)],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/healthz", tags=["system"])
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/metrics", include_in_schema=False)
async def metrics() -> Response:
    if not settings.METRICS_ENABLED:
        return PlainTextResponse("", status_code=404)
    return PlainTextResponse(metrics_registry.render_prometheus(), media_type="text/plain")


app.include_router(api_router)


@app.get("/", include_in_schema=False)
async def root() -> dict[str, str]:
    return {"message": settings.APP_NAME}
