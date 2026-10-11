from datetime import datetime

from pydantic import BaseModel, Field


class QrisSettingOut(BaseModel):
    qris_image_url: str
    merchant_name: str | None = "POS System"
    updated_at: datetime | None = None


class MerchantNameUpdate(BaseModel):
    merchant_name: str = Field(min_length=1, max_length=100)
