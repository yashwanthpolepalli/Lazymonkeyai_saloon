from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class PolicyConfigSchema(BaseModel):
    multi_branch_enabled: Optional[bool] = None
    approval_required: Optional[bool] = None
    inventory_enabled: Optional[bool] = None
    central_warehouse_enabled: Optional[bool] = None
    payroll_enabled: Optional[bool] = None
    commission_enabled: Optional[bool] = None
    membership_enabled: Optional[bool] = None
    marketing_enabled: Optional[bool] = None
    audit_enabled: Optional[bool] = None
    internal_entitlement_mode: Optional[bool] = None
    budget_tracking_enabled: Optional[bool] = None
    pos_mode: Optional[str] = None # retail_pos, enterprise_pos, institutional_allocation
    departments: Optional[List[str]] = None

class OrganizationCreate(BaseModel):
    name: str
    code: str
    business_type: str # general, enterprise_chain, institution_public, franchise
    brand_tagline: Optional[str] = None
    logo: Optional[str] = None
    currency: Optional[str] = None
    tax_rate: Optional[float] = None
    gstin_or_tax_id: Optional[str] = None
    cin_or_reg_number: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    policy_config: Optional[Dict[str, Any]] = None

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    brand_tagline: Optional[str] = None
    logo: Optional[str] = None
    currency: Optional[str] = None
    tax_rate: Optional[float] = None
    gstin_or_tax_id: Optional[str] = None
    cin_or_reg_number: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    policy_config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class OrganizationResponse(BaseModel):
    id: str
    name: str
    code: str
    business_type: str
    brand_tagline: Optional[str] = None
    logo: Optional[str] = None
    currency: Optional[str] = None
    tax_rate: Optional[float] = None
    gstin_or_tax_id: Optional[str] = None
    cin_or_reg_number: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    is_active: bool
    policy_config: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# Approval Workflow Schemas
class ApprovalRequestCreate(BaseModel):
    organization_id: Optional[str] = None
    branch_id: Optional[str] = None
    request_type: str # service_eligibility, purchase_order, expense_claim, leave_request, price_override
    title: str
    description: Optional[str] = None
    requested_by: str
    requested_by_id: Optional[str] = None
    beneficiary_name: Optional[str] = None
    beneficiary_id: Optional[str] = None
    department: Optional[str] = None
    amount: Optional[float] = None
    metadata_payload: Optional[Dict[str, Any]] = None

class ApprovalDecision(BaseModel):
    status: str # approved, rejected
    approver_id: Optional[str] = None
    approver_name: str
    approver_notes: Optional[str] = None

class ApprovalRequestResponse(BaseModel):
    id: str
    organization_id: str
    branch_id: Optional[str] = None
    request_type: str
    title: str
    description: Optional[str] = None
    requested_by: str
    requested_by_id: Optional[str] = None
    beneficiary_name: Optional[str] = None
    beneficiary_id: Optional[str] = None
    department: Optional[str] = None
    amount: Optional[float] = None
    status: str
    approver_id: Optional[str] = None
    approver_name: Optional[str] = None
    approver_notes: Optional[str] = None
    metadata_payload: Optional[Dict[str, Any]] = None
    created_at: Optional[Any] = None

    class Config:
        from_attributes = True

# Audit Log Schemas
class AuditLogCreate(BaseModel):
    organization_id: Optional[str] = None
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    module: str
    entity_id: Optional[str] = None
    ip_address: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class AuditLogResponse(BaseModel):
    id: str
    organization_id: str
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    module: str
    entity_id: Optional[str] = None
    ip_address: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    created_at: Optional[Any] = None

    class Config:
        from_attributes = True

# Service Allocation / Entitlement Schemas
class ServiceAllocationCreate(BaseModel):
    organization_id: Optional[str] = None
    beneficiary_id: str
    beneficiary_name: str
    department: Optional[str] = None
    cost_center: Optional[str] = None
    service_id: str
    service_name: str
    quota_monthly: int
    unit_entitlement_value: Optional[float] = None
    valid_from: Optional[str] = None
    valid_to: Optional[str] = None

class ServiceAllocationResponse(BaseModel):
    id: str
    organization_id: str
    beneficiary_id: str
    beneficiary_name: str
    department: Optional[str] = None
    cost_center: Optional[str] = None
    service_id: str
    service_name: str
    quota_monthly: int
    quota_used: int
    unit_entitlement_value: Optional[float] = None
    valid_from: Optional[str] = None
    valid_to: Optional[str] = None
    status: str

    class Config:
        from_attributes = True
