import os

# Set env
os.environ.setdefault("SECRET_KEY", "test-secret-key-change-me")
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("ADMIN_USERNAME", "admin")
os.environ.setdefault("ADMIN_PASSWORD", "admin123")
os.environ.setdefault("SUPABASE_URL", "https://fake.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "fake-service-key")
os.environ.setdefault("SUPABASE_MENU_BUCKET", "menu_images")
os.environ.setdefault("SUPABASE_QR_BUCKET", "qr_codes")
os.environ.setdefault("SUPABASE_QRIS_BUCKET", "qris")
os.environ.setdefault("SUPABASE_QRIS", "qris")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Shared in-memory DB for all connections
test_engine = create_engine(
    "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

import app.database as database_module

database_module.engine = test_engine
database_module.SessionLocal = TestSessionLocal

import app.models
import pytest
from app.core.security import hash_password
from app.database import Base, get_db
from app.main import app, seed_admin
from app.models.user import User, UserRole
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

engine = test_engine
SessionLocal = TestSessionLocal


@pytest.fixture()
def db_session() -> Session:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_admin()
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db_session: Session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def admin_credentials() -> dict:
    return {
        "username": os.environ["ADMIN_USERNAME"],
        "password": os.environ["ADMIN_PASSWORD"],
    }


@pytest.fixture()
def admin_token(client, admin_credentials) -> str:
    from tests.helpers.auth import login

    return login(client, **admin_credentials)


@pytest.fixture()
def admin_headers(admin_token) -> dict:
    from tests.helpers.auth import auth_headers

    return auth_headers(admin_token)


@pytest.fixture()
def staff_user(db_session: Session) -> User:
    user = User(
        username="staff1",
        hashed_password=hash_password("staff123"),
        role=UserRole.STAFF,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def staff_headers(client, staff_user) -> dict:
    from tests.helpers.auth import auth_headers, login

    token = login(client, staff_user.username, "staff123")
    return auth_headers(token)


@pytest.fixture(autouse=True)
def mock_supabase_storage(monkeypatch):
    uploaded: dict[str, dict] = {}
    deleted: list[tuple[str, str]] = []

    def fake_upload_bytes(
        *, bucket: str, path: str, data: bytes, content_type: str, upsert: bool = True
    ) -> str:
        uploaded[f"{bucket}/{path}"] = {
            "bucket": bucket,
            "path": path,
            "data": data,
            "content_type": content_type,
            "upsert": upsert,
        }
        base = "https://fake.supabase.co"
        return f"{base}/storage/v1/object/public/{bucket}/{path}"

    def fake_delete_file(*, bucket: str, path: str) -> None:
        deleted.append((bucket, path))
        uploaded.pop(f"{bucket}/{path}", None)

    monkeypatch.setattr("app.core.storage.upload_bytes", fake_upload_bytes)
    monkeypatch.setattr("app.core.storage.delete_file", fake_delete_file)
    monkeypatch.setattr("app.core.qr.upload_bytes", fake_upload_bytes)
    monkeypatch.setattr("app.routers.menu.upload_bytes", fake_upload_bytes)
    monkeypatch.setattr("app.routers.menu.delete_file", fake_delete_file)
    monkeypatch.setattr("app.routers.settings.upload_bytes", fake_upload_bytes)
    monkeypatch.setattr("app.routers.tables.delete_file", fake_delete_file)

    return {"uploaded": uploaded, "deleted": deleted}
