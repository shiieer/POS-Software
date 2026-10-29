from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.user import UserRole


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6)
    role: UserRole = UserRole.STAFF


class UserUpdate(BaseModel):
    is_active: bool | None = None
    role: UserRole | None = None
    password: str | None = Field(default=None, min_length=6)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    account_code: str | None = None
    username: str
    role: UserRole
    is_active: bool
    avatar_url: str | None = None
    created_at: datetime
