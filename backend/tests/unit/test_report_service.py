from datetime import UTC, datetime, timedelta

from app.schemas.order import OrderCreate, OrderItemCreate
from app.services import order_service, report_service
from tests.helpers.factories import create_menu_item_db


def test_generate_sales_report_with_date_range(db_session):
    menu = create_menu_item_db(db_session, price=20000)

    order_service.create_order(
        db_session,
        OrderCreate(items=[OrderItemCreate(menu_item_id=menu.id, quantity=1)]),
    )

    now = datetime.now(UTC)
    report = report_service.generate_sales_report(
        db_session, start_date=now - timedelta(days=1), end_date=now + timedelta(days=1)
    )

    assert report.total_orders == 1
    assert report.start_date is not None
    assert report.end_date is not None


def test_generate_sales_report_no_dates(db_session):
    report = report_service.generate_sales_report(db_session)

    assert report.total_orders == 0
    assert report.total_revenue == 0.0
    assert report.start_date is None
    assert report.end_date is None
    assert len(report.sales_over_time) == 7


def test_generate_sales_report_timezone_aware_dates(db_session):

    from datetime import datetime, timedelta

    now = datetime.now(UTC)
    report = report_service.generate_sales_report(
        db_session,
        start_date=now - timedelta(hours=1),
        end_date=now + timedelta(hours=1),
    )

    assert report.start_date is not None
    assert report.end_date is not None


def test_sales_over_time_equal_start_end(db_session):

    from datetime import datetime

    ts = datetime.now(UTC)
    report = report_service.generate_sales_report(
        db_session, start_date=ts, end_date=ts
    )

    assert len(report.sales_over_time) == 7


def test_generate_sales_report_payment_method_and_status(db_session):

    from datetime import datetime, timedelta

    menu = create_menu_item_db(db_session, price=10000)
    order_service.create_order(
        db_session,
        OrderCreate(items=[OrderItemCreate(menu_item_id=menu.id, quantity=2)]),
    )

    now = datetime.now(UTC)
    report = report_service.generate_sales_report(
        db_session,
        start_date=now - timedelta(days=30),
        end_date=now + timedelta(days=1),
    )

    assert report.total_orders >= 1
    assert any("/" in p.label for p in report.sales_over_time)


def test_generate_sales_report_hourly_labels(db_session):

    from datetime import datetime, timedelta

    now = datetime.now(UTC)
    report = report_service.generate_sales_report(
        db_session,
        start_date=now - timedelta(hours=12),
        end_date=now + timedelta(hours=12),
    )

    assert len(report.sales_over_time) == 7

    import re

    for point in report.sales_over_time:
        assert re.match(r"\d{2}:\d{2}", point.label)


def test_sales_over_time_out_of_range_and_edge_orders(db_session):

    from datetime import datetime, timedelta

    from app.models.order import Order, OrderStatus, PaymentMethod

    now = datetime.now()

    order_naive = Order(
        customer_name="Naive Order",
        total_amount=15000,
        status=OrderStatus.SERVED,
        payment_method=PaymentMethod.CASH,
        is_paid=True,
    )
    order_naive.created_at = now

    order_tz = Order(
        customer_name="TZ Order",
        total_amount=10000,
        status=OrderStatus.SERVED,
        payment_method=PaymentMethod.CASH,
        is_paid=True,
    )
    order_tz.created_at = datetime.now(UTC)

    order_before = Order(
        customer_name="Before Order",
        total_amount=5000,
        status=OrderStatus.SERVED,
        payment_method=PaymentMethod.CASH,
        is_paid=True,
    )
    order_before.created_at = now - timedelta(days=2)

    order_after = Order(
        customer_name="After Order",
        total_amount=6000,
        status=OrderStatus.SERVED,
        payment_method=PaymentMethod.CASH,
        is_paid=True,
    )
    order_after.created_at = now + timedelta(days=5)

    order_at_end = Order(
        customer_name="End Order",
        total_amount=20000,
        status=OrderStatus.SERVED,
        payment_method=PaymentMethod.CASH,
        is_paid=True,
    )
    order_at_end.created_at = now + timedelta(days=7)

    points = report_service._sales_over_time(
        paid_orders=[order_before, order_after, order_naive, order_tz, order_at_end],
        start_date=now,
        end_date=now + timedelta(days=7),
    )

    assert len(points) == 7

    class FlakyTime:
        tzinfo = None

        def __init__(self, t):
            self.t = t

        def __lt__(self, other):
            return False

        def __gt__(self, other):
            return False

        def __sub__(self, other):
            return timedelta(days=-1)

    class MockOrder:
        created_at = FlakyTime(now)
        total_amount = 50.0

    points_neg = report_service._sales_over_time(
        paid_orders=[MockOrder()],
        start_date=now,
        end_date=now + timedelta(days=1),
    )
    assert len(points_neg) == 7
