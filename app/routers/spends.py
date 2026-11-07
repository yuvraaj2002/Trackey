from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import CategoryStatus, Spend, SpendCategory
from app.db.session import get_db
from app.schemas.spend import SpendCreate, SpendListResponse, SpendRead, SpendUpdate

router = APIRouter(prefix="/spends", tags=["spends"])

PAGE_SIZE = 100


def _get_active_category(db: Session, category_id: int) -> SpendCategory:
    category = db.get(SpendCategory, category_id)
    if category is None or category.status != CategoryStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spend category not found",
        )
    return category


@router.get("", response_model=SpendListResponse)
def list_spends(
    category_id: int | None = Query(default=None),
    cursor: int | None = Query(default=None),
    db: Session = Depends(get_db),
) -> SpendListResponse:
    statement = select(Spend).order_by(Spend.id.asc())

    if category_id is not None:
        statement = statement.where(Spend.category_id == category_id)
    if cursor is not None:
        statement = statement.where(Spend.id > cursor)

    statement = statement.limit(PAGE_SIZE + 1)
    rows = list(db.scalars(statement).all())

    has_more = len(rows) > PAGE_SIZE
    items = rows[:PAGE_SIZE]
    next_cursor = items[-1].id if has_more and items else None

    return SpendListResponse(
        items=items,
        next_cursor=next_cursor,
        has_more=has_more,
    )


@router.post(
    "",
    response_model=SpendRead,
    status_code=status.HTTP_201_CREATED,
)
def create_spend(
    payload: SpendCreate,
    db: Session = Depends(get_db),
) -> Spend:
    _get_active_category(db, payload.category_id)

    spend = Spend(
        label=payload.label,
        amount=payload.amount,
        category_id=payload.category_id,
    )
    db.add(spend)
    db.commit()
    db.refresh(spend)
    return spend


@router.put("/{spend_id}", response_model=SpendRead)
def update_spend(
    spend_id: int,
    payload: SpendUpdate,
    db: Session = Depends(get_db),
) -> Spend:
    spend = db.get(Spend, spend_id)
    if spend is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spend not found",
        )

    if payload.label is not None:
        spend.label = payload.label
    if payload.amount is not None:
        spend.amount = payload.amount

    db.commit()
    db.refresh(spend)
    return spend


@router.delete("/{spend_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_spend(
    spend_id: int,
    db: Session = Depends(get_db),
) -> None:
    spend = db.get(Spend, spend_id)
    if spend is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spend not found",
        )

    db.delete(spend)
    db.commit()
