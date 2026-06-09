"""Prototype image detection endpoints."""

from fastapi import APIRouter, File, UploadFile

from app.core.config import get_settings
from app.schemas.detection import ImageDetectionResponse
from app.services.detection_service import (
    PROTOTYPE_DETECTION_NOTE,
    analyse_image_upload,
)

router = APIRouter(prefix="/api/detections", tags=["detections"])


@router.post("/analyse-image", response_model=ImageDetectionResponse)
async def analyse_image(file: UploadFile = File(...)) -> ImageDetectionResponse:
    """Run prototype YOLO analysis on an uploaded image."""
    settings = get_settings()
    original_filename, annotated_filename, detections, summary = (
        await analyse_image_upload(
            file=file,
            original_dir=settings.detection_original_dir,
            annotated_dir=settings.detection_annotated_dir,
            max_size_bytes=settings.max_upload_size_bytes,
            model_name=settings.yolo_model_name,
        )
    )

    backend_url = str(settings.backend_url).rstrip("/")

    return ImageDetectionResponse(
        message="Image analysed successfully",
        mode="prototype_detection",
        analysis_mode="prototype",
        model_name=settings.yolo_model_name,
        note=PROTOTYPE_DETECTION_NOTE,
        original_image_url=(
            f"{backend_url}/uploads/detections/original/{original_filename}"
        ),
        annotated_image_url=(
            f"{backend_url}/uploads/detections/annotated/{annotated_filename}"
        ),
        detections=detections,
        summary=summary,
    )
