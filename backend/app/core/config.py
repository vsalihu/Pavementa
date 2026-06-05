"""Application settings loaded from environment variables."""

from functools import lru_cache

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


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
