import base64
import io
import secrets
import socket
from urllib.parse import urlsplit, urlunsplit

import qrcode

from app.config import settings
from app.core.storage import build_public_url, upload_bytes


def generator_qr_token() -> str:
    return secrets.token_urlsafe(16)


def _is_local_host(host: str | None) -> bool:
    if not host:
        return False
    normalized = host.lower().strip("[]")
    if normalized in {"localhost", "127.0.0.1", "::1"}:
        return True
    octets = normalized.split(".")
    if len(octets) != 4 or not all(part.isdigit() for part in octets):
        return False
    first, second = map(int, octets[:2])
    return first == 10 or (first == 192 and second == 168) or (first == 172 and 16 <= second <= 31)


def _get_local_network_host() -> str | None:
    """Return the IPv4 address other devices on this network can reach."""
    probe = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # UDP connect selects the outbound interface without sending a packet.
        probe.connect(("8.8.8.8", 80))
        host = probe.getsockname()[0]
        if host and not host.startswith("127."):
            return host
    except OSError:
        pass
    finally:
        probe.close()

    try:
        for result in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            host = result[4][0]
            if host and not host.startswith("127.") and _is_local_host(host):
                return host
    except OSError:
        pass
    return None


def build_menu_url(
    table_id: int, qr_token: str, request_origin: str | None = None
) -> str:
    configured = urlsplit(settings.CUSTOMER_WEB_URL.rstrip("/"))
    origin = urlsplit(request_origin or "")
    if configured.hostname and _is_local_host(configured.hostname):
        # Use the browser's LAN host when available. If the POS was opened via
        # localhost, use this server's network interface so a phone can reach it.
        host = origin.hostname if origin.hostname and not _is_local_host(origin.hostname) else None
        host = host or _get_local_network_host() or origin.hostname or configured.hostname
        if ":" in host:
            host = f"[{host}]"
        netloc = f"{host}:{configured.port}" if configured.port else host
        scheme = origin.scheme or configured.scheme
        configured = configured._replace(scheme=scheme, netloc=netloc)

    base = urlunsplit(configured).rstrip("/")
    return f"{base}/?table={table_id}&token={qr_token}"


def generate_qr_png(url: str) -> bytes:
    buffer = io.BytesIO()
    qrcode.make(url).save(buffer, format="PNG")
    return buffer.getvalue()


def generate_qr_data_uri(url: str) -> str:
    encoded = base64.b64encode(generate_qr_png(url)).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def save_qr_image(url: str, filename: str) -> str:
    return upload_bytes(
        bucket=settings.SUPABASE_QR_BUCKET,
        path=filename,
        data=generate_qr_png(url),
        content_type="image/png",
        upsert=True,
    )


def get_qr_public_url(table_id: int) -> str:
    return build_public_url(settings.SUPABASE_QR_BUCKET, f"table_{table_id}.png")
