from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus, PaymentMethod


class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = Field(ge=1)
    notes: str | None = None


class OrderCreate(BaseModel):
    table_id: int | None = None
    customer_name: str | None = None
    notes: str | None = None
    payment_method: PaymentMethod | None = PaymentMethod.CASH
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    menu_item_id: int
    menu_item_name: str | None = None
    quantity: int
    unit_price: float
    subtotal: float
    notes: str | None


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    table_id: int | None
    table_name: str | None
    customer_name: str | None
    status: OrderStatus
    is_paid: bool
    payment_method: PaymentMethod | None
    notes: str | None
    total_amount: float
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemOut]


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderPaymentUpdate(BaseModel):
    payment_method: PaymentMethod
    is_paid: bool = True
