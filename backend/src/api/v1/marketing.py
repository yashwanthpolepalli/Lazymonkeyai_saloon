from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.marketing import Campaign, Coupon
from src.schemas.marketing import (
    CampaignCreate, CampaignResponse,
    CouponCreate, CouponResponse
)

router = APIRouter(prefix="/marketing", tags=["Marketing - Campaigns & Coupons"])

# --- Campaigns ---
@router.get("/campaigns", response_model=List[CampaignResponse])
def get_campaigns(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Campaign)
    if status:
        query = query.filter(Campaign.status == status)
    return query.order_by(Campaign.created_at.desc()).all()

@router.post("/campaigns", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db)):
    campaign = Campaign(**payload.model_dump())
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign

# --- Coupons ---
@router.get("/coupons", response_model=List[CouponResponse])
def get_coupons(db: Session = Depends(get_db)):
    return db.query(Coupon).filter(Coupon.is_active == True).all()

@router.post("/coupons", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
def create_coupon(payload: CouponCreate, db: Session = Depends(get_db)):
    existing = db.query(Coupon).filter(Coupon.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Coupon code '{payload.code}' already exists")
    
    coupon = Coupon(**payload.model_dump())
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon

@router.get("/coupons/validate/{code}")
def validate_coupon(code: str, amount: float = 0.0, db: Session = Depends(get_db)):
    coupon = db.query(Coupon).filter(Coupon.code == code.upper(), Coupon.is_active == True).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    
    if amount < coupon.min_spend:
        raise HTTPException(status_code=400, detail=f"Minimum spend of ₹{coupon.min_spend} required for this coupon")
    
    if coupon.times_used >= coupon.max_usage:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")

    return {
        "valid": True,
        "code": coupon.code,
        "discount_percent": coupon.discount_percent,
        "flat_discount": coupon.flat_discount,
        "max_discount": coupon.max_discount
    }
