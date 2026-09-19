from sqlalchemy import Column, String, Boolean, Float, ForeignKey, Text
from src.models.base import TimeStampedModel

class FinancialExpense(TimeStampedModel):
    __tablename__ = "financial_expenses"

    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(100), nullable=False) # Rent & Lease, Staff Payroll, Inventory Stock, Utilities & Power, Marketing, Salon Maintenance
    amount = Column(Float, nullable=False)
    date = Column(String(50), nullable=False)
    paid_to = Column(String(255), nullable=False)
    payment_method = Column(String(50), default="bank_transfer")
    receipt_url = Column(String(500), nullable=True)
    status = Column(String(50), default="approved") # approved, pending, rejected
    description = Column(Text, nullable=True)
