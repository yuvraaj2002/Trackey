from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class SpendCreate(BaseModel):
    label: str = Field(min_length=1, max_length=255)
    amount: Decimal = Field(max_digits=12, decimal_places=2, gt=0)
    category_id: int


class SpendUpdate(BaseModel):
    label: str | None = Field(default=None, min_length=1, max_length=255)
    amount: Decimal | None = Field(default=None, max_digits=12, decimal_places=2, gt=0)

    @model_validator(mode="after")
    def require_at_least_one_field(self) -> "SpendUpdate":
        if self.label is None and self.amount is None:
            raise ValueError("At least one of label or amount must be provided")
        return self


class SpendRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    label: str
    amount: Decimal
    category_id: int
    created_at: datetime
    updated_at: datetime


class SpendListResponse(BaseModel):
    items: list[SpendRead]
    next_cursor: int | None = None
    has_more: bool = False
