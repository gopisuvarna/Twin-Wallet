import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "TwinWallet API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    JWT_SECRET_KEY: str = "super-secret-key-change-in-production-twinwallet-2026"
    JWT_REFRESH_SECRET_KEY: str = "super-refresh-secret-key-change-in-production-twinwallet-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Maximum allowed users (Strict twin requirement)
    MAX_USERS: int = 2

    # Database (Defaults to SQLite for instant local dev; set env DATABASE_URL for Postgres/Neon)
    DATABASE_URL: str = "sqlite+aiosqlite:///./twinwallet.db"
    SYNC_DATABASE_URL: str = "sqlite:///./twinwallet.db"
    
    # Environment
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
