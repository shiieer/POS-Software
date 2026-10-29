import importlib
from pathlib import Path

from app.core import storage


def test_build_public_url():
    url = storage.build_public_url("menu_images", "menu/abc.png")

    assert (
        url
        == "https://fake.supabase.co/storage/v1/object/public/menu_images/menu/abc.png"
    )


def test_build_public_url_strips_rest_v1(monkeypatch):
    monkeypatch.setattr(
        storage.settings,
        "SUPABASE_URL",
        "https://fake.supabase.co/rest/v1/",
    )

    url = storage.build_public_url("menu_images", "menu/abc.png")

    assert url == (
        "https://fake.supabase.co/storage/v1/object/public/menu_images/menu/abc.png"
    )
    assert "/rest/v1/" not in url


def test_build_public_url_strips_leading_slash_from_path(monkeypatch):
    url = storage.build_public_url("menu_images", "/menu/abc.png")

    assert url.endswith("/menu_images/menu/abc.png")
    assert "/menu_images//menu/" not in url


def test_generate_menu_image_path_uses_menu_folder_and_extension():
    path = storage.generate_menu_image_path("latte.JPG")

    assert path.startswith("menu/")
    assert path.endswith(".jpg")


def test_generate_menu_image_path_defaults_to_jpg():
    path = storage.generate_menu_image_path("no-extension")

    assert path.startswith("menu/")
    assert path.endswith(".jpg")


def test_generate_menu_image_path_supports_webp():
    path = storage.generate_menu_image_path("item.WEBP")

    assert path.endswith(".webp")


def test_upload_bytes_returns_public_url(mock_supabase_storage):
    url = storage.upload_bytes(
        bucket="menu_images",
        path="menu/test.png",
        data=b"fake-image",
        content_type="image/png",
    )

    assert url.endswith("/menu_images/menu/test.png")
    stored = mock_supabase_storage["uploaded"]["menu_images/menu/test.png"]
    assert stored["content_type"] == "image/png"
    assert stored["data"] == b"fake-image"
    assert stored["upsert"] is True


def test_delete_file_removes_uploaded_file(mock_supabase_storage):
    storage.upload_bytes(
        bucket="menu_images",
        path="menu/delete-me.png",
        data=b"x",
        content_type="image/png",
    )

    storage.delete_file(bucket="menu_images", path="menu/delete-me.png")

    assert ("menu_images", "menu/delete-me.png") in mock_supabase_storage["deleted"]
    assert "menu_images/menu/delete-me.png" not in mock_supabase_storage["uploaded"]


def test_upload_file_reads_from_disk(tmp_path, mock_supabase_storage):
    file_path = tmp_path / "photo.png"
    file_path.write_bytes(b"from-disk")

    url = storage.upload_file(
        bucket="menu_images",
        path="menu/from-disk.png",
        file_path=Path(file_path),
        content_type="image/png",
    )

    assert url.endswith("/menu_images/menu/from-disk.png")
    stored = mock_supabase_storage["uploaded"]["menu_images/menu/from-disk.png"]
    assert stored["data"] == b"from-disk"


def _reload_storage_module():
    import app.core.storage as storage_module

    importlib.reload(storage_module)
    storage_module._client = None
    return storage_module


def test_get_supabase_creates_client_once(monkeypatch):
    sm = _reload_storage_module()
    calls = {"count": 0}

    class FakeClient:
        pass

    def fake_create_client(url, key):
        calls["count"] += 1
        assert url == sm.settings.SUPABASE_URL
        assert key == sm.settings.SUPABASE_SERVICE_KEY
        return FakeClient()

    monkeypatch.setattr(sm, "create_client", fake_create_client)

    first = sm.get_supabase()
    second = sm.get_supabase()

    assert first is second
    assert calls["count"] == 1

    sm._client = None


def test_upload_bytes_calls_supabase_client(monkeypatch):
    sm = _reload_storage_module()
    captured = {}

    class FakeBucket:
        def upload(self, path, file, file_options):
            captured["path"] = path
            captured["file"] = file
            captured["file_options"] = file_options

    class FakeStorage:
        def from_(self, bucket):
            captured["bucket"] = bucket
            return FakeBucket()

    class FakeClient:
        storage = FakeStorage()

    monkeypatch.setattr(sm, "get_supabase", lambda: FakeClient())

    url = sm.upload_bytes(
        bucket="menu_images",
        path="menu/real.png",
        data=b"real-data",
        content_type="image/png",
        upsert=True,
    )

    assert captured["bucket"] == "menu_images"
    assert captured["path"] == "menu/real.png"
    assert captured["file"] == b"real-data"
    assert captured["file_options"]["content-type"] == "image/png"
    assert captured["file_options"]["upsert"] == "true"
    assert "menu_images/menu/real.png" in url

    sm._client = None


def test_upload_bytes_upsert_false(monkeypatch):
    sm = _reload_storage_module()
    captured = {}

    class FakeBucket:
        def upload(self, path, file, file_options):
            captured["file_options"] = file_options

    class FakeStorage:
        def from_(self, bucket):
            return FakeBucket()

    class FakeClient:
        storage = FakeStorage()

    monkeypatch.setattr(sm, "get_supabase", lambda: FakeClient())

    sm.upload_bytes(
        bucket="menu_images",
        path="menu/no-upsert.png",
        data=b"x",
        content_type="image/png",
        upsert=False,
    )

    assert captured["file_options"]["upsert"] == "false"

    sm._client = None


def test_delete_file_calls_supabase_client(monkeypatch):
    sm = _reload_storage_module()
    captured = {}

    class FakeBucket:
        def remove(self, paths):
            captured["paths"] = paths

    class FakeStorage:
        def from_(self, bucket):
            captured["bucket"] = bucket
            return FakeBucket()

    class FakeClient:
        storage = FakeStorage()

    monkeypatch.setattr(sm, "get_supabase", lambda: FakeClient())

    sm.delete_file(bucket="menu_images", path="menu/old.png")

    assert captured["bucket"] == "menu_images"
    assert captured["paths"] == ["menu/old.png"]

    sm._client = None


def test_generate_avatar_image_path():
    from app.core.storage import generate_avatar_image_path

    p1 = generate_avatar_image_path(42, "avatar.png")
    assert p1.startswith("avatars/42/")
    assert p1.endswith(".png")

    p2 = generate_avatar_image_path(42, "no_ext")
    assert p2.startswith("avatars/42/")
    assert p2.endswith(".jpg")


def test_generate_qris_image_path():
    from app.core.storage import generate_qris_image_path

    p1 = generate_qris_image_path("qris.png")
    assert p1.startswith("qris/")
    assert p1.endswith(".png")

    p2 = generate_qris_image_path("qris_no_ext")
    assert p2.startswith("qris/")
    assert p2.endswith(".jpg")
