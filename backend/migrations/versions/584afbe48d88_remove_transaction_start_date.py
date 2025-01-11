"""remove transaction start date

Revision ID: 584afbe48d88
Revises: 010c66f1b9b6
Create Date: 2025-01-09 22:35:49.917438

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '584afbe48d88'
down_revision = '010c66f1b9b6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('recurring_transaction', schema=None) as batch_op:
        batch_op.drop_column('start_date')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('recurring_transaction', schema=None) as batch_op:
        batch_op.add_column(sa.Column('start_date', sa.DATE(), autoincrement=False, nullable=False))

    # ### end Alembic commands ###
