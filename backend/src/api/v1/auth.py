from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from src.core.database import get_db
from src.core.config import settings
from src.models.erp import User
from src.models.organization import Organization
from src.models.salon import Branch
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
    
    # Associate or create organization if needed
    org_id = req.organization_id
    if not org_id:
        first_org = db.query(Organization).first()
        org_id = first_org.id if first_org else None

    new_user = User(
        email=req.email,
        phone=req.phone,
        password_hash=get_password_hash(req.password),
        name=req.name,
        role=req.role,
        organization_id=org_id,
        branch_id=req.branch_id,
        department=req.department,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    org = db.query(Organization).filter(Organization.id == new_user.organization_id).first() if new_user.organization_id else None

    token = create_access_token({
        "sub": new_user.id,
        "email": new_user.email,
        "role": new_user.role,
        "organization_id": new_user.organization_id
    })
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
            "organization_id": new_user.organization_id,
            "organization_name": org.name if org else None,
            "business_type": org.business_type if org else "general",
            "policy_config": org.policy_config if org else {},
            "branch_id": new_user.branch_id,
            "department": new_user.department
        }
    }

@router.post("/login", response_model=Token)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        # Also check if password was provided in plain text during initial test setup or matches standard hash
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is currently disabled. Please contact administrator."
        )

    # If organization_id is provided in login request and user has access, link/switch it
    if req.organization_id and req.organization_id != user.organization_id:
        user.organization_id = req.organization_id
        db.commit()
        db.refresh(user)

    org = db.query(Organization).filter(Organization.id == user.organization_id).first() if user.organization_id else None
    if not org:
        # Fallback to first available organization if any
        org = db.query(Organization).first()

    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "organization_id": org.id if org else None
    })
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
            "organization_id": org.id if org else None,
            "organization_name": org.name if org else None,
            "business_type": org.business_type if org else "general",
            "policy_config": org.policy_config if org else {},
            "branch_id": user.branch_id,
            "department": user.department
        }
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(require_auth)):
    return current_user
