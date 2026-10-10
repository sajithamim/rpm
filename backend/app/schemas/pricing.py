
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PricingBase(BaseModel):
    store_id: str = Field(min_length=1, max_length=50)
    sku: str = Field(min_length=1, max_length=100)
    product_name: str = Field(min_length=1, max_length=255)
    price: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    price_date: date


class PricingCreate(PricingBase):
    pass


class PricingUpdate(BaseModel):
    store_id: str | None = Field(default=None, min_length=1, max_length=50)
    sku: str | None = Field(default=None, min_length=1, max_length=100)
    product_name: str | None = Field(default=None, min_length=1, max_length=255)
    price: Decimal | None = Field(
        default=None, ge=0, max_digits=10, decimal_places=2
    )
    price_date: date | None = None


class PricingResponse(PricingBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PricingListResponse(BaseModel):
    items: list[PricingResponse]
    total: int
    page: int
    page_size: int
    total_pages: int