"""Business logic for saving and retrieving damage reports."""

from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.report import Detection, Report
from app.schemas.report import ReportCreate


def calculate_road_health_score(detections: list) -> float:
    """Calculate a simple prototype road health score from detection severity."""
    if not detections:
        return 98.0

    penalties = {"critical": 30.0, "high": 20.0, "medium": 10.0, "low": 4.0}
    score = 100.0
    for detection in detections:
        score -= penalties.get(detection.severity, 6.0)

    return max(0.0, round(score, 1))


def derive_overall_severity(detections: list) -> str:
    """Derive the highest report severity from detection severities."""
    severity_order = ["critical", "high", "medium", "low"]
    present = {detection.severity for detection in detections}
    for severity in severity_order:
        if severity in present:
            return severity
    return "low"


def generate_public_id(db: Session) -> str:
    """Generate a readable public report identifier such as PAV-2026-0001."""
    year = datetime.now(UTC).year
    prefix = f"PAV-{year}-"
    count = db.scalar(
        select(func.count()).select_from(Report).where(Report.public_id.like(f"{prefix}%"))
    )
    return f"{prefix}{(count or 0) + 1:04d}"


def create_report(db: Session, payload: ReportCreate) -> Report:
    """Persist a report and its detections."""
    report = Report(
        public_id=generate_public_id(db),
        title=payload.title or "Road damage analysis report",
        location_name=payload.location_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        status="pending_review",
        overall_severity=derive_overall_severity(payload.detections),
        road_health_score=calculate_road_health_score(payload.detections),
        original_image_url=payload.original_image_url,
        annotated_image_url=payload.annotated_image_url,
        analysis_mode=payload.analysis_mode,
        model_name=payload.model_name,
    )

    report.detections = [
        Detection(
            label=detection.label,
            confidence=detection.confidence,
            severity=detection.severity,
            x1=detection.box.x1,
            y1=detection.box.y1,
            x2=detection.box.x2,
            y2=detection.box.y2,
        )
        for detection in payload.detections
    ]

    db.add(report)
    db.commit()
    db.refresh(report)
    return report

