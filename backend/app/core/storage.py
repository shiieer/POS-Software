from pathlib import Path
from uuid import uuid4

from supabase import Client, create_client

from app.config import settings

_client: Client | None = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _client


def build_public_url(bucket: str, path: str) -> str:
    base = settings.SUPABASE_URL.rstrip("/")
    if base.endswith("/rest/v1"):
        base = base.removesuffix("/rest/v1")
    clean_path = path.lstrip("/")
    return f"{base}/storage/v1/object/public/{bucket}/{clean_path}"


def upload_bytes(
    *, bucket: str, path: str, data: bytes, content_type: str, upsert: bool = True
) -> str:
    client = get_supabase()
    client.storage.from_(bucket).upload(
        path=path,
        file=data,
        file_options={"content-type": content_type, "upsert": str(upsert).lower()},
    )
    return build_public_url(bucket, path)


def upload_file(
    *, bucket: str, path: str, file_path: Path, content_type: str, upsert: bool = True
) -> str:
    data = file_path.read_bytes()
    return upload_bytes(
        bucket=bucket, path=path, data=data, content_type=content_type, upsert=upsert
    )


def delete_file(*, bucket: str, path: str) -> None:
    client = get_supabase()
    client.storage.from_(bucket).remove([path])


def generate_menu_image_path(filename: str) -> str:
    ext = Path(filename).suffix.lower() or ".jpg"
    return f"menu/{uuid4().hex}{ext}"


def generate_qris_image_path(filename: str) -> str:
    ext = Path(filename).suffix.lower() or ".jpg"
    return f"qris/{uuid4().hex}{ext}"


def generate_payment_proof_path(order_id: int, filename: str) -> str:
    ext = Path(filename).suffix.lower() or ".jpg"
    return f"proofs/{order_id}/{uuid4().hex}{ext}"


def generate_avatar_image_path(user_id: int, filename: str) -> str:
    ext = Path(filename).suffix.lower() or ".jpg"
    return f"avatars/{user_id}/{uuid4().hex}{ext}"
