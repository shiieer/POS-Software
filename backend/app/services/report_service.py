from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session, joinedload

from app.models.order import Order, OrderItem
from app.schemas.report import SalesPoint, SalesReport, TopSellingItem

BUCKET_COUNT = 7


def _naive(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is not None:
        return dt.astimezone(UTC).replace(tzinfo=None)
    return dt


def _order_time(order: Order) -> datetime:
    created = order.created_at
    if created.tzinfo is not None:
        return created.replace(tzinfo=None)
    return created


def _sales_over_time(
    paid_orders: list[Order],
    start_date: datetime | None,
    end_date: datetime | None,
) -> list[SalesPoint]:
    range_end = _naive(end_date) or datetime.now(UTC).replace(tzinfo=None)
    range_start = _naive(start_date)
    if range_start is None:
        range_start = (range_end - timedelta(days=6)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
    if range_end <= range_start:
        range_end = range_start + timedelta(hours=1)

    span = range_end - range_start
    bucket_size = span / BUCKET_COUNT
    totals = [0.0] * BUCKET_COUNT

    for order in paid_orders:
        created = _order_time(order)
        if created < range_start or created > range_end:
            continue
        idx = int((created - range_start) / bucket_size)
        if idx >= BUCKET_COUNT:
            idx = BUCKET_COUNT - 1
        if idx < 0:
            continue
        totals[idx] += order.total_amount

    points: list[SalesPoint] = []
    for i, value in enumerate(totals):
        bucket_start = range_start + bucket_size * i
        if span <= timedelta(days=2):
            label = bucket_start.strftime("%H:%M")
        elif span <= timedelta(days=8):
            label = bucket_start.strftime("%a")
        else:
            label = bucket_start.strftime("%d/%m")
        points.append(SalesPoint(label=label, value=value))
    return points


def generate_sales_report(
    db: Session,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
) -> SalesReport:
    query = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.menu_item)
    )

    if start_date:
        query = query.filter(Order.created_at >= start_date)
    if end_date:
        query = query.filter(Order.created_at <= end_date)

    orders = query.all()
    paid_orders = [o for o in orders if o.is_paid]

    buckets: dict[int, dict] = {}
    for order in paid_orders:
        for item in order.items:
            name = item.menu_item.name if item.menu_item else "Unknown"
            row = buckets.setdefault(
                item.menu_item_id, {"name": name, "qty": 0, "revenue": 0.0}
            )
            row["qty"] += item.quantity
            row["revenue"] += item.subtotal

    top_items = [
        TopSellingItem(
            menu_item_id=item_id,
            name=data["name"],
            quantity_sold=data["qty"],
            revenue=data["revenue"],
        )
        for item_id, data in sorted(
            buckets.items(), key=lambda kv: kv[1]["revenue"], reverse=True
        )[:5]
    ]

    total_revenue = sum(o.total_amount for o in paid_orders)
    paid_count = len(paid_orders)

    by_payment_method: dict[str, float] = {}
    for order in paid_orders:
        key = order.payment_method.value if order.payment_method else "unknown"
        by_payment_method[key] = by_payment_method.get(key, 0.0) + order.total_amount

    by_status: dict[str, int] = {}
    for order in orders:
        key = order.status.value
        by_status[key] = by_status.get(key, 0) + 1

    return SalesReport(
        start_date=start_date,
        end_date=end_date,
        total_orders=len(orders),
        paid_orders=paid_count,
        total_revenue=total_revenue,
        average_order_value=(total_revenue / paid_count) if paid_count else 0.0,
        by_payment_method=by_payment_method,
        by_status=by_status,
        sales_over_time=_sales_over_time(paid_orders, start_date, end_date),
        top_items=top_items,
    )
