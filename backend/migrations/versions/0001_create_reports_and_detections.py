"""Create reports and detections tables.

Revision ID: 0001_create_reports_and_detections
Revises:
Create Date: 2026-06-09
"""

from alembic import op
import sqlalchemy as sa

revision = "0001_create_reports_and_detections"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "reports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("public_id", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("location_name", sa.String(length=255), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("overall_severity", sa.String(length=50), nullable=False),
        sa.Column("road_health_score", sa.Float(), nullable=False),
        sa.Column("original_image_url", sa.Text(), nullable=False),
        sa.Column("annotated_image_url", sa.Text(), nullable=False),
        sa.Column("analysis_mode", sa.String(length=80), nullable=False),
        sa.Column("model_name", sa.String(length=120), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_reports_id"), "reports", ["id"], unique=False)
    op.create_index(op.f("ix_reports_public_id"), "reports", ["public_id"], unique=True)

    op.create_table(
        "detections",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("report_id", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(length=120), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("severity", sa.String(length=50), nullable=False),
        sa.Column("x1", sa.Integer(), nullable=False),
        sa.Column("y1", sa.Integer(), nullable=False),
        sa.Column("x2", sa.Integer(), nullable=False),
        sa.Column("y2", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["report_id"], ["reports.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_detections_id"), "detections", ["id"], unique=False)
    op.create_index(op.f("ix_detections_report_id"), "detections", ["report_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_detections_report_id"), table_name="detections")
    op.drop_index(op.f("ix_detections_id"), table_name="detections")
    op.drop_table("detections")
    op.drop_index(op.f("ix_reports_public_id"), table_name="reports")
    op.drop_index(op.f("ix_reports_id"), table_name="reports")
    op.drop_table("reports")

