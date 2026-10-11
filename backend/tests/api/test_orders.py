from tests.helpers.factories import (
    create_menu_item_db,
    create_order_payload,
    create_table_db,
)


def test_create_order_success(client, db_session):
    table = create_table_db(db_session)
    menu = create_menu_item_db(db_session, price=10000)

    response = client.post(
        "/order", json=create_order_payload(menu.id, table_id=table.id, quantity=2)
    )

    assert response.status_code == 201
    data = response.json()
    assert data["table_id"] == table.id
    assert data["status"] == "pending"
    assert data["total_amount"] == 20000
    assert len(data["items"]) == 1


def test_create_order_invalid_menu(client):
    response = client.post("/order", json=create_order_payload(menu_item_id=9999))

    assert response.status_code == 400


def test_list_order_status(client, db_session, staff_headers):
    menu = create_menu_item_db(db_session)
    create_resp = client.post("/order", json=create_order_payload(menu.id))
    order_id = create_resp.json()["id"]

    response = client.patch(
        f"/order/{order_id}/status", headers=staff_headers, json={"status": "preparing"}
    )

    assert response.status_code == 200
    assert response.json()["status"] == "preparing"


def test_update_order_payment(client, db_session, staff_headers):
    menu = create_menu_item_db(db_session)
    order_id = client.post("/order", json=create_order_payload(menu.id)).json()["id"]

    response = client.patch(
        f"/order/{order_id}/payment",
        headers=staff_headers,
        json={"payment_method": "cash", "is_paid": True},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["is_paid"] is True
    assert data["payment_method"] == "cash"


def test_create_order_with_zero_quantity(client, db_session):
    menu = create_menu_item_db(db_session, price=10000)

    response = client.post(
        "/order",
        json={
            "customer_name": "Ruka",
            "items": [{"menu_item_id": menu.id, "quantity": 0}],
        },
    )

    assert response.status_code == 422


def test_create_order_with_empty_items(client):
    response = client.post("/order", json={"customer_name": "Ruka", "items": []})

    assert response.status_code == 422


def test_create_order_with_unavailable_menu_item(client, db_session):
    menu = create_menu_item_db(db_session, price=10000, is_available=False)

    response = client.post("/order", json=create_order_payload(menu.id, quantity=1))

    assert response.status_code == 400
    assert "unavailable" in response.json()["detail"]


def test_create_order_with_invalid_table(client, db_session):
    menu = create_menu_item_db(db_session, price=10000)

    response = client.post(
        "/order", json=create_order_payload(menu.id, table_id=9999, quantity=1)
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Table not found"


def test_list_orders(client, db_session, staff_headers):
    menu = create_menu_item_db(db_session)
    client.post("/order", json=create_order_payload(menu.id, quantity=1))

    response = client.get("/order", headers=staff_headers)

    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_list_orders_with_status_filter(client, db_session, staff_headers):
    menu = create_menu_item_db(db_session)
    order_id = client.post(
        "/order", json=create_order_payload(menu.id, quantity=1)
    ).json()["id"]

    client.patch(
        f"/order/{order_id}/status", headers=staff_headers, json={"status": "preparing"}
    )

    response = client.get(
        "/order", headers=staff_headers, params={"status": "preparing"}
    )

    assert response.status_code == 200
    assert all(o["status"] == "preparing" for o in response.json())


def test_get_order_by_id(client, db_session, staff_headers):
    menu = create_menu_item_db(db_session)
    order_id = client.post(
        "/order", json=create_order_payload(menu.id, quantity=1)
    ).json()["id"]

    response = client.get(f"/order/{order_id}", headers=staff_headers)

    assert response.status_code == 200
    assert response.json()["id"] == order_id


def test_get_order_not_found(client, staff_headers):
    response = client.get("/order/9999", headers=staff_headers)

    assert response.status_code == 404
    assert response.json()["detail"] == "Order not found"


def test_update_order_status_not_found(client, staff_headers):
    response = client.patch(
        "/order/9999/status", headers=staff_headers, json={"status": "preparing"}
    )

    assert response.status_code == 404


def test_update_order_payment_not_found(client, staff_headers):
    response = client.patch(
        "/order/9999/payment",
        headers=staff_headers,
        json={"payment_method": "cash", "is_paid": True},
    )

    assert response.status_code == 404


def test_get_order_public_success(client, db_session):
    menu = create_menu_item_db(db_session)
    order_id = client.post(
        "/order", json=create_order_payload(menu.id, quantity=1)
    ).json()["id"]

    response = client.get(f"/order/public/{order_id}")

    assert response.status_code == 200
    assert response.json()["id"] == order_id


def test_create_order_with_qris_payment_method(client, db_session):
    menu = create_menu_item_db(db_session)
    payload = create_order_payload(menu.id, quantity=1)
    payload["payment_method"] = "qris"

    response = client.post("/order", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["payment_method"] == "qris"
    assert data["is_paid"] is False
