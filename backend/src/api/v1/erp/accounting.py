from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.erp import GeneralLedger, ERPInvoice
from src.models.finance import FinancialExpense

router = APIRouter(prefix="/erp/accounting", tags=["ERP - Accounting & General Ledger"])

@router.get("/ledger")
def get_general_ledger(branch_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(GeneralLedger)
    if branch_id:
        query = query.filter(GeneralLedger.branch_id == branch_id)
    return query.order_by(GeneralLedger.created_at.desc()).limit(100).all()

@router.get("/financial_summary")
def get_financial_summary(db: Session = Depends(get_db)):
    invoices = db.query(ERPInvoice).filter(ERPInvoice.payment_status == "paid").all()
    expenses = db.query(FinancialExpense).filter(FinancialExpense.status == "approved").all()

    total_revenue = sum(inv.final_total or 0 for inv in invoices)
    total_expenses = sum(exp.amount or 0 for exp in expenses)
    net_profit = total_revenue - total_expenses
    profit_margin = (net_profit / total_revenue * 100) if total_revenue > 0 else 0.0

    return {
        "total_revenue": round(total_revenue, 2),
        "total_expenses": round(total_expenses, 2),
        "net_profit": round(net_profit, 2),
        "profit_margin_pct": round(profit_margin, 1)
    }
