from app.config import settings
from app.core.security import hash_password
from app.database import SessionLocal
from app.main import seed_admin
from app.models.user import User, UserRole


def test_seed_admin_when_admin_not_exists_with_collision(db_session, monkeypatch):
    # Ensure no admin user exists
    db = SessionLocal()
    try:
        db.query(User).filter(User.username == settings.ADMIN_USERNAME).delete()
        # Create another user that holds code "ADM-COLLIDE"
        existing = db.query(User).filter(User.account_code == "ADM-COLLIDE").first()
        if not existing:
            db.add(
                User(
                    account_code="ADM-COLLIDE",
                    username="other_admin",
                    hashed_password=hash_password("pass123"),
                    role=UserRole.ADMIN,
                )
            )
        db.commit()
    finally:
        db.close()

    codes = iter(["ADM-COLLIDE", "ADM-UNIQUE-1"])
    monkeypatch.setattr("app.main.generate_account_code", lambda role: next(codes))

    seed_admin()

    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
        assert admin is not None
        assert admin.account_code == "ADM-UNIQUE-1"
    finally:
        db.close()


def test_seed_admin_when_admin_exists_without_code_with_collision(db_session, monkeypatch):
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
        if not admin:
            admin = User(
                username=settings.ADMIN_USERNAME,
                hashed_password=hash_password(settings.ADMIN_PASSWORD),
                role=UserRole.ADMIN,
            )
            db.add(admin)
        admin.account_code = None

        existing = db.query(User).filter(User.account_code == "ADM-EXISTING").first()
        if not existing:
            db.add(
                User(
                    account_code="ADM-EXISTING",
                    username="existing_holder",
                    hashed_password=hash_password("pass123"),
                    role=UserRole.ADMIN,
                )
            )
        db.commit()
    finally:
        db.close()

    codes = iter(["ADM-EXISTING", "ADM-NEW-1"])
    monkeypatch.setattr("app.main.generate_account_code", lambda role: next(codes))

    seed_admin()

    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
        assert admin.account_code == "ADM-NEW-1"
    finally:
        db.close()


def test_seed_admin_migrates_users_without_code_with_collision(db_session, monkeypatch):
    db = SessionLocal()
    try:
        # Create a user without code
        user_no_code = db.query(User).filter(User.username == "staff_no_code").first()
        if not user_no_code:
            user_no_code = User(
                username="staff_no_code",
                hashed_password=hash_password("pass123"),
                role=UserRole.STAFF,
            )
            db.add(user_no_code)
        user_no_code.account_code = None

        # Existing code to trigger while collision
        existing = db.query(User).filter(User.account_code == "STF-COLLIDE").first()
        if not existing:
            db.add(
                User(
                    account_code="STF-COLLIDE",
                    username="collide_holder",
                    hashed_password=hash_password("pass123"),
                    role=UserRole.STAFF,
                )
            )
        db.commit()
    finally:
        db.close()

    codes = iter(["STF-COLLIDE", "STF-MIGRATED-1"])
    monkeypatch.setattr("app.main.generate_account_code", lambda role: next(codes))

    seed_admin()

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "staff_no_code").first()
        assert user.account_code == "STF-MIGRATED-1"
    finally:
        db.close()
