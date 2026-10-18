from datetime import UTC, datetime, timedelta

from tests.helpers.factories import create_menu_item_db, create_order_payload


def test_sales_report_requires_admin(client, staff_headers):
    response = client.get("/reports/sales", headers=staff_headers)
    assert response.status_code == 403


def test_sales_report_empty(client, admin_headers):
    response = client.get("/reports/sales", headers=admin_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["total_orders"] == 0
    assert data["paid_orders"] == 0
    assert data["total_revenue"] == 0


def test_sales_report_with_paid_order(client, db_session, admin_headers, staff_headers):
    menu = create_menu_item_db(db_session, price=50000)
    order_id = client.post(
        "/order", json=create_order_payload(menu.id, quantity=1)
    ).json()["id"]

    client.patch(
        f"/order/{order_id}/payment",
        headers=staff_headers,
        json={"payment_method": "qris", "is_paid": True},
    )

    response = client.get("/reports/sales", headers=admin_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["total_orders"] == 1
    assert data["paid_orders"] == 1
    assert data["total_revenue"] == 50000


def test_sales_report_with_date_filters(
    client, db_session, admin_headers, staff_headers
):
    menu = create_menu_item_db(db_session, price=30000)
    order_id = client.post(
        "/order", json=create_order_payload(menu.id, quantity=1)
    ).json()["id"]

    client.patch(
        f"/order/{order_id}/payment",
        headers=staff_headers,
        json={"payment_method": "cash", "is_paid": True},
    )

    now = datetime.now(UTC)
    start = (now - timedelta(days=1)).isoformat()
    end = (now + timedelta(days=1)).isoformat()

    response = client.get(
        "/reports/sales",
        headers=admin_headers,
        params={"start_date": start, "end_date": end},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total_orders"] == 1
    assert data["total_revenue"] == 30000
