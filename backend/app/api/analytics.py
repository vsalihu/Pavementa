"""Analytics API routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.analytics import AnalyticsSummary
from app.services.analytics_service import build_analytics_summary

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db)) -> AnalyticsSummary:
    """Return council-level analytics for reports and cases."""
    return build_analytics_summary(db)

