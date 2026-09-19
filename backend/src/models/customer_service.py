from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from src.models.base import TimeStampedModel

class CustomerTicket(TimeStampedModel):
    __tablename__ = "customer_tickets"

    ticket_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(255), nullable=False)
    category = Column(String(100), default="Service Quality") # Service Quality, Billing / Refund, Booking Reschedule, Stylist Feedback, Product Allergy
    priority = Column(String(50), default="medium") # low, medium, high, critical
    status = Column(String(50), default="open") # open, in_progress, resolved, escalated
    sla_minutes_remaining = Column(Integer, default=240)
    assigned_to = Column(String(255), nullable=True)
    messages = Column(JSON, default=list) # [{sender, role, text, time}]

    customer = relationship("Customer", back_populates="tickets")
