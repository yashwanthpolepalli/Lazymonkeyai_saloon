import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.customer import GiftVoucher, Customer
from src.schemas.customer import (
    GiftVoucherCreate, GiftVoucherResponse, GiftVoucherRedeem
)

router = APIRouter(prefix="/crm/gift-vouchers", tags=["CRM - Gift Vouchers"])

@router.get("", response_model=List[GiftVoucherResponse])
def get_gift_vouchers(
    status_filter: Optional[str] = None,
    customer_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(GiftVoucher).filter(GiftVoucher.is_active == True)
    if status_filter:
        query = query.filter(GiftVoucher.status == status_filter)
    if customer_id:
        query = query.filter(GiftVoucher.customer_id == customer_id)
    return query.order_by(GiftVoucher.created_at.desc()).all()

@router.post("", response_model=GiftVoucherResponse, status_code=status.HTTP_201_CREATED)
def issue_gift_voucher(payload: GiftVoucherCreate, db: Session = Depends(get_db)):
    voucher_code = (payload.code or f"GIFT-{uuid.uuid4().hex[:8].upper()}").strip().upper()
    existing = db.query(GiftVoucher).filter(GiftVoucher.code == voucher_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Voucher code '{voucher_code}' already exists."
        )
    
    voucher = GiftVoucher(
        code=voucher_code,
        title=payload.title,
        initial_amount=payload.initial_amount,
        remaining_balance=payload.initial_amount,
        customer_id=payload.customer_id,
        recipient_name=payload.recipient_name,
        recipient_phone=payload.recipient_phone,
        recipient_email=payload.recipient_email,
        expiry_date=payload.expiry_date,
        branch_id=payload.branch_id,
        status="active",
        notes=payload.notes,
        is_active=True
    )
    db.add(voucher)
    db.commit()
    db.refresh(voucher)
    return voucher

@router.get("/validate/{code}", response_model=GiftVoucherResponse)
def validate_gift_voucher(code: str, db: Session = Depends(get_db)):
    cleaned_code = code.strip().upper()
    voucher = db.query(GiftVoucher).filter(
        GiftVoucher.code == cleaned_code,
        GiftVoucher.is_active == True
    ).first()
    if not voucher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gift voucher not found or invalid.")
    if voucher.status != "active" or voucher.remaining_balance <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Gift voucher is fully redeemed or inactive.")
    return voucher

@router.post("/redeem", response_model=GiftVoucherResponse)
def redeem_gift_voucher(payload: GiftVoucherRedeem, db: Session = Depends(get_db)):
    cleaned_code = payload.code.strip().upper()
    voucher = db.query(GiftVoucher).filter(
        GiftVoucher.code == cleaned_code,
        GiftVoucher.is_active == True
    ).first()
    if not voucher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gift voucher not found.")
    
    if voucher.status != "active" or voucher.remaining_balance <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Voucher cannot be redeemed: balance is 0 or voucher is inactive.")
    
    if payload.amount_to_redeem > voucher.remaining_balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Redemption amount ({payload.amount_to_redeem}) exceeds remaining balance ({voucher.remaining_balance})"
        )
    
    voucher.remaining_balance -= payload.amount_to_redeem
    if voucher.remaining_balance <= 0.01:
        voucher.remaining_balance = 0.0
        voucher.status = "redeemed"
        
    db.commit()
    db.refresh(voucher)
    return voucher
