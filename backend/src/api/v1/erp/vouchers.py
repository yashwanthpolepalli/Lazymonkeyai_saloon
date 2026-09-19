from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.erp import JournalVoucher
from pydantic import BaseModel

router = APIRouter(prefix="/erp/vouchers", tags=["ERP - Journal Vouchers"])

class VoucherCreate(BaseModel):
    voucher_type: str = "journal"
    date: str
    total_debit: float
    total_credit: float
    branch_id: Optional[str] = None
    entries: List[dict] = []
    narration: Optional[str] = None

@router.get("")
def get_vouchers(db: Session = Depends(get_db)):
    return db.query(JournalVoucher).order_by(JournalVoucher.created_at.desc()).all()

@router.post("", status_code=status.HTTP_201_CREATED)
def create_voucher(payload: VoucherCreate, db: Session = Depends(get_db)):
    count = db.query(JournalVoucher).count() + 1
    voucher_number = f"JV/{str(count).zfill(4)}"
    voucher = JournalVoucher(
        voucher_number=voucher_number,
        **payload.model_dump()
    )
    db.add(voucher)
    db.commit()
    db.refresh(voucher)
    return voucher
