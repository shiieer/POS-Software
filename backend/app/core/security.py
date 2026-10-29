import secrets
from datetime import UTC, datetime, timedelta

from jose import jwt
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

UNAMBIGUOUS_CHARSET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"


def generate_account_code(role: str) -> str:
    role_str = getattr(role, "value", str(role)).lower()
    prefix = "ADM" if role_str == "admin" else "STF"
    chars = "".join(secrets.choice(UNAMBIGUOUS_CHARSET) for _ in range(6))
    return f"{prefix}-{chars}"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str, role: str) -> str:
    expire = datetime.now(UTC) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE
    )
    payload = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
