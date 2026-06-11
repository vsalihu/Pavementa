"""Pydantic schemas for reports and persisted detections."""

from datetime import datetime

from pydantic import BaseModel, Field


class DetectionBoxInput(BaseModel):
    """Bounding box coordinates supplied by the detection analysis response."""

    x1: int
    y1: int
    x2: int
    y2: int


class DetectionCreate(BaseModel):
    """Detection payload embedded in a report create request."""

    label: str
    confidence: float
    severity: str
    box: DetectionBoxInput


class ReportCreate(BaseModel):
    """Create a report from a prototype detection analysis response."""

    title: str | None = None
    location_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    original_image_url: str
    annotated_image_url: str
    analysis_mode: str = "prototype"
    model_name: str = "yolov8n.pt"
    detections: list[DetectionCreate] = Field(default_factory=list)


class DetectionRead(BaseModel):
    """Detection record returned by report APIs."""

    id: int
    label: str
    confidence: float
    severity: str
    x1: int
    y1: int
    x2: int
    y2: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportListItem(BaseModel):
    """Compact report representation for registry lists."""

    public_id: str
    title: str
    location_name: str | None
    latitude: float | None
    longitude: float | None
    status: str
    overall_severity: str
    road_health_score: float
    analysis_mode: str
    model_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportRead(ReportListItem):
    """Full report representation including images and detections."""

    original_image_url: str
    annotated_image_url: str
    updated_at: datetime
    detections: list[DetectionRead]

    model_config = {"from_attributes": True}
