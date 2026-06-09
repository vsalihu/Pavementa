"""Response schemas for prototype image detection."""

from pydantic import BaseModel


class DetectionBox(BaseModel):
    """Bounding box coordinates returned by YOLO inference."""

    x1: int
    y1: int
    x2: int
    y2: int


class DetectionItem(BaseModel):
    """Single prototype detection result."""

    label: str
    confidence: float
    box: DetectionBox
    severity: str


class DetectionSummary(BaseModel):
    """Aggregate detection summary for a single analysed image."""

    total_detections: int
    highest_confidence: float
    overall_severity: str


class ImageDetectionResponse(BaseModel):
    """Response returned after prototype YOLO analysis."""

    message: str
    mode: str
    analysis_mode: str
    model_name: str
    note: str
    original_image_url: str
    annotated_image_url: str
    detections: list[DetectionItem]
    summary: DetectionSummary
