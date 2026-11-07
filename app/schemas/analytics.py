from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class AnalyticsPeriod(BaseModel):
    start: datetime
    end: datetime


class AnalyticsSummary(BaseModel):
    total_spend: Decimal
    transaction_count: int
    average_spend: Decimal


class CategorySpendBreakdown(BaseModel):
    category_id: int
    category_name: str
    total_amount: Decimal
    transaction_count: int
    average_amount: Decimal
    percentage_of_total: Decimal = Field(
        description="Share of total spend for the period, 0-100"
    )


class TopSpendItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    label: str
    amount: Decimal
    category_id: int
    category_name: str
    created_at: datetime


class HighestSpendByCategory(BaseModel):
    category_id: int
    category_name: str
    spend_id: int
    label: str
    amount: Decimal
    created_at: datetime


class AnalyticsResponse(BaseModel):
    period: AnalyticsPeriod
    summary: AnalyticsSummary
    by_category: list[CategorySpendBreakdown]
    top_spends: list[TopSpendItem]
    highest_per_category: list[HighestSpendByCategory]
