from tests.helpers.storage_mocks import make_png_bytes


def test_get_qris_setting_default(client):
    response = client.get("/settings/qris")
    assert response.status_code == 200
    data = response.json()
    assert "qris_image_url" in data
    assert data["qris_image_url"] == "/static/qris.png"


def test_upload_qris_image_success(client, staff_headers, mock_supabase_storage):
    response = client.post(
        "/settings/qris/image",
        headers=staff_headers,
        files={"file": ("my_qris.png", make_png_bytes(), "image/png")},
    )

    assert response.status_code == 200
    data = response.json()
    assert "qris_image_url" in data
    assert "qris" in data["qris_image_url"]

    # Verify subsequent GET returns the uploaded URL
    get_res = client.get("/settings/qris")
    assert get_res.status_code == 200
    assert get_res.json()["qris_image_url"] == data["qris_image_url"]


def test_upload_qris_image_invalid_type(client, staff_headers):
    response = client.post(
        "/settings/qris/image",
        headers=staff_headers,
        files={"file": ("bad.txt", b"hello text", "text/plain")},
    )
    assert response.status_code == 400
    assert "Only JPG, PNG, and WEBP" in response.json()["detail"]


def test_upload_qris_image_requires_auth(client):
    response = client.post(
        "/settings/qris/image",
        files={"file": ("my_qris.png", make_png_bytes(), "image/png")},
    )
    assert response.status_code == 401


def test_update_merchant_name_success(client, admin_headers):
    response = client.put(
        "/settings/merchant-name",
        headers=admin_headers,
        json={"merchant_name": "My Coffee Shop"},
    )

    assert response.status_code == 200
    assert response.json()["merchant_name"] == "My Coffee Shop"


def test_update_merchant_name_updates_existing(client, admin_headers):
    client.put(
        "/settings/merchant-name",
        headers=admin_headers,
        json={"merchant_name": "First Name"},
    )
    response = client.put(
        "/settings/merchant-name",
        headers=admin_headers,
        json={"merchant_name": "Updated Name"},
    )

    assert response.status_code == 200
    assert response.json()["merchant_name"] == "Updated Name"


def test_update_merchant_name_empty_raises_422(client, admin_headers):
    response = client.put(
        "/settings/merchant-name",
        headers=admin_headers,
        json={"merchant_name": "   "},
    )

    assert response.status_code == 422
    assert "cannot be empty" in response.json()["detail"]


def test_update_merchant_name_requires_admin(client, staff_headers):
    response = client.put(
        "/settings/merchant-name",
        headers=staff_headers,
        json={"merchant_name": "Sneaky"},
    )

    assert response.status_code == 403


def test_upload_qris_image_empty_file(client, staff_headers):
    response = client.post(
        "/settings/qris/image",
        headers=staff_headers,
        files={"file": ("empty.png", b"", "image/png")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Empty file"


def test_get_qris_includes_merchant_name_after_update(client, admin_headers):
    client.put(
        "/settings/merchant-name",
        headers=admin_headers,
        json={"merchant_name": "Named Shop"},
    )

    response = client.get("/settings/qris")

    assert response.status_code == 200
    assert response.json()["merchant_name"] == "Named Shop"


def test_upload_qris_image_too_large(client, staff_headers):
    """Line 85: file > 5 MB is rejected."""
    large_data = b"x" * (5 * 1024 * 1024 + 1)

    response = client.post(
        "/settings/qris/image",
        headers=staff_headers,
        files={"file": ("big.png", large_data, "image/png")},
    )

    assert response.status_code == 400
    assert "too large" in response.json()["detail"].lower()


def test_upload_qris_image_updates_existing_setting(
    client, staff_headers, mock_supabase_storage
):
    """Line 106: second upload overwrites the stored qris_image_url setting."""
    first = client.post(
        "/settings/qris/image",
        headers=staff_headers,
        files={"file": ("first.png", make_png_bytes(), "image/png")},
    )
    assert first.status_code == 200
    first_url = first.json()["qris_image_url"]
    assert first_url is not None

    second = client.post(
        "/settings/qris/image",
        headers=staff_headers,
        files={"file": ("second.png", make_png_bytes(), "image/png")},
    )

    assert second.status_code == 200
    second_url = second.json()["qris_image_url"]
    # Both are valid URLs but may differ (different generated path)
    assert second_url is not None

    # GET should now return the updated URL
    get_res = client.get("/settings/qris")
    assert get_res.json()["qris_image_url"] == second_url


def test_upload_qris_image_local_write_oserror(
    client, staff_headers, mock_supabase_storage, monkeypatch
):
    """Lines 118-119: OSError when writing local fallback is caught and logged."""
    from pathlib import Path

    monkeypatch.setattr(Path, "write_bytes", lambda self, data: (_ for _ in ()).throw(OSError("disk full")))

    # Even with the write error the endpoint should still succeed
    response = client.post(
        "/settings/qris/image",
        headers=staff_headers,
        files={"file": ("qris.png", make_png_bytes(), "image/png")},
    )

    assert response.status_code == 200
