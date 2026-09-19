from typing import Optional
from pydantic import BaseModel

class FinancialExpenseBase(BaseModel):
    branch_id: str
    category: str # Rent & Lease, Staff Payroll, Inventory Stock, Utilities & Power, Marketing, Salon Maintenance
    amount: float
    date: str
    paid_to: str
    payment_method: str = "bank_transfer"
    receipt_url: Optional[str] = None
    status: str = "approved"
    description: Optional[str] = None

class FinancialExpenseCreate(FinancialExpenseBase):
    pass

class FinancialExpenseResponse(FinancialExpenseBase):
    id: str

    class Config:
        from_attributes = True

class FinancialSummaryResponse(BaseModel):
    total_revenue: float
    total_expenses: float
    net_profit: float
    profit_margin_pct: float
