from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.config import settings
from app.core.security import create_access_token, verify_password
from app.core.storage import generate_avatar_image_path, upload_bytes
from app.dependencies import CurrentUser, DbSession
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserOut

router = APIRouter(prefix="/auth", tags=["Auth"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: DbSession):
    user = (
        db.query(User)
        .filter(
            (User.username == data.username)
            | (User.account_code == data.username.upper())
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive",
        )

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    token = create_access_token(subject=user.username, role=user.role.value)
    return TokenResponse(
        access_token=token,
        role=user.role,
        username=user.username,
        account_code=user.account_code,
    )


@router.get("/me", response_model=UserOut)
def me(current_user: CurrentUser):
    return current_user


@router.get("/staff", response_model=list[UserOut])
def get_active_staff(db: DbSession):
    return db.query(User).filter(User.is_active == True).all()


@router.post("/me/avatar", response_model=UserOut)
async def upload_my_avatar(
    current_user: CurrentUser,
    db: DbSession,
    file: Annotated[UploadFile, File()],
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WEBP are allowed")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5 MB)")

    path = generate_avatar_image_path(current_user.id, file.filename or "avatar.jpg")
    public_url = upload_bytes(
        bucket=settings.SUPABASE_AVATARS_BUCKET,
        path=path,
        data=data,
        content_type=file.content_type,
        upsert=True,
    )

    user = db.query(User).filter(User.id == current_user.id).first()
    user.avatar_url = public_url
    db.commit()
    db.refresh(user)
    return user
