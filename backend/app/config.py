from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "AFFO POS API"
    APP_VERSION: str = "1.0.0"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE: int = 720

    DATABASE_URL: str
    CUSTOMER_WEB_URL: str = "http://localhost:5173"

    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str

    QR_DIR: Path = BASE_DIR / "static" / "qr_codes"

    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_MENU_BUCKET: str
    SUPABASE_QR_BUCKET: str
    SUPABASE_QRIS_BUCKET: str = "qris"
    SUPABASE_QRIS: str = "qris"


settings = Settings()

settings.QR_DIR.mkdir(parents=True, exist_ok=True)
(BASE_DIR / "data").mkdir(exist_ok=True)
