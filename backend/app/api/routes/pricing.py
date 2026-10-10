
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.pricing_service import PricingService
from app.utils.csv_processor import parse_pricing_csv
from datetime import date
from app.schemas.pricing import PricingListResponse, PricingResponse, PricingUpdate
router = APIRouter(prefix="/pricing", tags=["Pricing"])


@router.post("/upload")
async def upload_pricing_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a CSV file.",
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="File size must not exceed 10 MB.",
        )

    try:
        valid_records, errors = parse_pricing_csv(content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    imported_count = 0

    if valid_records:
        try:
            imported_count = PricingService.import_pricing_records(
                db, valid_records
            )
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Unable to save pricing records.",
            )

    return {
        "message": "CSV processing completed.",
        "total_valid_rows": len(valid_records),
        "imported_count": imported_count,
        "failed_rows": len(errors),
        "errors": errors,
    }


@router.get("", response_model=PricingListResponse)
def search_pricing(
    store_id: str | None = None,
    sku: str | None = None,
    product_name: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
):
    return PricingService.search_pricing_records(
        db=db,
        store_id=store_id,
        sku=sku,
        product_name=product_name,
        date_from=date_from,
        date_to=date_to,
        page=page,
        page_size=page_size,
    )


@router.get("/{record_id}", response_model=PricingResponse)
def get_pricing_record(
    record_id: int,
    db: Session = Depends(get_db),
):
    return PricingService.get_pricing_record(db, record_id)


@router.put("/{record_id}", response_model=PricingResponse)
def update_pricing_record(
    record_id: int,
    data: PricingUpdate,
    db: Session = Depends(get_db),
):
    return PricingService.update_pricing_record(
        db=db,
        record_id=record_id,
        data=data,
    )