"""
Super Admin — Owner Onboarding Endpoint
POST /api/v1/onboard-owner

Creates:
  1. An Organization record
  2. An owner User with auto-generated credentials:
       username = registered name (lowercase, spaces → dots)
       password = first 4 chars of name + last 4 digits of phone
  3. Returns the plaintext credentials so super admin can share them.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
import re

from src.core.database import get_db
from src.models.erp import User
from src.models.organization import Organization, SubscriptionPlan
from src.utils.security import get_password_hash

router = APIRouter(tags=["Super Admin — Onboarding"])


class OwnerOnboardRequest(BaseModel):
    brand_name: str                     # Organization / salon brand name
    owner_name: str                     # Full name of the managing owner
    owner_email: Optional[str] = None   # Owner login email
    owner_phone: Optional[str] = None   # Owner phone (used for password generation)
    owner_password: Optional[str] = None # Super admin specified password (if provided)
    city: Optional[str] = None
    country: Optional[str] = "India"
    business_type: Optional[str] = "general"
    subscription_tier: Optional[str] = "Starter"
    currency: Optional[str] = "INR"


class OwnerOnboardResponse(BaseModel):
    success: bool
    message: str
    organization_id: str
    organization_name: str
    owner_id: str
    owner_name: str
    owner_email: str
    username: str           # Generated login username
    temp_password: str      # Plaintext temp password — share with owner
    phone: Optional[str]


def _generate_credentials(name: str, phone: Optional[str]) -> tuple[str, str]:
    """
    username = name lowercased, spaces replaced with dots, special chars stripped
    password = first 4 chars of name (alpha only) + last 4 digits of phone number
               fallback = first 8 chars of name if phone not provided
    """
    clean_name = re.sub(r"[^a-zA-Z0-9\s]", "", name).strip()
    username = re.sub(r"\s+", ".", clean_name).lower()

    name_prefix = re.sub(r"[^a-zA-Z]", "", clean_name)[:4].lower()
    if phone:
        digits_only = re.sub(r"\D", "", phone)
        phone_suffix = digits_only[-4:] if len(digits_only) >= 4 else digits_only.zfill(4)
    else:
        phone_suffix = re.sub(r"[^a-zA-Z]", "", clean_name)[4:8].lower()
        if len(phone_suffix) < 4:
            phone_suffix = (phone_suffix + "0000")[:4]

    password = f"{name_prefix}{phone_suffix}"
    return username, password


@router.post("/onboard-owner", response_model=OwnerOnboardResponse, status_code=status.HTTP_201_CREATED)
def onboard_new_owner(req: OwnerOnboardRequest, db: Session = Depends(get_db)):
    """
    Super Admin provisions a new salon owner:
    - Creates an Organization
    - Creates an owner User with auto-generated credentials
    - Returns credentials in plain text for the admin to forward
    """

    if not req.brand_name.strip() or not req.owner_name.strip():
        raise HTTPException(status_code=400, detail="brand_name and owner_name are required.")

    # Auto-generate org code from brand name
    org_code = re.sub(r"[^A-Z0-9]", "_", req.brand_name.upper().strip())[:12]
    # Deduplicate org code if it exists
    existing_org = db.query(Organization).filter(Organization.code == org_code).first()
    if existing_org:
        org_code = f"{org_code}_{existing_org.id[:4].upper()}"

    # Look up subscription plan from DB if configured
    plan = None
    if req.subscription_tier:
        plan = db.query(SubscriptionPlan).filter(
            (SubscriptionPlan.name.ilike(req.subscription_tier)) | 
            (SubscriptionPlan.code.ilike(req.subscription_tier))
        ).first()

    plan_name = plan.name if plan else (req.subscription_tier or "Starter")
    plan_mrr = plan.price_monthly if plan else 0.0
    plan_ai_limit = plan.ai_credits_limit if plan else 1000

    # 1. Create Organization
    org = Organization(
        name=req.brand_name.strip(),
        code=org_code,
        business_type=req.business_type or "general",
        currency=req.currency or (plan.currency if plan else "INR"),
        tax_rate=0.18,
        city=req.city,
        country=req.country or "India",
        is_active=True,
        subscription_tier=plan_name,
        mrr=plan_mrr,
        ai_credits_limit=plan_ai_limit,
        ai_credits_used=0,
        policy_config={
            "multi_branch_enabled": req.business_type in ("enterprise_chain", "franchise"),
            "approval_required": req.business_type in ("institution_public", "enterprise_chain"),
            "inventory_enabled": True,
            "payroll_enabled": True,
            "commission_enabled": req.business_type != "institution_public",
            "membership_enabled": req.business_type != "institution_public",
            "marketing_enabled": req.business_type != "institution_public",
            "audit_enabled": True,
            "subscription_tier": plan_name,
        }
    )
    db.add(org)
    db.flush()  # Get org.id without committing

    # 2. Generate/assign credentials
    auto_username, auto_password = _generate_credentials(req.owner_name, req.owner_phone)
    username = auto_username
    temp_password = req.owner_password.strip() if req.owner_password and req.owner_password.strip() else auto_password

    # Ensure username uniqueness
    base_username = username
    counter = 1
    while db.query(User).filter(User.email == username).first():
        username = f"{base_username}{counter}"
        counter += 1

    # Owner email: prefer provided, otherwise username@<orgcode>.salon
    owner_email = (req.owner_email or "").strip().lower() or f"{username}@{org_code.lower().replace('_', '')}.salon"

    # Check email uniqueness
    if db.query(User).filter(User.email == owner_email).first():
        raise HTTPException(
            status_code=409,
            detail=f"A user with email '{owner_email}' already exists. Use a different email."
        )

    # 3. Create Owner User
    owner = User(
        email=owner_email,
        phone=req.owner_phone.strip() if req.owner_phone else None,
        password_hash=get_password_hash(temp_password),
        name=req.owner_name.strip(),
        role="owner",
        organization_id=org.id,
        is_active=True,
        is_verified=True,
    )
    db.add(owner)
    db.commit()
    db.refresh(org)
    db.refresh(owner)

    return OwnerOnboardResponse(
        success=True,
        message=f"Owner account created for {req.brand_name}. Share credentials with the owner.",
        organization_id=org.id,
        organization_name=org.name,
        owner_id=owner.id,
        owner_name=owner.name,
        owner_email=owner_email,
        username=username,
        temp_password=temp_password,
        phone=req.owner_phone,
    )
