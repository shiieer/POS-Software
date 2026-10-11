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
