"""Prototype YOLO detection service for uploaded road imagery.

This is prototype detection mode. It uses a lightweight general pretrained
YOLO model before Pavementa has a road-damage-specific pothole/crack model.
The detections are useful for proving the architecture end-to-end, not for
production road defect assessment.
"""

from functools import lru_cache
from pathlib import Path

import cv2
from fastapi import UploadFile
from ultralytics import YOLO

from app.schemas.detection import DetectionBox, DetectionItem, DetectionSummary
from app.services.upload_service import save_image_upload

PROTOTYPE_DETECTION_NOTE = (
    "Prototype detection mode: using a general pretrained model before "
    "road-damage fine-tuning."
)


@lru_cache
def get_yolo_model(model_name: str) -> YOLO:
    """Load and cache the lightweight pretrained YOLO model."""
    return YOLO(model_name)


def severity_from_confidence(confidence: float) -> str:
    """Map prototype model confidence to a simple inspection severity."""
    if confidence < 0.45:
        return "low"
    if confidence <= 0.75:
        return "medium"
    return "high"


def overall_severity(detections: list[DetectionItem]) -> str:
    """Return the highest severity present in the detection list."""
    if any(item.severity == "high" for item in detections):
        return "high"
    if any(item.severity == "medium" for item in detections):
        return "medium"
    if detections:
        return "low"
    return "low"


async def analyse_image_upload(
    file: UploadFile,
    original_dir: Path,
    annotated_dir: Path,
    max_size_bytes: int,
    model_name: str,
) -> tuple[str, str, list[DetectionItem], DetectionSummary]:
    """Save an uploaded image, run YOLO inference, and save annotations."""
    filename, _, _ = await save_image_upload(
        file=file,
        upload_dir=original_dir,
        max_size_bytes=max_size_bytes,
    )

    original_path = original_dir / filename
    annotated_dir.mkdir(parents=True, exist_ok=True)
    annotated_filename = f"{original_path.stem}-annotated.jpg"
    annotated_path = annotated_dir / annotated_filename

    model = get_yolo_model(model_name)
    results = model(str(original_path))
    result = results[0]

    detections: list[DetectionItem] = []
    for box in result.boxes:
        confidence = round(float(box.conf[0]), 2)
        x1, y1, x2, y2 = [int(value) for value in box.xyxy[0].tolist()]
        class_id = int(box.cls[0])
        label = result.names.get(class_id, f"class_{class_id}")

        detections.append(
            DetectionItem(
                label=label,
                confidence=confidence,
                box=DetectionBox(x1=x1, y1=y1, x2=x2, y2=y2),
                severity=severity_from_confidence(confidence),
            )
        )

    annotated_image = result.plot()
    cv2.imwrite(str(annotated_path), annotated_image)

    highest_confidence = max((item.confidence for item in detections), default=0.0)
    summary = DetectionSummary(
        total_detections=len(detections),
        highest_confidence=highest_confidence,
        overall_severity=overall_severity(detections),
    )

    return filename, annotated_filename, detections, summary

