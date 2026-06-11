"""Schemas for council-level analytics responses."""

from pydantic import BaseModel

from app.schemas.report import ReportListItem


class AnalyticsSummary(BaseModel):
    """Aggregate analytics for the Pavementa dashboard."""

    total_reports: int
    open_cases: int
    urgent_cases: int
    resolved_cases: int
    average_road_health_score: float
    severity_breakdown: dict[str, int]
    status_breakdown: dict[str, int]
    priority_breakdown: dict[str, int]
    recent_reports: list[ReportListItem]
    highest_risk_reports: list[ReportListItem]

