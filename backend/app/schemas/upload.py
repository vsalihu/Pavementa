"""Response schemas for upload endpoints."""

from pydantic import BaseModel


class ImageUploadResponse(BaseModel):
    """Metadata returned after a successful image upload."""

    message: str
    filename: str
    file_url: str
    content_type: str
    size_bytes: int

