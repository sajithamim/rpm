
from datetime import date

from sqlalchemy import select, func
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.pricing import PricingRecord
from app.schemas.pricing import PricingCreate, PricingUpdate


class PricingRepository:

    @staticmethod
    def create(db: Session, data: PricingCreate) -> PricingRecord:
        record = PricingRecord(**data.model_dump())

        db.add(record)
        db.commit()
        db.refresh(record)

        return record

    @staticmethod
    def get_by_id(db: Session, record_id: int):
        statement = select(PricingRecord).where(
            PricingRecord.id == record_id
        )
        return db.scalar(statement)

    @staticmethod
    def search(
        db: Session,
        store_id: str | None = None,
        sku: str | None = None,
        product_name: str | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        page: int = 1,
        page_size: int = 20,
    ):
        statement = select(PricingRecord)

        if store_id:
            statement = statement.where(
                PricingRecord.store_id == store_id
            )

        if sku:
            statement = statement.where(
                PricingRecord.sku == sku
            )

        if product_name:
            statement = statement.where(
                PricingRecord.product_name.ilike(f"%{product_name}%")
            )

        if date_from:
            statement = statement.where(
                PricingRecord.price_date >= date_from
            )

        if date_to:
            statement = statement.where(
                PricingRecord.price_date <= date_to
            )

        count_statement = select(func.count()).select_from(
            statement.order_by(None).subquery()
        )
        total = db.scalar(count_statement) or 0

        statement = (
            statement
            .order_by(PricingRecord.price_date.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        items = list(db.scalars(statement).all())

        return items, total

    @staticmethod
    def update(
        db: Session,
        record: PricingRecord,
        data: PricingUpdate,
    ) -> PricingRecord:
        changes = data.model_dump(exclude_unset=True)

        for field, value in changes.items():
            setattr(record, field, value)

        db.commit()
        db.refresh(record)

        return record

    
    @staticmethod
    def create_many(db: Session, records: list[dict]) -> int:
        now = datetime.utcnow()

        db_records = [
            PricingRecord(
                **record,
                created_at=now,
                updated_at=now,
            )
            for record in records
        ]

        try:
            db.add_all(db_records)
            db.commit()
            return len(db_records)
        except Exception:
            db.rollback()
            raise