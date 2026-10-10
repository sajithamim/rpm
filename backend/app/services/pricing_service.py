
from datetime import date, datetime
from math import ceil

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.pricing_repo import PricingRepository
from app.schemas.pricing import PricingCreate, PricingUpdate


class PricingService:

    @staticmethod
    def create_pricing_record(
        db: Session,
        data: PricingCreate,
    ):
        now = datetime.utcnow()

        record_data = data.model_dump()

        # Set timestamps for a new record
        from app.models.pricing import PricingRecord

        record = PricingRecord(
            **record_data,
            created_at=now,
            updated_at=now,
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        return record

    @staticmethod
    def get_pricing_record(db: Session, record_id: int):
        record = PricingRepository.get_by_id(db, record_id)

        if record is None:
            raise HTTPException(
                status_code=404,
                detail="Pricing record not found",
            )

        return record

    @staticmethod
    def search_pricing_records(
        db: Session,
        store_id: str | None = None,
        sku: str | None = None,
        product_name: str | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        page: int = 1,
        page_size: int = 20,
    ):
        if page < 1:
            raise HTTPException(
                status_code=400,
                detail="Page must be at least 1",
            )

        if not 1 <= page_size <= 100:
            raise HTTPException(
                status_code=400,
                detail="Page size must be between 1 and 100",
            )

        if date_from and date_to and date_from > date_to:
            raise HTTPException(
                status_code=400,
                detail="date_from cannot be later than date_to",
            )

        items, total = PricingRepository.search(
            db=db,
            store_id=store_id,
            sku=sku,
            product_name=product_name,
            date_from=date_from,
            date_to=date_to,
            page=page,
            page_size=page_size,
        )

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": ceil(total / page_size) if total else 0,
        }

    @staticmethod
    def update_pricing_record(
        db: Session,
        record_id: int,
        data: PricingUpdate,
    ):
        changes = data.model_dump(exclude_unset=True)

        if not changes:
            raise HTTPException(
                status_code=400,
                detail="At least one field must be provided for update",
            )

        if any(value is None for value in changes.values()):
            raise HTTPException(
                status_code=400,
                detail="Updated fields cannot be null",
            )

        record = PricingService.get_pricing_record(db, record_id)

        record.updated_at = datetime.utcnow()

        for field, value in changes.items():
            setattr(record, field, value)

        db.commit()
        db.refresh(record)

        return record

    
    @staticmethod
    def import_pricing_records(db: Session, records: list[dict]) -> int:
        return PricingRepository.create_many(db, records)