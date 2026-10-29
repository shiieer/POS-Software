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


def test_cannot_cancel_paid_order(client, db_session, staff_headers):
    menu = create_menu_item_db(db_session)
    order_id = client.post(
        "/order", json=create_order_payload(menu.id, quantity=1)
    ).json()["id"]

    # Mark as paid
    pay_res = client.patch(
        f"/order/{order_id}/payment",
        headers=staff_headers,
        json={"payment_method": "cash", "is_paid": True},
    )
    assert pay_res.status_code == 200
    assert pay_res.json()["is_paid"] is True

    # Attempt to cancel
    cancel_res = client.patch(
        f"/order/{order_id}/status",
        headers=staff_headers,
        json={"status": "cancelled"},
    )
    assert cancel_res.status_code == 400
    assert "Cannot cancel an order that has already been paid" in cancel_res.json()["detail"]


def test_upload_payment_proof(client, db_session, monkeypatch):
    menu = create_menu_item_db(db_session)
    order_id = client.post(
        "/order", json=create_order_payload(menu.id, quantity=1)
    ).json()["id"]

    # Mock upload_bytes
    monkeypatch.setattr(
        "app.routers.orders.upload_bytes",
        lambda bucket, path, data, content_type, upsert=True: f"https://example.supabase.co/storage/v1/object/public/{bucket}/{path}"
    )

    # Invalid file type
    res_invalid = client.post(
        f"/order/{order_id}/payment-proof",
        files={"file": ("test.txt", b"plain text", "text/plain")},
    )
    assert res_invalid.status_code == 400

    # Successful image upload
    fake_img = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 20
    res_success = client.post(
        f"/order/{order_id}/payment-proof",
        files={"file": ("proof.jpg", fake_img, "image/jpeg")},
    )
    assert res_success.status_code == 200
    data = res_success.json()
    assert data["payment_proof_url"] is not None
    assert "payment-proofs" in data["payment_proof_url"]


def test_upload_payment_proof_validation_errors(client, db_session, staff_headers):
    menu = create_menu_item_db(db_session)
    fake_img = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 20

    # 1. Order not found (line 77)
    res_not_found = client.post(
        "/order/999999/payment-proof",
        files={"file": ("proof.jpg", fake_img, "image/jpeg")},
    )
    assert res_not_found.status_code == 404
    assert "Order not found" in res_not_found.json()["detail"]

    # 2. Empty file (line 90)
    order_id = client.post(
        "/order", json=create_order_payload(menu.id, quantity=1)
    ).json()["id"]
    res_empty = client.post(
        f"/order/{order_id}/payment-proof",
        files={"file": ("proof.jpg", b"", "image/jpeg")},
    )
    assert res_empty.status_code == 400
    assert "Empty file" in res_empty.json()["detail"]

    # 3. File too large (line 93)
    large_file = b"x" * (10 * 1024 * 1024 + 1)
    res_large = client.post(
        f"/order/{order_id}/payment-proof",
        files={"file": ("proof.jpg", large_file, "image/jpeg")},
    )
    assert res_large.status_code == 400
    assert "File too large" in res_large.json()["detail"]

    # 4. Order is cancelled (line 83)
    order_id_cancel = client.post(
        "/order", json=create_order_payload(menu.id, quantity=1)
    ).json()["id"]
    client.patch(
        f"/order/{order_id_cancel}/status",
        headers=staff_headers,
        json={"status": "cancelled"},
    )
    res_cancelled = client.post(
        f"/order/{order_id_cancel}/payment-proof",
        files={"file": ("proof.jpg", fake_img, "image/jpeg")},
    )
    assert res_cancelled.status_code == 400
    assert "Cannot upload proof for a cancelled order" in res_cancelled.json()["detail"]

    # 5. Order is already marked as paid (line 80)
    order_id_paid = client.post(
        "/order", json=create_order_payload(menu.id, quantity=1)
    ).json()["id"]
    client.patch(
        f"/order/{order_id_paid}/payment",
        headers=staff_headers,
        json={"payment_method": "cash", "is_paid": True},
    )
    res_paid = client.post(
        f"/order/{order_id_paid}/payment-proof",
        files={"file": ("proof.jpg", fake_img, "image/jpeg")},
    )
    assert res_paid.status_code == 400
    assert "Order is already marked as paid" in res_paid.json()["detail"]

