from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.erp import ERPInvoice
from src.schemas.pos import ERPInvoiceResponse

router = APIRouter(prefix="/erp/invoices", tags=["ERP - Invoices"])

@router.get("", response_model=List[ERPInvoiceResponse])
def get_invoices(
    limit: int = Query(20, ge=1, le=100),
    branch_id: Optional[str] = None,
    customer_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ERPInvoice)
    if branch_id:
        query = query.filter(ERPInvoice.branch_id == branch_id)
    if customer_id:
        query = query.filter(ERPInvoice.customer_id == customer_id)
    return query.order_by(ERPInvoice.created_at.desc()).limit(limit).all()

@router.get("/{invoice_id}", response_model=ERPInvoiceResponse)
def get_invoice_by_id(invoice_id: str, db: Session = Depends(get_db)):
    inv = db.query(ERPInvoice).filter(ERPInvoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return inv
