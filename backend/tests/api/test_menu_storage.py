from tests.helpers.factories import create_menu_item_api
from tests.helpers.storage_mocks import make_jpeg_bytes, make_png_bytes


def test_upload_menu_image_success(client, admin_headers, mock_supabase_storage):
    created = create_menu_item_api(client, admin_headers, name="Latte", price=25000)

    response = client.post(
        f"/menu/{created['id']}/image",
        headers=admin_headers,
        files={"file": ("latte.png", make_png_bytes(), "image/png")},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["image_url"] is not None
    assert "menu_images/menu/" in data["image_url"]
    assert len(mock_supabase_storage["uploaded"]) == 1


def test_upload_menu_image_jpeg(client, admin_headers):
    created = create_menu_item_api(client, admin_headers, name="Tea", price=12000)

    response = client.post(
        f"/menu/{created['id']}/image",
        headers=admin_headers,
        files={"file": ("tea.jpg", make_jpeg_bytes(), "image/jpeg")},
    )

    assert response.status_code == 200
    assert ".jpg" in response.json()["image_url"]


def test_upload_menu_image_not_found(client, admin_headers):
    response = client.post(
        "/menu/9999/image",
        headers=admin_headers,
        files={"file": ("x.png", make_png_bytes(), "image/png")},
    )

    assert response.status_code == 404


def test_upload_menu_image_requires_admin(client, staff_headers):
    response = client.post(
        "/menu/1/image",
        headers=staff_headers,
        files={"file": ("x.png", make_png_bytes(), "image/png")},
    )

    assert response.status_code == 403


def test_upload_menu_image_invalid_type(client, admin_headers):
    created = create_menu_item_api(client, admin_headers, name="Soup", price=15000)

    response = client.post(
        f"/menu/{created['id']}/image",
        headers=admin_headers,
        files={"file": ("bad.txt", b"hello", "text/plain")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Only JPG, PNG, and WEBP are allowed"


def test_upload_menu_image_empty_file(client, admin_headers):
    created = create_menu_item_api(client, admin_headers, name="Empty", price=10000)

    response = client.post(
        f"/menu/{created['id']}/image",
        headers=admin_headers,
        files={"file": ("empty.png", b"", "image/png")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Empty file"


def test_upload_menu_image_too_large(client, admin_headers):
    created = create_menu_item_api(client, admin_headers, name="Big", price=10000)
    huge_file = b"x" * (5 * 1024 * 1024 + 1)

    response = client.post(
        f"/menu/{created['id']}/image",
        headers=admin_headers,
        files={"file": ("big.png", huge_file, "image/png")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "File too large (max 5MB)"


def test_delete_menu_image_success(client, admin_headers, mock_supabase_storage):
    created = create_menu_item_api(client, admin_headers, name="Delete Me", price=10000)

    client.post(
        f"/menu/{created['id']}/image",
        headers=admin_headers,
        files={"file": ("item.png", make_png_bytes(), "image/png")},
    )

    response = client.delete(
        f"/menu/{created['id']}/image",
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Menu image deleted"
    assert len(mock_supabase_storage["deleted"]) == 1


def test_delete_menu_image_not_found(client, admin_headers):
    response = client.delete("/menu/9999/image", headers=admin_headers)

    assert response.status_code == 404


def test_delete_menu_image_without_image_url(
    client, admin_headers, mock_supabase_storage
):
    created = create_menu_item_api(client, admin_headers, name="No Image", price=10000)

    response = client.delete(
        f"/menu/{created['id']}/image",
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert len(mock_supabase_storage["deleted"]) == 0


def test_delete_menu_item_deletes_image_from_storage(
    client, admin_headers, mock_supabase_storage
):
    created = create_menu_item_api(
        client, admin_headers, name="Delete Item With Image", price=10000
    )

    client.post(
        f"/menu/{created['id']}/image",
        headers=admin_headers,
        files={"file": ("item.png", make_png_bytes(), "image/png")},
    )

    response = client.delete(
        f"/menu/{created['id']}",
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Menu item deleted"
    assert len(mock_supabase_storage["deleted"]) == 1


def test_delete_menu_item_handles_storage_delete_exception(
    client, admin_headers, monkeypatch
):
    created = create_menu_item_api(
        client, admin_headers, name="Item Image Delete Error", price=10000
    )

    client.post(
        f"/menu/{created['id']}/image",
        headers=admin_headers,
        files={"file": ("item.png", make_png_bytes(), "image/png")},
    )

    def failing_delete_file(*args, **kwargs):
        raise RuntimeError("Supabase deletion failed")

    monkeypatch.setattr("app.routers.menu.delete_file", failing_delete_file)

    response = client.delete(
        f"/menu/{created['id']}",
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Menu item deleted"
    # Verify it is deleted from DB
    get_res = client.get("/menu")
    assert not any(item["id"] == created["id"] for item in get_res.json())
