from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Index, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PricingRecord(Base):
    __tablename__ = "pricing_records"

    __table_args__ = (
        UniqueConstraint(
            "store_id",
            "sku",
            "price_date",
            name="uq_pricing_store_sku_date",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    store_id: Mapped[str] = mapped_column(String(50), nullable=False)

    sku: Mapped[str] = mapped_column(String(100), nullable=False)

    product_name: Mapped[str] = mapped_column(String(255), nullable=False)

    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    price_date: Mapped[date] = mapped_column(Date, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    __table_args__ = (
        Index(
            "idx_pricing_store_sku_date",
            "store_id",
            "sku",
            "price_date",
        ),
    )
