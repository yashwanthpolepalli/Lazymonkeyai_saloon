import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.customer import Customer, WalletTransaction, WalletTopUpPack
from src.models.salon import Branch, Stylist
from src.schemas.customer import (
    CustomerCreate, CustomerUpdate, CustomerResponse,
    WalletTopUpRequest, WalletBalanceResponse,
    WalletTopUpPackCreate, WalletTopUpPackResponse
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
    clean_phone = payload.phone.strip() if payload.phone else ""
    existing = db.query(Customer).filter(Customer.phone == clean_phone).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with phone number {clean_phone} already registered"
        )
    
    # Safely resolve preferred branch if provided and valid in the database
    resolved_branch_id = None
    if payload.preferred_branch_id and payload.preferred_branch_id.strip():
        branch = db.query(Branch).filter(Branch.id == payload.preferred_branch_id.strip()).first()
        if branch:
            resolved_branch_id = branch.id

    clean_email = payload.email.strip() if payload.email and payload.email.strip() else None
    joined_date = datetime.now().strftime("%Y-%m-%d")
    customer = Customer(
        name=payload.name.strip(),
        phone=clean_phone,
        email=clean_email,
        gender="female" if payload.gender == "female" else ("male" if payload.gender == "male" else "other"),
        membership_tier=payload.tier or "Standard",
        preferred_branch_id=resolved_branch_id,
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

    # Automatically provision User login account and dispatch credential email if email is provided
    if clean_email:
        try:
            from src.services.credential_service import provision_user_account
            provision_user_account(
                db=db,
                name=payload.name,
                email=clean_email,
                phone=clean_phone,
                role="customer",
                organization_id=payload.organization_id if hasattr(payload, "organization_id") else None,
                branch_id=resolved_branch_id,
                department="VIP Client",
            )
        except Exception as err:
            print(f"[CRM] Warning: Credential provisioning failed for customer: {err}")

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
    
    data = payload.model_dump(exclude_unset=True)
    if "preferred_branch_id" in data:
        bid = data["preferred_branch_id"]
        if bid and isinstance(bid, str) and bid.strip():
            branch = db.query(Branch).filter(Branch.id == bid.strip()).first()
            data["preferred_branch_id"] = branch.id if branch else None
        else:
            data["preferred_branch_id"] = None

    if "preferred_stylist_id" in data:
        sid = data["preferred_stylist_id"]
        if sid and isinstance(sid, str) and sid.strip():
            stylist = db.query(Stylist).filter(Stylist.id == sid.strip()).first()
            data["preferred_stylist_id"] = stylist.id if stylist else None
        else:
            data["preferred_stylist_id"] = None

    for key, value in data.items():
        setattr(customer, key, value)
    
    db.commit()
    db.refresh(customer)
    return customer


from pydantic import BaseModel

class BulkDeleteCustomersRequest(BaseModel):
    customer_ids: List[str]

@router.post("/bulk-delete")
def bulk_delete_customers(payload: BulkDeleteCustomersRequest, db: Session = Depends(get_db)):
    if not payload.customer_ids:
        return {"success": True, "deleted_count": 0, "deleted_ids": []}

    deleted_ids = []
    from src.models.erp import User
    for cid in payload.customer_ids:
        customer = db.query(Customer).filter(Customer.id == cid).first()
        if not customer:
            continue
        
        if customer.email:
            user = db.query(User).filter(User.email == customer.email, User.role == "customer").first()
            if user:
                try:
                    db.delete(user)
                except Exception:
                    user.is_active = False

        try:
            db.delete(customer)
            db.commit()
            deleted_ids.append(cid)
        except Exception:
            db.rollback()
            customer = db.query(Customer).filter(Customer.id == cid).first()
            if customer:
                customer.is_active = False
                db.commit()
                deleted_ids.append(cid)

    return {"success": True, "deleted_count": len(deleted_ids), "deleted_ids": deleted_ids}

@router.delete("/{customer_id}")
def delete_customer(customer_id: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if customer.email:
        from src.models.erp import User
        user = db.query(User).filter(User.email == customer.email, User.role == "customer").first()
        if user:
            try:
                db.delete(user)
            except Exception:
                user.is_active = False

    try:
        db.delete(customer)
        db.commit()
    except Exception:
        db.rollback()
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if customer:
            customer.is_active = False
            db.commit()

    return {"success": True, "message": "Customer deleted successfully", "id": customer_id}

# --- Wallet Sub-Endpoints mapped to frontend apiClient.ts ---
wallet_router = APIRouter(prefix="/crm_modules/wallet", tags=["CRM - Wallet"])

@wallet_router.get("/packs", response_model=List[WalletTopUpPackResponse])
@router.get("/wallet/packs", response_model=List[WalletTopUpPackResponse])
def get_wallet_topup_packs(db: Session = Depends(get_db)):
    """Fetch active promotional wallet top-up packs directly from database."""
    return db.query(WalletTopUpPack).filter(WalletTopUpPack.is_active == True).order_by(
        WalletTopUpPack.display_order.asc(), 
        WalletTopUpPack.amount.asc()
    ).all()


@wallet_router.post("/packs", response_model=WalletTopUpPackResponse, status_code=status.HTTP_201_CREATED)
@router.post("/wallet/packs", response_model=WalletTopUpPackResponse, status_code=status.HTTP_201_CREATED)
def create_wallet_topup_pack(payload: WalletTopUpPackCreate, db: Session = Depends(get_db)):
    """Add a new promotional wallet top-up pack to the database."""
    pack = WalletTopUpPack(
        id=str(uuid.uuid4()),
        name=payload.name.strip(),
        amount=payload.amount,
        bonus=payload.bonus,
        badge=payload.badge,
        is_popular=payload.is_popular,
        display_order=payload.display_order,
        is_active=True
    )
    db.add(pack)
    db.commit()
    db.refresh(pack)
    return pack


@wallet_router.get("/{customer_id}", response_model=WalletBalanceResponse)
@router.get("/{customer_id}/wallet", response_model=WalletBalanceResponse)
def get_customer_wallet(customer_id: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id, Customer.is_active == True).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID '{customer_id}' not found in database."
        )
    
    txs = db.query(WalletTransaction).filter(WalletTransaction.customer_id == customer.id).order_by(WalletTransaction.created_at.desc()).all()
    history = [
        {
            "id": tx.id,
            "type": tx.type,
            "amount": tx.amount,
            "bonus_amount": tx.bonus_amount,
            "balance_after": tx.balance_after,
            "payment_method": tx.payment_method,
            "date": tx.created_at.strftime("%b %d, %Y %I:%M %p") if tx.created_at else "",
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
    if not req.customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="customer_id is required for wallet top-up."
        )

    customer = db.query(Customer).filter(Customer.id == req.customer_id, Customer.is_active == True).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID '{req.customer_id}' not found in database."
        )
    
    total_credit = req.amount + req.bonus
    customer.wallet_balance = (customer.wallet_balance or 0.0) + total_credit
    
    tx = WalletTransaction(
        id=str(uuid.uuid4()),
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


