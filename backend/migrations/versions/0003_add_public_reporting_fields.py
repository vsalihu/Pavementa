"""Add citizen reporting fields.

Revision ID: 0003_add_public_reporting_fields
Revises: 0002_add_case_management
Create Date: 2026-06-11
"""

from alembic import op
import sqlalchemy as sa

revision = "0003_add_public_reporting_fields"
down_revision = "0002_add_case_management"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "reports",
        sa.Column(
            "source",
            sa.String(length=50),
            nullable=False,
            server_default="internal",
        ),
    )
    op.add_column("reports", sa.Column("citizen_name", sa.String(length=255), nullable=True))
    op.add_column("reports", sa.Column("citizen_email", sa.String(length=255), nullable=True))
    op.add_column("reports", sa.Column("citizen_description", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("reports", "citizen_description")
    op.drop_column("reports", "citizen_email")
    op.drop_column("reports", "citizen_name")
    op.drop_column("reports", "source")
