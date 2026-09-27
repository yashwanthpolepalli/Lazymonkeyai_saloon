from sqlalchemy import Column, String, Boolean, Float, Integer, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from src.models.base import TimeStampedModel

class Customer(TimeStampedModel):
    __tablename__ = "customers"

    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(50), nullable=False, unique=True, index=True)
    avatar = Column(String(500), nullable=True)
    gender = Column(String(20), default="female") # female, male, other
    joined_date = Column(String(50), nullable=True)
    preferred_branch_id = Column(String(36), ForeignKey("branches.id", ondelete="SET NULL"), nullable=True)
    preferred_stylist_id = Column(String(36), ForeignKey("stylists.id", ondelete="SET NULL"), nullable=True)
    wallet_balance = Column(Float, default=0.0)
    loyalty_points = Column(Integer, default=0)
    
    # Nested customer structures stored as JSON / relationships
    membership = Column(JSON, default=dict) # CustomerMembership
    membership_tier = Column(String(100), default="Standard")
    packages = Column(JSON, default=list) # List of CustomerPackage
    beauty_profile = Column(JSON, default=dict) # BeautyProfile (skinType, hairType, allergies, etc.)
    hair_profile = Column(JSON, default=dict)
    
    total_spent = Column(Float, default=0.0)
    visits_count = Column(Integer, default=0)
    segment = Column(String(100), default="New Customer") # VIP High Spender, Regular Loyalist, Occasional, New Customer, At Risk
    tags = Column(JSON, default=list)
    allergies = Column(JSON, default=list)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    appointments = relationship("Appointment", back_populates="customer", cascade="all, delete-orphan")
    invoices = relationship("ERPInvoice", back_populates="customer")
    wallet_transactions = relationship("WalletTransaction", back_populates="customer", cascade="all, delete-orphan")
    tickets = relationship("CustomerTicket", back_populates="customer", cascade="all, delete-orphan")

class WalletTransaction(TimeStampedModel):
    __tablename__ = "wallet_transactions"

    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False) # credit, debit, topup, cashback, refund
    amount = Column(Float, nullable=False)
    bonus_amount = Column(Float, default=0.0)
    balance_after = Column(Float, nullable=False)
    payment_method = Column(String(50), default="card")
    reference_id = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)

    customer = relationship("Customer", back_populates="wallet_transactions")

class MembershipTier(TimeStampedModel):
    __tablename__ = "membership_tiers"

    name = Column(String(100), unique=True, nullable=False) # "Black Diamond VIP", "Gold Elite", "Rose Silver"
    price = Column(Float, nullable=False)
    validity_days = Column(Integer, default=365)
    discount_percentage = Column(Float, default=15.0)
    color = Column(String(50), default="#D4AF37")
    bg_gradient = Column(String(100), default="from-amber-500 to-yellow-600")
    benefits = Column(JSON, default=list)
    eligible_categories = Column(JSON, default=list)
    eligible_branches = Column(JSON, default=list)
    free_monthly_blowouts = Column(Integer, default=0)
    priority_booking = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)

class FormulaCard(TimeStampedModel):
    __tablename__ = "formula_cards"

    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    stylist_id = Column(String(36), ForeignKey("stylists.id", ondelete="SET NULL"), nullable=True)
    stylist_name = Column(String(255), nullable=True)
    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="SET NULL"), nullable=True)
    service_type = Column(String(100), nullable=False) # Hair Color, Balayage, Keratin, Facial Peel, Scalp Therapy
    date = Column(String(50), nullable=False)
    formula_details = Column(JSON, default=dict) # {"roots": "...", "mid_lengths": "...", "developer": "...", "processing_time": "..."}
    processing_time_mins = Column(Integer, default=30)
    patch_test_date = Column(String(50), nullable=True)
    patch_test_result = Column(String(50), default="Passed") # Passed, Pending, Sensitive, N/A
    before_image = Column(String(500), nullable=True)
    after_image = Column(String(500), nullable=True)
    technique_notes = Column(Text, nullable=True)
    client_feedback = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    customer = relationship("Customer", backref="formula_records")

class GiftVoucher(TimeStampedModel):
    __tablename__ = "gift_vouchers"

    code = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    initial_amount = Column(Float, nullable=False)
    remaining_balance = Column(Float, nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)
    recipient_name = Column(String(255), nullable=True)
    recipient_phone = Column(String(50), nullable=True)
    recipient_email = Column(String(255), nullable=True)
    expiry_date = Column(String(50), nullable=False)
    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="active") # active, redeemed, expired, cancelled
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

