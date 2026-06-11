"""SQLAlchemy models for road damage reports and detections."""

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Report(Base):
    """Persisted road damage analysis report."""

    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    public_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    location_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending_review")
    priority: Mapped[str] = mapped_column(String(50), default="medium")
    source: Mapped[str] = mapped_column(String(50), default="internal")
    citizen_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    citizen_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    citizen_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    assigned_to: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reviewed_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    scheduled_repair_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    overall_severity: Mapped[str] = mapped_column(String(50), default="low")
    road_health_score: Mapped[float] = mapped_column(Float, default=100.0)
    original_image_url: Mapped[str] = mapped_column(Text)
    annotated_image_url: Mapped[str] = mapped_column(Text)
    analysis_mode: Mapped[str] = mapped_column(String(80), default="prototype")
    model_name: Mapped[str] = mapped_column(String(120), default="yolov8n.pt")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    detections: Mapped[list["Detection"]] = relationship(
        back_populates="report",
        cascade="all, delete-orphan",
    )
    case_events: Mapped[list["CaseEvent"]] = relationship(
        back_populates="report",
        cascade="all, delete-orphan",
        order_by=lambda: CaseEvent.created_at.desc(),
    )


class Detection(Base):
    """Persisted object detection attached to a report."""

    __tablename__ = "detections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    report_id: Mapped[int] = mapped_column(
        ForeignKey("reports.id", ondelete="CASCADE"),
        index=True,
    )
    label: Mapped[str] = mapped_column(String(120))
    confidence: Mapped[float] = mapped_column(Float)
    severity: Mapped[str] = mapped_column(String(50))
    x1: Mapped[int] = mapped_column(Integer)
    y1: Mapped[int] = mapped_column(Integer)
    x2: Mapped[int] = mapped_column(Integer)
    y2: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    report: Mapped[Report] = relationship(back_populates="detections")


class CaseEvent(Base):
    """Timeline event attached to an infrastructure case."""

    __tablename__ = "case_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    report_id: Mapped[int] = mapped_column(
        ForeignKey("reports.id", ondelete="CASCADE"),
        index=True,
    )
    event_type: Mapped[str] = mapped_column(String(80))
    message: Mapped[str] = mapped_column(Text)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    report: Mapped[Report] = relationship(back_populates="case_events")
