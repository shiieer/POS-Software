import logging
from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import BASE_DIR, settings
from app.core.storage import generate_qris_image_path, upload_bytes
from app.dependencies import AdminUser, DbSession, StaffUser
from app.models.setting import Setting
from app.schemas.setting import MerchantNameUpdate, QrisSettingOut

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/settings", tags=["Settings"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
DEFAULT_MERCHANT_NAME = "POS System"


def get_merchant_name(db) -> str:
    setting = db.query(Setting).filter(Setting.key == "merchant_name").first()
    return setting.value.strip() if setting and setting.value and setting.value.strip() else DEFAULT_MERCHANT_NAME


@router.get("/qris", response_model=QrisSettingOut)
def get_qris_setting(db: DbSession):
    setting = db.query(Setting).filter(Setting.key == "qris_image_url").first()
    if setting and setting.value:
        return QrisSettingOut(
            qris_image_url=setting.value,
            merchant_name=get_merchant_name(db),
            updated_at=setting.updated_at,
        )

    return QrisSettingOut(
        qris_image_url="/static/qris.png",
        merchant_name=get_merchant_name(db),
        updated_at=None,
    )


@router.put("/merchant-name", response_model=QrisSettingOut)
def update_merchant_name(
    payload: MerchantNameUpdate,
    _: AdminUser,
    db: DbSession,
):
    merchant_name = payload.merchant_name.strip()
    if not merchant_name:
        raise HTTPException(status_code=422, detail="POS name cannot be empty")

    setting = db.query(Setting).filter(Setting.key == "merchant_name").first()
    if not setting:
        setting = Setting(key="merchant_name", value=merchant_name)
        db.add(setting)
    else:
        setting.value = merchant_name
    db.commit()
    db.refresh(setting)

    qris = db.query(Setting).filter(Setting.key == "qris_image_url").first()
    return QrisSettingOut(
        qris_image_url=qris.value if qris and qris.value else "/static/qris.png",
        merchant_name=merchant_name,
        updated_at=setting.updated_at,
    )


@router.post("/qris/image", response_model=QrisSettingOut)
async def upload_qris_image(
    _: StaffUser,
    db: DbSession,
    file: Annotated[UploadFile, File()],
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400, detail="Only JPG, PNG, and WEBP are allowed"
        )

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    path = generate_qris_image_path(file.filename or "qris.jpg")

    bucket = getattr(settings, "SUPABASE_QRIS", None) or getattr(
        settings, "SUPABASE_QRIS_BUCKET", "qris"
    )
    public_url = upload_bytes(
        bucket=bucket,
        path=path,
        data=data,
        content_type=file.content_type,
        upsert=True,
    )

    # Update or insert setting in database
    setting = db.query(Setting).filter(Setting.key == "qris_image_url").first()
    if not setting:
        setting = Setting(key="qris_image_url", value=public_url)
        db.add(setting)
    else:
        setting.value = public_url

    db.commit()
    db.refresh(setting)

    # Save local fallback copy
    try:
        static_dest = BASE_DIR / "static" / "qris.png"
        static_dest.write_bytes(data)
        web_dest = BASE_DIR.parent / "web" / "public" / "qris.png"
        if web_dest.parent.exists():
            web_dest.write_bytes(data)
    except OSError as err:
        logger.warning("Failed to save local fallback QRIS copy: %s", err)

    return QrisSettingOut(
        qris_image_url=public_url,
        merchant_name=get_merchant_name(db),
        updated_at=setting.updated_at,
    )
