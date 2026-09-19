from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.customer import Customer, WalletTransaction
from src.schemas.customer import (
    CustomerCreate, CustomerUpdate, CustomerResponse,
    WalletTopUpRequest, WalletBalanceResponse
)
from src.utils.number_series import generate_reference_code

router = APIRouter(prefix="/crm/customers", tags=["CRM - Customers"])

@router.get("", response_model=List[CustomerResponse])
def get_customers(
    search: Optional[str] = None,
    tier: Optional[str] = None,
    segment: Optional[str] = None,
    branch_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Customer).filter(Customer.is_active == True)
    
    if search:
        query = query.filter((Customer.name.ilike(f"%{search}%")) | (Customer.phone.ilike(f"%{search}%")))
    if tier:
        query = query.filter(Customer.membership_tier.ilike(f"%{tier}%"))
    if segment:
        query = query.filter(Customer.segment == segment)
    if branch_id:
        query = query.filter(Customer.preferred_branch_id == branch_id)
        
    return query.order_by(Customer.created_at.desc()).all()

@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    existing = db.query(Customer).filter(Customer.phone == payload.phone).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with phone number {payload.phone} already registered"
        )
    
    joined_date = datetime.now().strftime("%Y-%m-%d")
    customer = Customer(
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        gender="female" if payload.gender == "female" else ("male" if payload.gender == "male" else "other"),
        membership_tier=payload.tier or "Standard",
        preferred_branch_id=payload.preferred_branch_id,
        notes=payload.notes,
        joined_date=joined_date,
        segment="New Customer",
        wallet_balance=0.0,
        loyalty_points=0,
        packages=[],
        tags=["New Client"],
        beauty_profile={},
        hair_profile={}
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer_by_id(customer_id: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: str, payload: CustomerUpdate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, key, value)
    
    db.commit()
    db.refresh(customer)
    return customer

# --- Wallet Sub-Endpoints mapped to frontend apiClient.ts ---
wallet_router = APIRouter(prefix="/crm_modules/wallet", tags=["CRM - Wallet"])

@wallet_router.get("/{customer_id}", response_model=WalletBalanceResponse)
@router.get("/{customer_id}/wallet", response_model=WalletBalanceResponse)
def get_customer_wallet(customer_id: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    txs = db.query(WalletTransaction).filter(WalletTransaction.customer_id == customer_id).order_by(WalletTransaction.created_at.desc()).all()
    history = [
        {
            "id": tx.id,
            "type": tx.type,
            "amount": tx.amount,
            "bonus_amount": tx.bonus_amount,
            "balance_after": tx.balance_after,
            "payment_method": tx.payment_method,
            "date": tx.created_at.isoformat() if tx.created_at else "",
            "notes": tx.notes
        }
        for tx in txs
    ]
    return {
        "balance": customer.wallet_balance or 0.0,
        "currency": "INR",
        "history": history
    }

@wallet_router.post("/topup")
@router.post("/wallet/topup")
def top_up_wallet(req: WalletTopUpRequest, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == req.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    total_credit = req.amount + req.bonus
    customer.wallet_balance = (customer.wallet_balance or 0.0) + total_credit
    
    tx = WalletTransaction(
        customer_id=customer.id,
        type="topup",
        amount=req.amount,
        bonus_amount=req.bonus,
        balance_after=customer.wallet_balance,
        payment_method=req.payment_method,
        reference_id=generate_reference_code("WLT"),
        notes=f"Wallet Top-Up with ₹{req.bonus:,.2f} bonus"
    )
    db.add(tx)
    db.commit()
    db.refresh(customer)
    
    return {
        "newBalance": customer.wallet_balance,
        "txId": tx.id,
        "success": True
    }

