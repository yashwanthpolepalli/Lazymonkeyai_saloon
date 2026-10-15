from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Union
from jose import jwt, JWTError
import bcrypt
from src.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain-text password against a bcrypt hash safely."""
    if not hashed_password or not plain_password:
        return False
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.strip().encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception as e:
        print(f"[Security] verify_password error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Generates a secure bcrypt hash for a password (truncated to 72 bytes as per bcrypt specification)."""
    pwd_bytes = (password or "").encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed JWT access token with an expiration timestamp."""
    to_encode = data.copy()
    expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES or 1440
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    
    secret_key = settings.SECRET_KEY or "saloon_jwt_secret_key"
    algorithm = settings.ALGORITHM or "HS256"

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt

def decode_token(token: str) -> Optional[dict]:
    """Decodes and validates a JWT token, returning payload if valid."""
    try:
        secret_key = settings.SECRET_KEY or "saloon_jwt_secret_key"
        algorithm = settings.ALGORITHM or "HS256"
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        return payload
    except JWTError:
        return None

