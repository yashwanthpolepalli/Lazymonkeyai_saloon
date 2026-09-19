from sqlalchemy import Column, String, Boolean, Float, Integer, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from src.models.base import TimeStampedModel

class Appointment(TimeStampedModel):
    __tablename__ = "appointments"

    booking_ref = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    customer_email = Column(String(255), nullable=True)
    
    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    branch_name = Column(String(255), nullable=False)
    
    service_id = Column(String(36), ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    service_name = Column(String(255), nullable=False)
    category_name = Column(String(255), nullable=False)
    
    stylist_id = Column(String(36), ForeignKey("stylists.id", ondelete="CASCADE"), nullable=False)
    stylist_name = Column(String(255), nullable=False)
    stylist_tier = Column(String(50), default="senior")
    
    date = Column(String(20), nullable=False, index=True) # YYYY-MM-DD
    time_slot = Column(String(20), nullable=False) # HH:MM e.g. "14:30"
    duration_minutes = Column(Integer, default=60)
    
    selected_options = Column(JSON, default=list) # List of BookingSelectedOption
    selected_add_ons = Column(JSON, default=list) # List of AddOn
    status = Column(String(50), default="confirmed", index=True) # confirmed, checked_in, in_service, completed, cancelled, rescheduled, no_show
    
    # Financial breakdown
    base_price = Column(Float, default=0.0)
    options_price = Column(Float, default=0.0)
    add_ons_price = Column(Float, default=0.0)
    stylist_tier_markup = Column(Float, default=0.0)
    subtotal = Column(Float, default=0.0)
    membership_discount = Column(Float, default=0.0)
    package_credit_used = Column(Boolean, default=False)
    wallet_used = Column(Float, default=0.0)
    loyalty_discount = Column(Float, default=0.0)
    coupon_discount = Column(Float, default=0.0)
    coupon_code = Column(String(50), nullable=True)
    tax_amount = Column(Float, default=0.0)
    final_total = Column(Float, default=0.0)
    
    payment_status = Column(String(50), default="unpaid") # unpaid, partially_paid, paid, refunded
    payment_method = Column(String(50), nullable=True)
    chair_number = Column(Integer, nullable=True)
    service_notes = Column(Text, nullable=True)
    before_photo = Column(String(500), nullable=True)
    after_photo = Column(String(500), nullable=True)
    products_used = Column(JSON, default=list)
    client_feedback_rating = Column(Float, nullable=True)
    client_feedback_review = Column(Text, nullable=True)

    customer = relationship("Customer", back_populates="appointments")
    branch = relationship("Branch", back_populates="appointments")
    stylist = relationship("Stylist", back_populates="appointments")
