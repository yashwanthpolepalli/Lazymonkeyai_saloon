from sqlalchemy import Column, String, Boolean, Float, Integer, ForeignKey, JSON, Text, DateTime
from sqlalchemy.orm import relationship
from src.models.base import TimeStampedModel
import datetime

class Organization(TimeStampedModel):
    __tablename__ = "organizations"

    name = Column(String(255), nullable=False, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    business_type = Column(String(50), default="general", nullable=False) # general, enterprise_chain, institution_public, franchise
    brand_tagline = Column(String(255), nullable=True)
    logo = Column(String(500), nullable=True)
    currency = Column(String(10), default="INR", nullable=False)
    tax_rate = Column(Float, default=0.18)
    gstin_or_tax_id = Column(String(50), nullable=True)
    cin_or_reg_number = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    website = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India", nullable=True)
    is_active = Column(Boolean, default=True)

    # Dynamic Policy Configuration JSON
    policy_config = Column(JSON, default=lambda: {
        "multi_branch_enabled": True,
        "approval_required": False,
        "inventory_enabled": True,
        "central_warehouse_enabled": False,
        "payroll_enabled": True,
        "commission_enabled": True,
        "membership_enabled": True,
        "marketing_enabled": True,
        "audit_enabled": True,
        "internal_entitlement_mode": False,
        "budget_tracking_enabled": False,
        "pos_mode": "retail_pos", # retail_pos, enterprise_pos, institutional_allocation
        "departments": ["Hair Styling", "Skin Care & Aesthetics", "Nail Studio", "Wellness & Spa"]
    })

    branches = relationship("Branch", back_populates="organization", cascade="all, delete-orphan")
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    approval_requests = relationship("ApprovalRequest", back_populates="organization", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="organization", cascade="all, delete-orphan")
    service_allocations = relationship("ServiceAllocation", back_populates="organization", cascade="all, delete-orphan")

class ApprovalRequest(TimeStampedModel):
    __tablename__ = "approval_requests"

    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="SET NULL"), nullable=True)
    request_type = Column(String(50), nullable=False) # service_eligibility, purchase_order, expense_claim, leave_request, price_override
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    requested_by = Column(String(255), nullable=False)
    requested_by_id = Column(String(36), nullable=True)
    beneficiary_name = Column(String(255), nullable=True)
    beneficiary_id = Column(String(36), nullable=True)
    department = Column(String(100), nullable=True)
    amount = Column(Float, default=0.0)
    status = Column(String(50), default="pending", index=True) # pending, approved, rejected, cancelled
    approver_id = Column(String(36), nullable=True)
    approver_name = Column(String(255), nullable=True)
    approver_notes = Column(Text, nullable=True)
    metadata_payload = Column(JSON, default=dict)

    organization = relationship("Organization", back_populates="approval_requests")

class AuditLog(TimeStampedModel):
    __tablename__ = "audit_logs"

    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), nullable=True)
    user_name = Column(String(255), default="System")
    user_role = Column(String(50), default="user")
    action = Column(String(100), nullable=False, index=True) # CREATE_APPOINTMENT, APPROVE_PURCHASE, POS_CHECKOUT, UPDATE_POLICY, etc.
    module = Column(String(100), nullable=False, index=True) # POS, HRMS, CRM, BOOKING, INVENTORY, GOVERNANCE
    entity_id = Column(String(36), nullable=True)
    ip_address = Column(String(50), nullable=True)
    details = Column(JSON, default=dict)

    organization = relationship("Organization", back_populates="audit_logs")

class ServiceAllocation(TimeStampedModel):
    __tablename__ = "service_allocations"

    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    beneficiary_id = Column(String(36), nullable=False, index=True) # Customer/Employee ID
    beneficiary_name = Column(String(255), nullable=False)
    department = Column(String(100), nullable=True)
    cost_center = Column(String(100), nullable=True)
    service_id = Column(String(36), nullable=False)
    service_name = Column(String(255), nullable=False)
    quota_monthly = Column(Integer, default=2)
    quota_used = Column(Integer, default=0)
    unit_entitlement_value = Column(Float, default=0.0)
    valid_from = Column(String(50), nullable=True)
    valid_to = Column(String(50), nullable=True)
    status = Column(String(50), default="active") # active, expired, suspended

    organization = relationship("Organization", back_populates="service_allocations")
