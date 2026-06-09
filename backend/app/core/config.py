"""Application settings loaded from environment variables."""

from functools import lru_cache
from pathlib import Path

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Runtime configuration for the Pavementa API."""

    app_name: str = "Pavementa API"
    app_version: str = "1.0.0"
    environment: str = "development"
    app_debug: bool = True

    backend_url: AnyHttpUrl = Field(default="http://localhost:8000")
    frontend_url: AnyHttpUrl = Field(default="http://localhost:3000")

    database_url: str = ""
    mapbox_token: str = ""
    storage_bucket: str = ""
    jwt_secret: str = ""
    ai_model_path: str = ""
    upload_dir: Path = BASE_DIR / "uploads" / "images"
    detection_original_dir: Path = BASE_DIR / "uploads" / "detections" / "original"
    detection_annotated_dir: Path = BASE_DIR / "uploads" / "detections" / "annotated"
    yolo_model_name: str = "yolov8n.pt"
    max_upload_size_bytes: int = 10 * 1024 * 1024

    log_level: str = "INFO"
    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Return cached settings so configuration is parsed once per process."""
    return Settings()
