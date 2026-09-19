from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.customer import MembershipTier
from src.schemas.customer import MembershipTierCreate, MembershipTierResponse

router = APIRouter(prefix="/crm_modules/memberships", tags=["CRM - Memberships"])

@router.get("", response_model=List[MembershipTierResponse])
def get_membership_tiers(db: Session = Depends(get_db)):
    return db.query(MembershipTier).filter(MembershipTier.is_active == True).all()

@router.post("", response_model=MembershipTierResponse, status_code=status.HTTP_201_CREATED)
def create_membership_tier(payload: MembershipTierCreate, db: Session = Depends(get_db)):
    existing = db.query(MembershipTier).filter(MembershipTier.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Membership tier '{payload.name}' already exists")
    
    tier = MembershipTier(**payload.model_dump())
    db.add(tier)
    db.commit()
    db.refresh(tier)
    return tier
