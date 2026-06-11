"""Analytics calculations for saved reports and infrastructure cases."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.report import Report
from app.schemas.analytics import AnalyticsSummary

SEVERITIES = ["low", "medium", "high", "critical"]
STATUSES = ["open", "under_review", "scheduled", "resolved", "rejected"]
PRIORITIES = ["low", "medium", "high", "urgent"]


def empty_counts(keys: list[str]) -> dict[str, int]:
    """Return a zero-filled count mapping for stable dashboard output."""
    return {key: 0 for key in keys}


def build_analytics_summary(db: Session) -> AnalyticsSummary:
    """Build a council-level analytics summary from report records."""
    reports = list(db.scalars(select(Report)).all())

    severity_breakdown = empty_counts(SEVERITIES)
    status_breakdown = empty_counts(STATUSES)
    priority_breakdown = empty_counts(PRIORITIES)

    for report in reports:
        if report.overall_severity in severity_breakdown:
            severity_breakdown[report.overall_severity] += 1
        if report.status in status_breakdown:
            status_breakdown[report.status] += 1
        if report.priority in priority_breakdown:
            priority_breakdown[report.priority] += 1

    total_reports = len(reports)
    average_score = (
        sum(report.road_health_score for report in reports) / total_reports
        if total_reports
        else 0
    )

    recent_reports = sorted(
        reports,
        key=lambda report: report.created_at,
        reverse=True,
    )[:5]

    severity_rank = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    priority_rank = {"urgent": 0, "high": 1, "medium": 2, "low": 3}
    highest_risk_reports = sorted(
        [
            report
            for report in reports
            if report.priority == "urgent"
            or report.overall_severity in {"high", "critical"}
        ],
        key=lambda report: (
            priority_rank.get(report.priority, 4),
            severity_rank.get(report.overall_severity, 4),
            report.road_health_score,
        ),
    )[:5]

    return AnalyticsSummary(
        total_reports=total_reports,
        open_cases=sum(
            1 for report in reports if report.status in {"open", "under_review", "scheduled"}
        ),
        urgent_cases=priority_breakdown["urgent"],
        resolved_cases=status_breakdown["resolved"],
        average_road_health_score=round(average_score, 1),
        severity_breakdown=severity_breakdown,
        status_breakdown=status_breakdown,
        priority_breakdown=priority_breakdown,
        recent_reports=recent_reports,
        highest_risk_reports=highest_risk_reports,
    )

