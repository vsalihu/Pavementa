"""Report persistence API routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
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
def list_reports(db: Session = Depends(get_db)) -> list[Report]:
    """Return saved reports in newest-first order."""
    return list(db.scalars(select(Report).order_by(desc(Report.created_at))).all())


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

