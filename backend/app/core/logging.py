"""Logging configuration for the Pavementa API."""

import logging
from logging.config import dictConfig


def configure_logging(log_level: str = "INFO") -> None:
    """Configure structured, consistent logging for local and production runs."""
    normalized_level = log_level.upper()

    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "default",
                },
            },
            "loggers": {
                "app": {
                    "handlers": ["console"],
                    "level": normalized_level,
                    "propagate": False,
                },
            },
            "root": {
                "handlers": ["console"],
                "level": normalized_level,
            },
        }
    )

    logging.getLogger("app").info("Logging configured", extra={"level": normalized_level})

