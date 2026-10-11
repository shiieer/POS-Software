from fastapi import APIRouter

from app.dependencies import DbSession, StaffUser
from app.models.order import OrderStatus
from app.schemas.order import (
    OrderCreate,
    OrderOut,
    OrderPaymentUpdate,
    OrderStatusUpdate,
)
from app.services import order_service

router = APIRouter(prefix="/order", tags=["Orders"])


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
