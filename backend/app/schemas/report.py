"""Pydantic schemas for reports and persisted detections."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

AllowedStatus = Literal["open", "under_review", "scheduled", "resolved", "rejected"]
AllowedPriority = Literal["low", "medium", "high", "urgent"]
AllowedSource = Literal["internal", "citizen"]


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
    status: AllowedStatus = "open"
    priority: AllowedPriority | None = None
    source: AllowedSource = "internal"
    citizen_name: str | None = None
    citizen_email: str | None = None
    citizen_description: str | None = None
    original_image_url: str
    annotated_image_url: str
    analysis_mode: str = "prototype"
    model_name: str = "yolov8n.pt"
    detections: list[DetectionCreate] = Field(default_factory=list)


class ReportUpdate(BaseModel):
    """Case management fields that can be updated on a report."""

    status: AllowedStatus | None = None
    priority: AllowedPriority | None = None
    assigned_to: str | None = None
    reviewed_by: str | None = None
    review_notes: str | None = None
    scheduled_repair_date: datetime | None = None
    resolved_at: datetime | None = None


class CaseEventCreate(BaseModel):
    """Manual timeline note for a report case."""

    message: str
    created_by: str | None = None
    event_type: str = "manual_note"


class CaseEventRead(BaseModel):
    """Timeline event returned with report details."""

    id: int
    event_type: str
    message: str
    created_by: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


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
    priority: str
    source: str
    assigned_to: str | None
    reviewed_by: str | None
    scheduled_repair_date: datetime | None
    resolved_at: datetime | None
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
    review_notes: str | None
    citizen_name: str | None
    citizen_email: str | None
    citizen_description: str | None
    updated_at: datetime
    detections: list[DetectionRead]
    case_events: list[CaseEventRead]

    model_config = {"from_attributes": True}
