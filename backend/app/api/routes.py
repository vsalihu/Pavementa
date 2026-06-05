"""Public API routes for the Pavementa backend."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def read_root() -> dict[str, str]:
    """Return basic API metadata for service discovery and smoke checks."""
    return {
        "name": "Pavementa API",
        "status": "online",
        "version": "1.0.0",
    }


@router.get("/health")
def read_health() -> dict[str, str]:
    """Return a lightweight health check response."""
    return {"status": "healthy"}

