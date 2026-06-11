"""Add case management fields and timeline events.

Revision ID: 0002_add_case_management
Revises: 0001_create_reports_and_detections
Create Date: 2026-06-11
"""

from alembic import op
import sqlalchemy as sa

revision = "0002_add_case_management"
down_revision = "0001_create_reports_and_detections"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("reports", sa.Column("priority", sa.String(length=50), nullable=False, server_default="medium"))
    op.add_column("reports", sa.Column("assigned_to", sa.String(length=255), nullable=True))
    op.add_column("reports", sa.Column("reviewed_by", sa.String(length=255), nullable=True))
    op.add_column("reports", sa.Column("review_notes", sa.Text(), nullable=True))
    op.add_column("reports", sa.Column("scheduled_repair_date", sa.DateTime(timezone=True), nullable=True))
    op.add_column("reports", sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True))
    op.execute("UPDATE reports SET status = 'open' WHERE status = 'pending_review'")

    op.create_table(
        "case_events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("report_id", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(length=80), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_by", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["report_id"], ["reports.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_case_events_id"), "case_events", ["id"], unique=False)
    op.create_index(op.f("ix_case_events_report_id"), "case_events", ["report_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_case_events_report_id"), table_name="case_events")
    op.drop_index(op.f("ix_case_events_id"), table_name="case_events")
    op.drop_table("case_events")
    op.drop_column("reports", "resolved_at")
    op.drop_column("reports", "scheduled_repair_date")
    op.drop_column("reports", "review_notes")
    op.drop_column("reports", "reviewed_by")
    op.drop_column("reports", "assigned_to")
    op.drop_column("reports", "priority")

