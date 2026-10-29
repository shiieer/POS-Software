from tests.helpers.factories import create_table_api


def test_list_tables_allowed_for_staff(client, staff_headers):
    response = client.get("/tables", headers=staff_headers)
    assert response.status_code == 200


def test_get_table_qr_allowed_for_staff(client, admin_headers, staff_headers):
    created = create_table_api(client, admin_headers, name="Staff QR Table")
    response = client.get(f"/tables/{created['id']}/qr", headers=staff_headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"


def test_create_and_list_tables(client, admin_headers):
    created = create_table_api(client, admin_headers, name="VIP 1")

    response = client.get("/tables", headers=admin_headers)

    assert response.status_code == 200
    names = [t["name"] for t in response.json()]
    assert created["name"] in names
    assert created["qr_url"] is not None


def test_create_duplcate_table_name(client, admin_headers):
    create_table_api(client, admin_headers, name="Duplicate")

    response = client.post("/tables", headers=admin_headers, json={"name": "Duplicate"})
    assert response.status_code == 400


def test_create_table_returns_qr_image_url(client, admin_headers):
    created = create_table_api(client, admin_headers, name="QR Table")

    assert created["qr_url"] is not None
    assert created["qr_image_url"] is not None
    assert created["qr_image_url"].startswith("data:image/png;base64,")


def test_list_tables_includes_qr_image_url(client, admin_headers):
    create_table_api(client, admin_headers, name="Listed Table")

    response = client.get("/tables", headers=admin_headers)

    assert response.status_code == 200
    table = response.json()[0]
    assert table["qr_image_url"] is not None
    assert table["qr_image_url"].startswith("data:image/png;base64,")


def test_get_table_qr_returns_png(client, admin_headers):
    created = create_table_api(client, admin_headers, name="PNG Table")

    response = client.get(
        f"/tables/{created['id']}/qr",
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert len(response.content) > 0


# ── verify_table (lines 23-34) ───────────────────────────────────────────────

def test_verify_table_valid_token(client, admin_headers):
    created = create_table_api(client, admin_headers, name="Verify Valid")

    response = client.get(
        f"/tables/verify?table_id={created['id']}&token={created['qr_token']}"
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == created["id"]
    assert data["name"] == "Verify Valid"


def test_verify_table_wrong_token(client, admin_headers):
    created = create_table_api(client, admin_headers, name="Verify Wrong")

    response = client.get(
        f"/tables/verify?table_id={created['id']}&token=totally_wrong"
    )

    assert response.status_code == 404
    assert "invalid" in response.json()["detail"].lower()


def test_verify_table_inactive_table(client, admin_headers):
    created = create_table_api(client, admin_headers, name="Verify Inactive")

    # Deactivate the table
    client.patch(f"/tables/{created['id']}/active?is_active=false", headers=admin_headers)

    response = client.get(
        f"/tables/verify?table_id={created['id']}&token={created['qr_token']}"
    )

    assert response.status_code == 404


# ── _get_table_or_404 not found (line 53) ────────────────────────────────────

def test_get_table_qr_not_found(client, admin_headers):
    response = client.get("/tables/99999/qr", headers=admin_headers)

    assert response.status_code == 404
    assert response.json()["detail"] == "Table not found"


# ── delete_table (lines 87-105) ──────────────────────────────────────────────

def test_delete_table_success(client, admin_headers, mock_supabase_storage):
    created = create_table_api(client, admin_headers, name="Delete Me")

    response = client.delete(f"/tables/{created['id']}", headers=admin_headers)

    assert response.status_code == 204

    # Table should no longer appear in list
    tables = client.get("/tables", headers=admin_headers).json()
    assert all(t["id"] != created["id"] for t in tables)
    # delete_file was called
    assert ("qr_codes", f"table_{created['id']}.png") in mock_supabase_storage["deleted"]


def test_delete_table_requires_admin(client, staff_headers):
    response = client.delete("/tables/1", headers=staff_headers)

    assert response.status_code == 403


def test_delete_table_not_found(client, admin_headers):
    response = client.delete("/tables/99999", headers=admin_headers)

    assert response.status_code == 404


def test_delete_table_storage_error_returns_502(client, admin_headers, monkeypatch):
    created = create_table_api(client, admin_headers, name="502 Table")

    def boom(**_kwargs):
        raise RuntimeError("Supabase down")

    monkeypatch.setattr("app.routers.tables.delete_file", boom)

    response = client.delete(f"/tables/{created['id']}", headers=admin_headers)

    assert response.status_code == 502
    assert "QR image" in response.json()["detail"]


# ── set_table_active (lines 110-115) ─────────────────────────────────────────

def test_set_table_active_false(client, admin_headers):
    created = create_table_api(client, admin_headers, name="Active Toggle")

    response = client.patch(
        f"/tables/{created['id']}/active?is_active=false", headers=admin_headers
    )

    assert response.status_code == 200
    assert response.json()["is_active"] is False


def test_set_table_active_true(client, admin_headers):
    created = create_table_api(client, admin_headers, name="Reactivate")
    client.patch(f"/tables/{created['id']}/active?is_active=false", headers=admin_headers)

    response = client.patch(
        f"/tables/{created['id']}/active?is_active=true", headers=admin_headers
    )

    assert response.status_code == 200
    assert response.json()["is_active"] is True


def test_set_table_active_not_found(client, admin_headers):
    response = client.patch("/tables/99999/active?is_active=true", headers=admin_headers)

    assert response.status_code == 404
