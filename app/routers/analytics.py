from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import CategoryStatus, Spend, SpendCategory
from app.db.session import get_db
from app.schemas.analytics import (
    AnalyticsPeriod,
    AnalyticsResponse,
    AnalyticsSummary,
    CategorySpendBreakdown,
    HighestSpendByCategory,
    TopSpendItem,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])

ZERO = Decimal("0.00")
HUNDRED = Decimal("100")
MONEY = Decimal("0.01")
PERCENT = Decimal("0.01")


def _quantize_money(value: Decimal) -> Decimal:
    return value.quantize(MONEY, rounding=ROUND_HALF_UP)


def _quantize_percent(value: Decimal) -> Decimal:
    return value.quantize(PERCENT, rounding=ROUND_HALF_UP)


@router.get("", response_model=AnalyticsResponse)
def get_analytics(
    start: datetime = Query(..., description="Period start (inclusive)"),
    end: datetime = Query(..., description="Period end (inclusive)"),
    top_limit: int = Query(default=5, ge=1, le=50),
    db: Session = Depends(get_db),
) -> AnalyticsResponse:
    if start > end:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="start must be less than or equal to end",
        )

    period_filter = (
        Spend.created_at >= start,
        Spend.created_at <= end,
    )

    total_spend, transaction_count = db.execute(
        select(
            func.coalesce(func.sum(Spend.amount), 0),
            func.count(Spend.id),
        ).where(*period_filter)
    ).one()

    total_spend = _quantize_money(Decimal(total_spend))
    transaction_count = int(transaction_count)
    average_spend = (
        _quantize_money(total_spend / transaction_count)
        if transaction_count
        else ZERO
    )

    category_rows = db.execute(
        select(
            SpendCategory.id,
            SpendCategory.name,
            func.coalesce(func.sum(Spend.amount), 0),
            func.count(Spend.id),
        )
        .join(Spend, Spend.category_id == SpendCategory.id)
        .where(
            *period_filter,
            SpendCategory.status == CategoryStatus.ACTIVE,
        )
        .group_by(SpendCategory.id, SpendCategory.name)
        .order_by(func.sum(Spend.amount).desc())
    ).all()

    by_category: list[CategorySpendBreakdown] = []
    for category_id, category_name, amount, count in category_rows:
        amount = _quantize_money(Decimal(amount))
        count = int(count)
        percentage = (
            _quantize_percent((amount / total_spend) * HUNDRED)
            if total_spend
            else ZERO
        )
        by_category.append(
            CategorySpendBreakdown(
                category_id=category_id,
                category_name=category_name,
                total_amount=amount,
                transaction_count=count,
                average_amount=_quantize_money(amount / count) if count else ZERO,
                percentage_of_total=percentage,
            )
        )

    top_rows = db.execute(
        select(
            Spend.id,
            Spend.label,
            Spend.amount,
            Spend.category_id,
            SpendCategory.name,
            Spend.created_at,
        )
        .join(SpendCategory, Spend.category_id == SpendCategory.id)
        .where(*period_filter)
        .order_by(Spend.amount.desc(), Spend.id.desc())
        .limit(top_limit)
    ).all()

    top_spends = [
        TopSpendItem(
            id=row.id,
            label=row.label,
            amount=_quantize_money(Decimal(row.amount)),
            category_id=row.category_id,
            category_name=row.name,
            created_at=row.created_at,
        )
        for row in top_rows
    ]

    highest_subquery = (
        select(
            Spend.category_id.label("category_id"),
            func.max(Spend.amount).label("max_amount"),
        )
        .where(*period_filter)
        .group_by(Spend.category_id)
        .subquery()
    )

    highest_rows = db.execute(
        select(
            SpendCategory.id,
            SpendCategory.name,
            Spend.id,
            Spend.label,
            Spend.amount,
            Spend.created_at,
        )
        .join(Spend, Spend.category_id == SpendCategory.id)
        .join(
            highest_subquery,
            (Spend.category_id == highest_subquery.c.category_id)
            & (Spend.amount == highest_subquery.c.max_amount),
        )
        .where(*period_filter)
        .order_by(Spend.amount.desc(), Spend.id.desc())
    ).all()

    seen_categories: set[int] = set()
    highest_per_category: list[HighestSpendByCategory] = []
    for category_id, category_name, spend_id, label, amount, created_at in highest_rows:
        if category_id in seen_categories:
            continue
        seen_categories.add(category_id)
        highest_per_category.append(
            HighestSpendByCategory(
                category_id=category_id,
                category_name=category_name,
                spend_id=spend_id,
                label=label,
                amount=_quantize_money(Decimal(amount)),
                created_at=created_at,
            )
        )

    return AnalyticsResponse(
        period=AnalyticsPeriod(start=start, end=end),
        summary=AnalyticsSummary(
            total_spend=total_spend,
            transaction_count=transaction_count,
            average_spend=average_spend,
        ),
        by_category=by_category,
        top_spends=top_spends,
        highest_per_category=highest_per_category,
    )
