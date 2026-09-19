from sqlalchemy import Column, String, Boolean, Float, Integer, ForeignKey, JSON, Text, DateTime
from sqlalchemy.orm import relationship
from src.models.base import TimeStampedModel

class Company(TimeStampedModel):
    __tablename__ = "companies"

    name = Column(String(255), nullable=False)
    brand_name = Column(String(255), nullable=True)
    tagline = Column(String(255), nullable=True)
    logo = Column(String(500), nullable=True)
    currency = Column(String(10), default="INR", nullable=False)
    gstin = Column(String(50), nullable=True)
    cin = Column(String(50), nullable=True)
    pan = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    website = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India", nullable=True)
    tax_rate = Column(Float, default=0.18)
    is_active = Column(Boolean, default=True)

    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    branches = relationship("Branch", back_populates="company", cascade="all, delete-orphan")

class User(TimeStampedModel):
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), default="staff", nullable=False) # admin, owner, staff, customer
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="SET NULL"), nullable=True)
    avatar = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(255), nullable=True)

    company = relationship("Company", back_populates="users")
    branch = relationship("Branch", foreign_keys=[branch_id])

class ERPInvoice(TimeStampedModel):
    __tablename__ = "erp_invoices"

    invoice_number = Column(String(100), unique=True, index=True, nullable=False)
    appointment_id = Column(String(36), nullable=True, index=True)
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=True)
    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    branch_name = Column(String(255), nullable=True)
    
    subtotal = Column(Float, default=0.0)
    discount_total = Column(Float, default=0.0)
    tax_total = Column(Float, default=0.0)
    cgst_amount = Column(Float, default=0.0)
    sgst_amount = Column(Float, default=0.0)
    igst_amount = Column(Float, default=0.0)
    final_total = Column(Float, default=0.0)
    
    items = Column(JSON, default=list) # List of serialized CartItems
    payments = Column(JSON, default=list) # List of SplitPayments
    
    payment_status = Column(String(50), default="paid") # paid, partial, pending, refunded
    payment_mode = Column(String(50), default="cash")
    cashier_name = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    receipt_url = Column(String(500), nullable=True)

    customer = relationship("Customer", back_populates="invoices")
    branch = relationship("Branch", back_populates="invoices")

class GeneralLedger(TimeStampedModel):
    __tablename__ = "general_ledger"

    entry_number = Column(String(100), unique=True, index=True, nullable=False)
    account_code = Column(String(50), nullable=False, index=True)
    account_name = Column(String(255), nullable=False)
    entry_type = Column(String(20), nullable=False) # debit, credit
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="CASCADE"), nullable=True)
    reference_id = Column(String(100), nullable=True) # Invoice, Voucher, Expense ID
    reference_type = Column(String(50), nullable=True)
    narration = Column(Text, nullable=True)

class JournalVoucher(TimeStampedModel):
    __tablename__ = "journal_vouchers"

    voucher_number = Column(String(100), unique=True, index=True, nullable=False)
    voucher_type = Column(String(50), default="journal") # payment, receipt, contra, journal
    date = Column(String(20), nullable=False)
    total_debit = Column(Float, default=0.0)
    total_credit = Column(Float, default=0.0)
    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="CASCADE"), nullable=True)
    entries = Column(JSON, default=list)
    narration = Column(Text, nullable=True)
    status = Column(String(50), default="posted")

class FixedAsset(TimeStampedModel):
    __tablename__ = "fixed_assets"

    asset_code = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # Salon Chairs, Styling Stations, Spa Equipment
    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    purchase_date = Column(String(20), nullable=False)
    purchase_cost = Column(Float, nullable=False)
    salvage_value = Column(Float, default=0.0)
    useful_life_years = Column(Integer, default=5)
    depreciation_rate = Column(Float, default=0.20)
    accumulated_depreciation = Column(Float, default=0.0)
    current_value = Column(Float, nullable=False)
    status = Column(String(50), default="in_use")
