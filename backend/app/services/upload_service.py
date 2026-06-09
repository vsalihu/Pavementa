"""File validation and storage services for uploaded road imagery."""

from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
CHUNK_SIZE_BYTES = 1024 * 1024


async def save_image_upload(
    file: UploadFile,
    upload_dir: Path,
    max_size_bytes: int,
) -> tuple[str, int, str]:
    """Validate and save an uploaded image, returning filename, size, and type."""
    content_type = file.content_type or ""
    original_suffix = Path(file.filename or "").suffix.lower()

    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Invalid file type. Upload a JPG, JPEG, PNG, or WEBP image.",
        )

    if original_suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Invalid file extension. Upload a JPG, JPEG, PNG, or WEBP image.",
        )

    extension = ".jpg" if original_suffix == ".jpeg" else original_suffix
    filename = f"{uuid4().hex}{extension}"
    upload_dir.mkdir(parents=True, exist_ok=True)
    destination = upload_dir / filename

    size_bytes = 0
    try:
        with destination.open("wb") as stored_file:
            while chunk := await file.read(CHUNK_SIZE_BYTES):
                size_bytes += len(chunk)
                if size_bytes > max_size_bytes:
                    stored_file.close()
                    destination.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="Image exceeds the 10MB upload limit.",
                    )
                stored_file.write(chunk)
    finally:
        await file.close()

    if size_bytes == 0:
        destination.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image is empty.",
        )

    return filename, size_bytes, content_type

