import os
import urllib.parse
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Configuration (Dynamically loaded from .env)
    APP_NAME: Optional[str] = None
    APP_ENV: Optional[str] = None
    PORT: Optional[int] = None
    HOST: Optional[str] = None
    DEBUG: Optional[bool] = None
    
    # Database Connection Variables (Dynamically loaded from .env)
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_HOST: Optional[str] = None
    DB_PORT: Optional[int] = None
    DB_NAME: Optional[str] = None
    DATABASE_URL: Optional[str] = None

    @property
    def effective_database_url(self) -> str:
        # Prioritize explicit PostgreSQL connection URL from .env
        if self.DATABASE_URL and not self.DATABASE_URL.startswith("sqlite"):
            url = self.DATABASE_URL
            if url.startswith("postgresql://") and not url.startswith("postgresql+"):
                url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return url
        
        # Build dynamically from discrete .env variables
        if self.DB_USER and self.DB_HOST and self.DB_NAME:
            user = self.DB_USER
            pwd = self.DB_PASSWORD or ""
            pwd_raw = urllib.parse.unquote(pwd)
            pwd_encoded = urllib.parse.quote_plus(pwd_raw)
            host = self.DB_HOST
            port = self.DB_PORT or 5432
            db = self.DB_NAME
            return f"postgresql+psycopg2://{user}:{pwd_encoded}@{host}:{port}/{db}"
        
        if self.DATABASE_URL:
            return self.DATABASE_URL
            
        return "sqlite:///./saloon.db"
    
    # Auth & JWT Configuration (Dynamically loaded from .env)
    SECRET_KEY: Optional[str] = None
    ALGORITHM: Optional[str] = None
    ACCESS_TOKEN_EXPIRE_MINUTES: Optional[int] = None
    
    # CORS (Dynamically loaded from .env)
    CORS_ORIGINS: Optional[str] = None
    
    # Redis (Dynamically loaded from .env)
    REDIS_URL: Optional[str] = None
    
    # External Integrations (Dynamically loaded from .env)
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None
    PINELABS_MERCHANT_ID: Optional[str] = None
    PINELABS_API_KEY: Optional[str] = None
    WHATSAPP_PHONE_NUMBER_ID: Optional[str] = None
    WHATSAPP_ACCESS_TOKEN: Optional[str] = None
    
    # AI Keys (Dynamically loaded from .env)
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    @property
    def cors_origin_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
