import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.pos import PettyCashExpense, POSRegisterSession
from src.schemas.pos import PettyCashExpenseCreate, PettyCashExpenseResponse

router = APIRouter(prefix="/pos/petty-cash", tags=["POS - Petty Cash & Expenses"])

@router.get("", response_model=List[PettyCashExpenseResponse])
def get_petty_cash_expenses(
    branch_id: Optional[str] = None,
    session_code: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PettyCashExpense)
    if branch_id:
        query = query.filter(PettyCashExpense.branch_id == branch_id)
    if session_code:
        query = query.filter(PettyCashExpense.session_code == session_code)
    if category:
        query = query.filter(PettyCashExpense.category == category)
    return query.order_by(PettyCashExpense.created_at.desc()).all()

@router.post("", response_model=PettyCashExpenseResponse, status_code=status.HTTP_201_CREATED)
def record_petty_cash_expense(payload: PettyCashExpenseCreate, db: Session = Depends(get_db)):
    voucher_code = f"PETTY-{uuid.uuid4().hex[:6].upper()}"
    date_str = payload.date or datetime.now().strftime("%Y-%m-%d %H:%M")
    
    expense = PettyCashExpense(
        voucher_no=voucher_code,
        branch_id=payload.branch_id,
        session_code=payload.session_code,
        category=payload.category,
        amount=payload.amount,
        date=date_str,
        paid_to=payload.paid_to,
        approved_by=payload.approved_by,
        payment_mode=payload.payment_mode,
        receipt_url=payload.receipt_url,
        notes=payload.notes
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense
