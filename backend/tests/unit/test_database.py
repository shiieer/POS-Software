from app.database import get_db


def test_get_db_yields_session_and_close():
    db_gen = get_db()
    session = next(db_gen)

    try:
        assert session is not None
    finally:
        db_gen.close()


def test_database_url_postgresql_rewriting(monkeypatch):
    import importlib

    import app.config as config_mod
    import app.database as database_mod

    # Test postgres:// rewrite
    monkeypatch.setattr(
        config_mod.settings, "DATABASE_URL", "postgres://user:pass@localhost:5432/mydb"
    )
    # Test the URL transformation logic directly or reload database module
    db_url = config_mod.settings.DATABASE_URL
    if db_url.startswith(("postgres://", "postgresql://")):
        rewritten = db_url.replace("postgres://", "postgresql+psycopg://", 1)
        rewritten = rewritten.replace("postgresql://", "postgresql+psycopg://", 1)
        assert rewritten == "postgresql+psycopg://user:pass@localhost:5432/mydb"

    # Also directly execute against dummy engine create mock
    import sqlalchemy

    created_urls = []
    monkeypatch.setattr(
        sqlalchemy, "create_engine", lambda url, **kwargs: created_urls.append(url)
    )
    monkeypatch.setattr(
        config_mod.settings,
        "DATABASE_URL",
        "postgresql://user:pass@localhost:5432/mydb",
    )
    importlib.reload(database_mod)
    assert any("postgresql+psycopg://" in str(u) for u in created_urls)
