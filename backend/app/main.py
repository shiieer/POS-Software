from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import BASE_DIR, settings
from app.core.security import generate_account_code, hash_password
from app.database import Base, SessionLocal, engine
from app.models import User
from app.models.user import UserRole
from app.routers import api_router


def seed_admin():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
        if not admin:
            admin_code = generate_account_code(UserRole.ADMIN)
            while db.query(User).filter(User.account_code == admin_code).first():
                admin_code = generate_account_code(UserRole.ADMIN)
            db.add(
                User(
                    account_code=admin_code,
                    username=settings.ADMIN_USERNAME,
                    hashed_password=hash_password(settings.ADMIN_PASSWORD),
                    role=UserRole.ADMIN,
                )
            )
            db.commit()
        elif not admin.account_code:
            admin_code = generate_account_code(UserRole.ADMIN)
            while db.query(User).filter(User.account_code == admin_code).first():
                admin_code = generate_account_code(UserRole.ADMIN)
            admin.account_code = admin_code
            db.commit()

        users_without_code = db.query(User).filter(User.account_code.is_(None)).all()
        for u in users_without_code:
            code = generate_account_code(u.role)
            while db.query(User).filter(User.account_code == code).first():
                code = generate_account_code(u.role)
            u.account_code = code
        if users_without_code:
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_admin()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
app.include_router(api_router)


@app.get("/")
def root():
    return {"message": settings.APP_NAME, "docs": "/docs"}
