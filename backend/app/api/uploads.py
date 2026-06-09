"""Upload endpoints for road inspection imagery."""

from fastapi import APIRouter, File, UploadFile

from app.core.config import get_settings
from app.schemas.upload import ImageUploadResponse
from app.services.upload_service import save_image_upload

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


@router.post("/image", response_model=ImageUploadResponse)
async def upload_image(file: UploadFile = File(...)) -> ImageUploadResponse:
    """Upload a road inspection image for later AI analysis."""
    settings = get_settings()
    filename, size_bytes, content_type = await save_image_upload(
        file=file,
        upload_dir=settings.upload_dir,
        max_size_bytes=settings.max_upload_size_bytes,
    )

    file_url = f"{str(settings.backend_url).rstrip('/')}/uploads/images/{filename}"

    return ImageUploadResponse(
        message="Image uploaded successfully",
        filename=filename,
        file_url=file_url,
        content_type=content_type,
        size_bytes=size_bytes,
    )
