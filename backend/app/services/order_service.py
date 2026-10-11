from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.menu import MenuItem
from app.models.order import Order, OrderItem, OrderStatus, PaymentMethod
from app.models.table import Table
from app.models.user import User
from app.schemas.order import OrderCreate, OrderOut


def _serialize_order(order: Order) -> OrderOut:
    return OrderOut(
        id=order.id,
        table_id=order.table_id,
        table_name=order.table.name if order.table else None,
        customer_name=order.customer_name,
        status=order.status,
        is_paid=order.is_paid,
        payment_method=order.payment_method,
        notes=order.notes,
        total_amount=order.total_amount,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=[
            {
                "id": item.id,
                "menu_item_id": item.menu_item_id,
                "menu_item_name": item.menu_item.name if item.menu_item else None,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "subtotal": item.subtotal,
                "notes": item.notes,
            }
            for item in order.items
        ],
    )


def _load_order(db: Session, order_id: int) -> Order | None:
    return (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.menu_item),
            joinedload(Order.table),
        )
        .filter(Order.id == order_id)
        .first()
    )


def create_order(db: Session, payload: OrderCreate) -> OrderOut:
    if payload.table_id is not None:
        table = (
            db.query(Table)
            .filter(Table.id == payload.table_id, Table.is_active.is_(True))
            .first()
        )
        if not table:
            raise HTTPException(status_code=404, detail="Table not found")

    menu_ids = [item.menu_item_id for item in payload.items]
    menu_items = db.query(MenuItem).filter(MenuItem.id.in_(menu_ids)).all()
    menu_map = {m.id: m for m in menu_items}

    if len(menu_map) != len(set(menu_ids)):
        raise HTTPException(status_code=400, detail="One or more menu items not found")

    order = Order(
        table_id=payload.table_id,
        customer_name=payload.customer_name,
        notes=payload.notes,
        payment_method=payload.payment_method or PaymentMethod.CASH,
        is_paid=False,
        status=OrderStatus.PENDING,
    )

    total = 0.0
    for item in payload.items:
        menu_item = menu_map[item.menu_item_id]
        if not menu_item.is_available:
            raise HTTPException(
                status_code=400, detail=f"Menu item '{menu_item.name}' is unavailable"
            )
        subtotal = menu_item.price * item.quantity
        total += subtotal
        order.items.append(
            OrderItem(
                menu_item_id=menu_item.id,
                quantity=item.quantity,
                unit_price=menu_item.price,
                subtotal=subtotal,
                notes=item.notes,
            )
        )

    order.total_amount = total
    db.add(order)
    db.commit()

    loaded = _load_order(db, order.id)
    return _serialize_order(loaded)


def list_orders(
    db: Session,
    status_filter: OrderStatus | None = None,
    active_only: bool = True,
) -> list[OrderOut]:
    query = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.menu_item),
            joinedload(Order.table),
        )
        .order_by(Order.created_at.desc())
    )

    if status_filter:
        query = query.filter(Order.status == status_filter)
    elif active_only:
        query = query.filter(
            Order.status.notin_([OrderStatus.SERVED, OrderStatus.CANCELLED])
        )

    return [_serialize_order(o) for o in query.all()]


def get_order(db: Session, order_id: int) -> OrderOut:
    order = _load_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _serialize_order(order)


def update_order_status(
    db: Session,
    order_id: int,
    status: OrderStatus,
    current_user: User,
) -> OrderOut:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    order.updated_by = current_user.id
    db.commit()

    loaded = _load_order(db, order_id)
    return _serialize_order(loaded)


def updated_order_payment(
    db: Session,
    order_id: int,
    payment_method: PaymentMethod,
    is_paid: bool,
    current_user: User,
) -> OrderOut:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.is_paid = is_paid
    order.payment_method = payment_method
    order.updated_by = current_user.id
    db.commit()

    loaded = _load_order(db, order_id)
    return _serialize_order(loaded)
