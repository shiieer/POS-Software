from fastapi import APIRouter, HTTPException, status

from app.core.security import generate_account_code, hash_password
from app.dependencies import AdminUser, DbSession
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=list[UserOut])
def get_users(_: AdminUser, db: DbSession):
    return db.query(User).all()


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, _: AdminUser, db: DbSession):
    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    while True:
        code = generate_account_code(payload.role)
        if not db.query(User).filter(User.account_code == code).first():
            break

    user = User(
        account_code=code,
        username=payload.username,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserOut)
@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int, payload: UserUpdate, _: AdminUser, db: DbSession
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    data = payload.model_dump(exclude_unset=True)
    if data.get("password"):
        user.hashed_password = hash_password(data.pop("password"))
    for key, value in data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user
