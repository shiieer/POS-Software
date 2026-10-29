import logging

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.config import settings
from app.core.storage import delete_file, generate_menu_image_path, upload_bytes
from app.dependencies import AdminUser, DbSession
from app.models.menu import MenuItem
from app.models.order import OrderItem
from app.schemas.common import MessageResponse
from app.schemas.menu import MenuItemCreate, MenuItemOut, MenuItemUpdate

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/menu", tags=["Menu"])


@router.get("", response_model=list[MenuItemOut])
def list_menu(db: DbSession, available_only: bool = True):
    query = db.query(MenuItem)
    if available_only:
        query = query.filter(MenuItem.is_available.is_(True))
    return query.order_by(MenuItem.category, MenuItem.name).all()


@router.post("", response_model=MenuItemOut, status_code=status.HTTP_201_CREATED)
def create_menu_item(payload: MenuItemCreate, _: AdminUser, db: DbSession):
    item = MenuItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=MenuItemOut)
def update_menu_item(
    item_id: int, payload: MenuItemUpdate, _: AdminUser, db: DbSession
):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", response_model=MessageResponse)
def delete_menu_item(item_id: int, _: AdminUser, db: DbSession):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    if item.image_url:
        marker = f"/storage/v1/object/public/{settings.SUPABASE_MENU_BUCKET}/"
        if marker in item.image_url:
            old_path = item.image_url.split(marker, 1)[1]
            try:
                delete_file(bucket=settings.SUPABASE_MENU_BUCKET, path=old_path)
            except Exception as err:  # noqa: BLE001
                logger.warning("Failed to delete menu image from storage: %s", err)

    # Ensure item_name is preserved in order_items before detaching reference
    db.query(OrderItem).filter(
        OrderItem.menu_item_id == item_id, OrderItem.item_name.is_(None)
    ).update({OrderItem.item_name: item.name}, synchronize_session=False)

    db.query(OrderItem).filter(OrderItem.menu_item_id == item_id).update(
        {OrderItem.menu_item_id: None}, synchronize_session=False
    )

    db.delete(item)
    db.commit()
    return MessageResponse(message="Menu item deleted")


@router.post("/{item_id}/image", response_model=MenuItemOut)
async def upload_menu_image(
    item_id: int,
    _: AdminUser,
    db: DbSession,
    file: UploadFile = File(...),
):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400, detail="Only JPG, PNG, and WEBP are allowed"
        )
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    path = generate_menu_image_path(file.filename or "menu.jpg")
    public_url = upload_bytes(
        bucket=settings.SUPABASE_MENU_BUCKET,
        path=path,
        data=data,
        content_type=file.content_type,
        upsert=True,
    )
    item.image_url = public_url
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}/image", response_model=MessageResponse)
def delete_menu_image(item_id: int, _: AdminUser, db: DbSession):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    if item.image_url:
        marker = f"/storage/v1/object/public/{settings.SUPABASE_MENU_BUCKET}/"
        if marker in item.image_url:
            old_path = item.image_url.split(marker, 1)[1]
            delete_file(bucket=settings.SUPABASE_MENU_BUCKET, path=old_path)
    item.image_url = None
    db.commit()
    return MessageResponse(message="Menu image deleted")
