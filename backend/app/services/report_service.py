"""Business logic for saving and retrieving damage reports."""

from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.report import CaseEvent, Detection, Report
from app.schemas.report import CaseEventCreate, ReportCreate, ReportUpdate


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
        status="open",
        priority="medium",
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


def add_case_event(
    db: Session,
    report: Report,
    event_type: str,
    message: str,
    created_by: str | None = None,
) -> CaseEvent:
    """Create a timeline event for a report case."""
    event = CaseEvent(
        report=report,
        event_type=event_type,
        message=message,
        created_by=created_by,
    )
    db.add(event)
    return event


def update_report_case(db: Session, report: Report, payload: ReportUpdate) -> Report:
    """Update case-management fields and add automatic timeline events."""
    update_data = payload.model_dump(exclude_unset=True)

    if "status" in update_data and update_data["status"] != report.status:
        add_case_event(
            db,
            report,
            "status_changed",
            f"Status changed from {report.status} to {update_data['status']}",
            update_data.get("reviewed_by"),
        )

    if "priority" in update_data and update_data["priority"] != report.priority:
        add_case_event(
            db,
            report,
            "priority_changed",
            f"Priority changed from {report.priority} to {update_data['priority']}",
            update_data.get("reviewed_by"),
        )

    for field, value in update_data.items():
        setattr(report, field, value)

    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def create_manual_case_event(
    db: Session,
    report: Report,
    payload: CaseEventCreate,
) -> CaseEvent:
    """Add a manual case note to the report timeline."""
    event = add_case_event(
        db,
        report,
        payload.event_type,
        payload.message,
        payload.created_by,
    )
    db.commit()
    db.refresh(event)
    return event
