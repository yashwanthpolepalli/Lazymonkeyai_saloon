from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.erp import ERPInvoice
from src.schemas.pos import TaxSummaryResponse

router = APIRouter(prefix="/erp/tax", tags=["ERP - GST & Tax Summary"])

@router.get("/summary", response_model=TaxSummaryResponse)
def get_tax_summary(fiscal_quarter: Optional[str] = None, db: Session = Depends(get_db)):
    invoices = db.query(ERPInvoice).filter(ERPInvoice.payment_status == "paid").all()

    cgst = sum(inv.cgst_amount or 0.0 for inv in invoices)
    sgst = sum(inv.sgst_amount or 0.0 for inv in invoices)
    igst = sum(inv.igst_amount or 0.0 for inv in invoices)
    total_gst = cgst + sgst + igst
    taxable_turnover = sum(inv.subtotal or 0.0 for inv in invoices)

    return {
        "total_gst": round(total_gst, 2),
        "cgst": round(cgst, 2),
        "sgst": round(sgst, 2),
        "igst": round(igst, 2),
        "taxable_turnover": round(taxable_turnover, 2)
    }
