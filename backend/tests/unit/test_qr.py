import re

from app.config import settings
from app.core.qr import (
    build_menu_url,
    generator_qr_token,
    get_qr_public_url,
    save_qr_image,
)


def test_generator_qr_token_is_url_safe_string():
    token = generator_qr_token()

    assert isinstance(token, str)
    assert len(token) >= 16
    assert re.fullmatch(r"[-A-Za-z0-9_]+", token)


def test_generator_qr_token_is_unique():
    tokens = {generator_qr_token() for _ in range(20)}

    assert len(tokens) == 20


def test_build_menu_url_format():
    url = build_menu_url(table_id=7, qr_token="abc123")

    assert url.endswith("/?table=7&token=abc123")
    assert "table=7" in url
    assert "token=abc123" in url


def test_get_qr_public_url():
    url = get_qr_public_url(table_id=5)

    assert url.endswith(f"/{settings.SUPABASE_QR_BUCKET}/table_5.png")
    assert "storage/v1/object/public" in url


def test_save_qr_image_uploads_png(mock_supabase_storage):
    url = save_qr_image(
        "http://localhost:3000/?table=1&token=abc",
        "table_1.png",
    )

    assert url.endswith("/qr_codes/table_1.png")
    stored = mock_supabase_storage["uploaded"]["qr_codes/table_1.png"]
    assert stored["content_type"] == "image/png"
    assert stored["data"].startswith(b"\x89PNG")


def test_is_local_host_returns_false_for_none():
    from app.core.qr import _is_local_host

    assert _is_local_host(None) is False
    assert _is_local_host("") is False


def test_is_local_host_returns_true_for_known_locals():
    from app.core.qr import _is_local_host

    assert _is_local_host("localhost") is True
    assert _is_local_host("127.0.0.1") is True
    assert _is_local_host("::1") is True
    assert _is_local_host("192.168.1.5") is True
    assert _is_local_host("10.0.0.1") is True
    assert _is_local_host("172.20.0.1") is True


def test_is_local_host_returns_false_for_public():
    from app.core.qr import _is_local_host

    assert _is_local_host("8.8.8.8") is False
    assert _is_local_host("example.com") is False
    assert _is_local_host("not.an.ip") is False


def test_build_menu_url_with_local_configured_host(monkeypatch):
    """When CUSTOMER_WEB_URL is a LAN address, build_menu_url should swap in
    the network host so that phones on the same LAN can reach it."""
    import app.config as cfg
    from app.core.qr import build_menu_url

    monkeypatch.setattr(cfg.settings, "CUSTOMER_WEB_URL", "http://192.168.1.5:5173")

    url = build_menu_url(table_id=3, qr_token="tok", request_origin=None)

    assert "table=3" in url
    assert "token=tok" in url


def test_generate_qr_data_uri_format():
    from app.core.qr import generate_qr_data_uri

    uri = generate_qr_data_uri("http://example.com/?table=1&token=abc")

    assert uri.startswith("data:image/png;base64,")
    # Ensure it decodes to a real PNG
    import base64

    raw = base64.b64decode(uri.split(",", 1)[1])
    assert raw[:4] == b"\x89PNG"


def test_get_local_network_host_connect_oserror(monkeypatch):

    from app.core import qr

    class RaisingSocket:
        def connect(self, addr):
            raise OSError("network unreachable")

        def close(self):
            pass

    monkeypatch.setattr(qr.socket, "socket", lambda *a, **kw: RaisingSocket())
    monkeypatch.setattr(qr.socket, "getaddrinfo", lambda *a, **kw: [])

    result = qr._get_local_network_host()

    assert result is None


def test_get_local_network_host_both_oserror(monkeypatch):

    from app.core import qr

    class RaisingSocket:
        def connect(self, addr):
            raise OSError("network unreachable")

        def close(self):
            pass

    def raise_oserror(*a, **kw):
        raise OSError("getaddrinfo failed")

    monkeypatch.setattr(qr.socket, "socket", lambda *a, **kw: RaisingSocket())
    monkeypatch.setattr(qr.socket, "getaddrinfo", raise_oserror)

    result = qr._get_local_network_host()

    assert result is None


def test_get_local_network_host_returns_lan_from_getaddrinfo(monkeypatch):

    from app.core import qr

    class RaisingSocket:
        def connect(self, addr):
            raise OSError

        def close(self):
            pass

    monkeypatch.setattr(qr.socket, "socket", lambda *a, **kw: RaisingSocket())
    monkeypatch.setattr(
        qr.socket,
        "getaddrinfo",
        lambda *a, **kw: [(None, None, None, None, ("192.168.1.99", 0))],
    )
    monkeypatch.setattr(qr.socket, "gethostname", lambda: "testhost")

    result = qr._get_local_network_host()

    assert result == "192.168.1.99"


def test_build_menu_url_wraps_ipv6_host(monkeypatch):

    import app.config as cfg
    from app.core import qr

    monkeypatch.setattr(cfg.settings, "CUSTOMER_WEB_URL", "http://192.168.1.5:5173")
    monkeypatch.setattr(qr, "_get_local_network_host", lambda: "fe80::1")

    url = qr.build_menu_url(table_id=2, qr_token="tok99", request_origin=None)

    assert "[fe80::1]" in url
    assert "table=2" in url
    assert "token=tok99" in url
