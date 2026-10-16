import uuid
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.customer import MembershipTier, Customer
from src.schemas.customer import MembershipTierCreate, MembershipTierResponse

router = APIRouter(prefix="/crm_modules/memberships", tags=["CRM - Memberships"])


@router.get("", response_model=List[MembershipTierResponse])
def get_membership_tiers(db: Session = Depends(get_db)):
    """Fetch active membership tiers created and stored in the database."""
    return (
        db.query(MembershipTier)
        .filter(MembershipTier.is_active == True)
        .order_by(MembershipTier.price.asc())
        .all()
    )


@router.post("", response_model=MembershipTierResponse, status_code=status.HTTP_201_CREATED)
def create_membership_tier(payload: MembershipTierCreate, db: Session = Depends(get_db)):
    """Create a new membership tier from the frontend and store in database."""
    existing = (
        db.query(MembershipTier)
        .filter(MembershipTier.name.ilike(payload.name.strip()))
        .first()
    )
    if existing:
        if not existing.is_active:
            # Reactivate if previously deactivated
            existing.is_active = True
            existing.price = payload.price
            existing.validity_days = payload.validity_days
            existing.discount_percentage = payload.discount_percentage
            existing.benefits = payload.benefits
            db.commit()
            db.refresh(existing)
            return existing
        raise HTTPException(
            status_code=400, detail=f"Membership tier '{payload.name}' already exists"
        )

    tier = MembershipTier(**payload.model_dump())
    db.add(tier)
    db.commit()
    db.refresh(tier)
    return tier


@router.delete("/{tier_id}")
def delete_membership_tier(tier_id: str, db: Session = Depends(get_db)):
    """Deactivate or remove a membership tier."""
    tier = db.query(MembershipTier).filter(MembershipTier.id == tier_id).first()
    if not tier:
        raise HTTPException(status_code=404, detail="Membership tier not found")
    tier.is_active = False
    db.commit()
    return {"success": True, "message": f"Membership tier '{tier.name}' deactivated."}


class EnrollMembershipRequest(BaseModel):
    customer_id: str
    tier_id: str
    payment_method: Optional[str] = "card"


@router.post("/enroll")
def enroll_customer_membership(
    payload: EnrollMembershipRequest, db: Session = Depends(get_db)
):
    """Enroll or renew a customer in a specific membership tier."""
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    tier = db.query(MembershipTier).filter(MembershipTier.id == payload.tier_id).first()
    if not tier:
        tier = (
            db.query(MembershipTier)
            .filter(MembershipTier.name.ilike(f"%{payload.tier_id}%"))
            .first()
        )
    if not tier:
        raise HTTPException(status_code=404, detail="Membership tier not found")

    start_date = datetime.now()
    expiry_date = start_date + timedelta(days=tier.validity_days or 365)
    mem_code = f"LM-{tier.name[:4].upper()}-{str(uuid.uuid4().int)[:5]}"

    membership_data = {
        "tierId": tier.id,
        "tierName": tier.name,
        "active": True,
        "startDate": start_date.strftime("%Y-%m-%d"),
        "expiresAt": expiry_date.strftime("%Y-%m-%d"),
        "remainingBlowouts": tier.free_monthly_blowouts if tier.free_monthly_blowouts is not None else 2,
        "totalSaved": 0,
        "membershipId": mem_code,
        "pricePaid": tier.price,
        "discountPercentage": tier.discount_percentage,
    }

    customer.membership_tier = tier.name
    customer.membership = membership_data
    db.commit()
    db.refresh(customer)

    return {
        "success": True,
        "customer": {
            "id": customer.id,
            "name": customer.name,
            "membership_tier": customer.membership_tier,
            "membership": customer.membership,
        },
        "membership": membership_data,
        "tier": {
            "id": tier.id,
            "name": tier.name,
            "price": tier.price,
            "discount_percentage": tier.discount_percentage,
            "validity_days": tier.validity_days,
        },
    }
