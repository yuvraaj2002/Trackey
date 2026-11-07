from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SpendCategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class SpendCategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    status: str
    created_at: datetime
    updated_at: datetime
