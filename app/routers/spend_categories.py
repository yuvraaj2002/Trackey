from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import CategoryStatus, SpendCategory
from app.db.session import get_db
from app.schemas.spend_category import SpendCategoryCreate, SpendCategoryRead

router = APIRouter(prefix="/spend-categories", tags=["spend-categories"])


@router.get("", response_model=list[SpendCategoryRead])
def list_spend_categories(db: Session = Depends(get_db)) -> list[SpendCategory]:
    statement = (
        select(SpendCategory)
        .where(SpendCategory.status == CategoryStatus.ACTIVE)
        .order_by(SpendCategory.id)
    )
    return list(db.scalars(statement).all())


@router.post(
    "",
    response_model=SpendCategoryRead,
    status_code=status.HTTP_201_CREATED,
)
def create_spend_category(
    payload: SpendCategoryCreate,
    db: Session = Depends(get_db),
) -> SpendCategory:
    existing = db.scalar(
        select(SpendCategory).where(SpendCategory.name == payload.name)
    )
    if existing is not None and not existing.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Spend category with this name already exists",
        )

    if existing is not None and existing.is_deleted:
        existing.status = CategoryStatus.ACTIVE
        existing.name = payload.name
        db.commit()
        db.refresh(existing)
        return existing

    category = SpendCategory(name=payload.name, status=CategoryStatus.ACTIVE)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", response_model=SpendCategoryRead)
def delete_spend_category(
    category_id: int,
    db: Session = Depends(get_db),
) -> SpendCategory:
    category = db.get(SpendCategory, category_id)
    if category is None or category.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spend category not found",
        )

    category.soft_delete()
    db.commit()
    db.refresh(category)
    return category
