from datetime import datetime, timezone
from enum import StrEnum

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class CategoryStatus(StrEnum):
    ACTIVE = "active"
    DELETED = "deleted"


class SpendCategory(Base):
    __tablename__ = "spend_categories"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=CategoryStatus.ACTIVE,
        server_default=CategoryStatus.ACTIVE.value,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        onupdate=utc_now,
    )

    @property
    def is_deleted(self) -> bool:
        return self.status == CategoryStatus.DELETED

    def soft_delete(self) -> None:
        self.status = CategoryStatus.DELETED
        self.updated_at = utc_now()
