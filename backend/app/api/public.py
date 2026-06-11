"""Citizen-facing public API routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models.report import CaseEvent, Report
from app.schemas.public_report import PublicCaseEventRead, PublicReportRead

router = APIRouter(prefix="/api/public", tags=["public"])

PUBLIC_EVENT_MESSAGES = {
    "status_changed": "Report status updated.",
    "priority_changed": "Review priority updated.",
}


def public_event_message(event: CaseEvent) -> str | None:
    """Return a public-safe timeline message or hide the event."""
    return PUBLIC_EVENT_MESSAGES.get(event.event_type)


@router.get("/reports/{public_id}", response_model=PublicReportRead)
def get_public_report(public_id: str, db: Session = Depends(get_db)) -> PublicReportRead:
    """Return limited report details for citizen tracking."""
    report = db.scalar(
        select(Report)
        .where(Report.public_id == public_id)
        .options(selectinload(Report.case_events))
    )
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )

    public_events = []
    for event in report.case_events:
        message = public_event_message(event)
        if message:
            public_events.append(
                PublicCaseEventRead(
                    event_type=event.event_type,
                    message=message,
                    created_at=event.created_at,
                )
            )

    return PublicReportRead(
        public_id=report.public_id,
        status=report.status,
        location_name=report.location_name,
        overall_severity=report.overall_severity,
        road_health_score=report.road_health_score,
        created_at=report.created_at,
        case_events=public_events,
    )
