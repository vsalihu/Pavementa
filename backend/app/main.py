"""FastAPI application entrypoint for the Pavementa backend."""

import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.detections import router as detections_router
from app.api.reports import router as reports_router
from app.api.routes import router
from app.api.uploads import router as uploads_router
from app.core.config import get_settings
from app.core.logging import configure_logging

settings = get_settings()
configure_logging(settings.log_level)
logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Handle application startup and shutdown lifecycle events."""
    logger.info("Starting %s", settings.app_name)
    yield
    logger.info("Stopping %s", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Backend API foundation for Pavementa, an AI-powered road "
        "infrastructure intelligence platform."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(uploads_router)
app.include_router(detections_router)
app.include_router(reports_router)
settings.upload_dir.mkdir(parents=True, exist_ok=True)
settings.detection_original_dir.mkdir(parents=True, exist_ok=True)
settings.detection_annotated_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir.parent), name="uploads")
