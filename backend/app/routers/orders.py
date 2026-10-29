from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import settings
from app.core.storage import generate_payment_proof_path, upload_bytes
from app.dependencies import DbSession, StaffUser
from app.models.order import Order, OrderStatus
from app.schemas.order import (
    OrderCreate,
    OrderOut,
    OrderPaymentUpdate,
    OrderStatusUpdate,
)
from app.services import order_service

router = APIRouter(prefix="/order", tags=["Orders"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}


@router.post("", response_model=OrderOut, status_code=201)
def create_order(payload: OrderCreate, db: DbSession):
    return order_service.create_order(db, payload)


@router.get("", response_model=list[OrderOut])
def list_orders(
    _: StaffUser,
    db: DbSession,
    status: OrderStatus | None = None,
    active_only: bool = True,
):
    return order_service.list_orders(db, status_filter=status, active_only=active_only)


@router.get("/public/{order_id}", response_model=OrderOut)
def get_order_public(order_id: int, db: DbSession):
    return order_service.get_order(db, order_id)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, _: StaffUser, db: DbSession):
    return order_service.get_order(db, order_id)


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    current_user: StaffUser,
    db: DbSession,
):
    return order_service.update_order_status(db, order_id, payload.status, current_user)


@router.patch("/{order_id}/payment", response_model=OrderOut)
def update_order_payment(
    order_id: int,
    payload: OrderPaymentUpdate,
    current_user: StaffUser,
    db: DbSession,
):
    return order_service.updated_order_payment(
        db, order_id, payload.payment_method, payload.is_paid, current_user
    )


@router.post("/{order_id}/payment-proof", response_model=OrderOut)
async def upload_payment_proof(
    order_id: int,
    db: DbSession,
    file: Annotated[UploadFile, File()],
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.is_paid:
        raise HTTPException(status_code=400, detail="Order is already marked as paid")

    if order.status == OrderStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Cannot upload proof for a cancelled order")

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WEBP, or HEIC images are allowed")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10 MB)")

    path = generate_payment_proof_path(order_id, file.filename or "proof.jpg")
    public_url = upload_bytes(
        bucket=settings.SUPABASE_PAYMENT_PROOF_BUCKET,
        path=path,
        data=data,
        content_type=file.content_type,
        upsert=True,
    )

    order.payment_proof_url = public_url
    db.commit()

    return order_service.get_order(db, order_id)
