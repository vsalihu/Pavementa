"""Public-safe report schemas for citizen tracking."""

from datetime import datetime

from pydantic import BaseModel


class PublicCaseEventRead(BaseModel):
    """Timeline event safe to show on the public citizen portal."""

    event_type: str
    message: str
    created_at: datetime


class PublicReportRead(BaseModel):
    """Limited report details for citizen-facing tracking."""

    public_id: str
    status: str
    location_name: str | None
    overall_severity: str
    road_health_score: float
    created_at: datetime
    case_events: list[PublicCaseEventRead]
