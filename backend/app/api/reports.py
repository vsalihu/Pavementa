"""Report persistence API routes."""

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy import asc, desc, or_, select
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models.report import Report
from app.schemas.report import (
    CaseEventCreate,
    CaseEventRead,
    ReportCreate,
    ReportListItem,
    ReportRead,
    ReportUpdate,
)
from app.services.export_service import build_csv_report, build_pdf_report
from app.services.report_service import (
    create_manual_case_event,
    create_report,
    update_report_case,
)

router = APIRouter(prefix="/api/reports", tags=["reports"])


def fetch_report_or_404(public_id: str, db: Session) -> Report:
    """Fetch one report with detections or raise a 404 response."""
    report = db.scalar(
        select(Report)
        .where(Report.public_id == public_id)
        .options(selectinload(Report.detections), selectinload(Report.case_events))
    )
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )
    return report


@router.post("", response_model=ReportRead, status_code=status.HTTP_201_CREATED)
def save_report(payload: ReportCreate, db: Session = Depends(get_db)) -> Report:
    """Save a detection analysis result as a road damage report."""
    return create_report(db, payload)


@router.get("", response_model=list[ReportListItem])
def list_reports(
    search: str | None = Query(default=None),
    severity: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    sort: Literal["newest", "oldest", "road_health_asc", "road_health_desc"] = "newest",
    db: Session = Depends(get_db),
) -> list[Report]:
    """Return saved reports with registry search, filtering, and sorting."""
    query = select(Report)

    if search:
        term = f"%{search.strip()}%"
        query = query.where(
            or_(
                Report.public_id.ilike(term),
                Report.location_name.ilike(term),
                Report.title.ilike(term),
            )
        )

    if severity:
        query = query.where(Report.overall_severity == severity)

    if status_filter:
        query = query.where(Report.status == status_filter)

    sort_columns = {
        "newest": desc(Report.created_at),
        "oldest": asc(Report.created_at),
        "road_health_asc": asc(Report.road_health_score),
        "road_health_desc": desc(Report.road_health_score),
    }

    return list(db.scalars(query.order_by(sort_columns[sort])).all())


@router.get("/{public_id}", response_model=ReportRead)
def get_report(public_id: str, db: Session = Depends(get_db)) -> Report:
    """Return one report and its detections by public identifier."""
    return fetch_report_or_404(public_id, db)


@router.patch("/{public_id}", response_model=ReportRead)
def update_report(
    public_id: str,
    payload: ReportUpdate,
    db: Session = Depends(get_db),
) -> Report:
    """Update case-management fields on a report."""
    report = fetch_report_or_404(public_id, db)
    return update_report_case(db, report, payload)


@router.post(
    "/{public_id}/events",
    response_model=CaseEventRead,
    status_code=status.HTTP_201_CREATED,
)
def add_report_event(
    public_id: str,
    payload: CaseEventCreate,
    db: Session = Depends(get_db),
):
    """Add a manual case note to the report timeline."""
    report = fetch_report_or_404(public_id, db)
    return create_manual_case_event(db, report, payload)


@router.get("/{public_id}/export/pdf")
def export_report_pdf(public_id: str, db: Session = Depends(get_db)) -> Response:
    """Download a council-ready PDF export for one report."""
    report = fetch_report_or_404(public_id, db)
    pdf_bytes = build_pdf_report(report)
    filename = f"{report.public_id}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{public_id}/export/csv")
def export_report_csv(public_id: str, db: Session = Depends(get_db)) -> Response:
    """Download a CSV export for one report."""
    report = fetch_report_or_404(public_id, db)
    csv_text = build_csv_report(report)
    filename = f"{report.public_id}.csv"

    return Response(
        content=csv_text,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
