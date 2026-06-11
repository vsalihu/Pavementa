"""Report persistence API routes."""

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import asc, desc, or_, select
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models.report import Report
from app.schemas.report import ReportCreate, ReportListItem, ReportRead
from app.services.report_service import create_report

router = APIRouter(prefix="/api/reports", tags=["reports"])


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
    report = db.scalar(
        select(Report)
        .where(Report.public_id == public_id)
        .options(selectinload(Report.detections))
    )
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )
    return report
