from sqlalchemy import Column, String, Boolean, Float, Integer, ForeignKey, JSON, Text
from src.models.base import TimeStampedModel

class Lead(TimeStampedModel):
    __tablename__ = "leads"

    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=True)
    source = Column(String(100), default="Instagram Ad") # Instagram Ad, Google Search, Walk-in Inquiry, Referral, Influencer Campaign
    stage = Column(String(100), default="New") # New, Contacted, Consultation Booked, Converted, Lost
    interested_service = Column(String(255), nullable=True)
    estimated_value = Column(Float, default=0.0)
    assigned_staff = Column(String(255), nullable=True)
    created_date = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)

class Campaign(TimeStampedModel):
    __tablename__ = "campaigns"

    title = Column(String(255), nullable=False)
    channel = Column(String(50), default="WhatsApp") # WhatsApp, SMS, Email, Instagram
    status = Column(String(50), default="active") # active, draft, completed
    target_segment = Column(String(100), default="VIP High Spender")
    audience_count = Column(Integer, default=0)
    sent_count = Column(Integer, default=0)
    opened_rate = Column(Float, default=0.0)
    conversions = Column(Integer, default=0)
    revenue_generated = Column(Float, default=0.0)
    discount_code = Column(String(50), nullable=True)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    template_content = Column(Text, nullable=True)

class Coupon(TimeStampedModel):
    __tablename__ = "coupons"

    code = Column(String(50), unique=True, index=True, nullable=False)
    discount_percent = Column(Float, nullable=True)
    flat_discount = Column(Float, nullable=True)
    min_spend = Column(Float, default=0.0)
    max_discount = Column(Float, nullable=True)
    valid_until = Column(String(50), nullable=False)
    times_used = Column(Integer, default=0)
    max_usage = Column(Integer, default=100)
    applicable_branches = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
