from sqlalchemy import Column, String, Boolean, Float, Integer, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from src.models.base import TimeStampedModel

class POSRegisterSession(TimeStampedModel):
    __tablename__ = "pos_sessions"

    session_code = Column(String(50), unique=True, index=True, nullable=False)
    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    opened_by = Column(String(255), nullable=False)
    closed_by = Column(String(255), nullable=True)
    opening_cash = Column(Float, default=0.0)
    closing_cash = Column(Float, nullable=True)
    expected_cash = Column(Float, default=0.0)
    cash_difference = Column(Float, default=0.0)
    total_sales = Column(Float, default=0.0)
    total_transactions = Column(Integer, default=0)
    status = Column(String(50), default="open") # open, closed
    notes = Column(Text, nullable=True)

class FreeQuantityRule(TimeStampedModel):
    __tablename__ = "free_qty_rules"

    name = Column(String(255), nullable=False)
    buy_product_id = Column(String(36), nullable=True)
    buy_qty = Column(Integer, default=1)
    get_product_id = Column(String(36), nullable=True)
    get_qty = Column(Integer, default=1)
    discount_pct = Column(Float, default=100.0) # 100% free
    is_active = Column(Boolean, default=True)
    valid_until = Column(String(50), nullable=True)

class PettyCashExpense(TimeStampedModel):
    __tablename__ = "petty_cash_expenses"

    voucher_no = Column(String(100), unique=True, index=True, nullable=False)
    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    session_code = Column(String(50), nullable=True)
    category = Column(String(100), nullable=False) # Tea / Refreshments, Salon Cleaning & Laundry, Local Transport, Staff Welfare, Emergency Repairs, Miscellaneous
    amount = Column(Float, nullable=False)
    date = Column(String(50), nullable=False)
    paid_to = Column(String(255), nullable=False)
    approved_by = Column(String(255), nullable=False)
    payment_mode = Column(String(50), default="cash_drawer") # cash_drawer, petty_cash_box, upi
    receipt_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)

