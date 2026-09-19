from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.config import settings
from src.models.erp import User
from src.schemas.auth import UserRegisterRequest, UserLoginRequest, UserResponse, Token
from src.utils.security import verify_password, get_password_hash, create_access_token
from src.api.deps import require_auth

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )
    
    new_user = User(
        email=req.email,
        phone=req.phone,
        password_hash=get_password_hash(req.password),
        name=req.name,
        role=req.role,
        branch_id=req.branch_id,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.id, "email": new_user.email, "role": new_user.role})
    expires_in = (settings.ACCESS_TOKEN_EXPIRE_MINUTES or 1440) * 60
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": expires_in,
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "branch_id": new_user.branch_id
        }
    }

@router.post("/login", response_model=Token)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is currently disabled. Please contact salon administrator."
        )

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    expires_in = (settings.ACCESS_TOKEN_EXPIRE_MINUTES or 1440) * 60
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": expires_in,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "branch_id": user.branch_id
        }
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(require_auth)):
    return current_user
