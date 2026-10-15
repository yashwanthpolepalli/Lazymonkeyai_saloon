from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from src.core.database import get_db
from src.models.organization import Organization, ApprovalRequest, AuditLog, ServiceAllocation
from src.models.erp import User
from src.models.salon import Branch
from src.schemas.organization import (
    OrganizationCreate, OrganizationUpdate, OrganizationResponse,
    ApprovalRequestCreate, ApprovalDecision, ApprovalRequestResponse,
    AuditLogCreate, AuditLogResponse,
    ServiceAllocationCreate, ServiceAllocationResponse
)

router = APIRouter(tags=["Organizations & Policy Engine"])

# ==================== ORGANIZATIONS & POLICY CONFIG ====================

def _format_org_response(org: Organization) -> dict:
    owner = next((u for u in (org.users or []) if u.role in ("owner", "admin", "director")), None)
    if not owner and org.users:
        owner = org.users[0]

    org_email = org.email or (owner.email if owner else None)
    org_phone = org.phone or (owner.phone if owner else None)
    owner_name = owner.name if owner else org.name
    owner_email = owner.email if owner else org_email
    owner_phone = owner.phone if owner else org_phone

    return {
        "id": org.id,
        "name": org.name,
        "code": org.code,
        "business_type": org.business_type,
        "brand_tagline": org.brand_tagline,
        "logo": org.logo,
        "currency": org.currency,
        "tax_rate": org.tax_rate,
        "gstin_or_tax_id": org.gstin_or_tax_id,
        "cin_or_reg_number": org.cin_or_reg_number,
        "email": org_email,
        "phone": org_phone,
        "website": org.website,
        "address": org.address,
        "city": org.city,
        "state": org.state,
        "country": org.country,
        "is_active": org.is_active,
        "policy_config": org.policy_config,
        "subscription_tier": org.subscription_tier or "Starter",
        "mrr": org.mrr or 0.0,
        "ai_credits_limit": org.ai_credits_limit or 1000,
        "ai_credits_used": org.ai_credits_used or 0,
        "renewal_date": org.renewal_date,
        "owner_name": owner_name,
        "owner_email": owner_email,
        "owner_phone": owner_phone,
        "branches_count": len(org.branches) if org.branches else 0,
        "staff_count": len(org.users) if org.users else 0,
    }

@router.get("/organizations", response_model=List[OrganizationResponse])
def list_organizations(db: Session = Depends(get_db)):
    orgs = db.query(Organization).order_by(Organization.created_at.desc()).all()
    return [_format_org_response(o) for o in orgs]

@router.post("/organizations", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
def create_organization(req: OrganizationCreate, db: Session = Depends(get_db)):
    existing = db.query(Organization).filter(Organization.code == req.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Organization with code '{req.code}' already exists")

    org = Organization(
        name=req.name,
        code=req.code,
        business_type=req.business_type,
        brand_tagline=req.brand_tagline,
        logo=req.logo,
        currency=req.currency or "USD",
        tax_rate=req.tax_rate if req.tax_rate is not None else 0.0,
        gstin_or_tax_id=req.gstin_or_tax_id,
        cin_or_reg_number=req.cin_or_reg_number,
        email=req.email,
        phone=req.phone,
        website=req.website,
        address=req.address,
        city=req.city,
        state=req.state,
        country=req.country,
        policy_config=req.policy_config or {},
        is_active=True
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return _format_org_response(org)

@router.get("/organizations/{org_id}", response_model=OrganizationResponse)
def get_organization(org_id: str, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return _format_org_response(org)

@router.put("/organizations/{org_id}", response_model=OrganizationResponse)
def update_organization(org_id: str, req: OrganizationUpdate, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    update_data = req.dict(exclude_unset=True)
    if "policy_config" in update_data and update_data["policy_config"]:
        merged = {**(org.policy_config or {}), **update_data["policy_config"]}
        update_data["policy_config"] = merged

    for key, value in update_data.items():
        setattr(org, key, value)

    db.commit()
    db.refresh(org)
    return org

@router.delete("/organizations/{org_id}", status_code=status.HTTP_200_OK)
def delete_organization(org_id: str, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    # 1. Delete associated non-admin users (staff, stylists, branch managers, owners)
    db.query(User).filter(User.organization_id == org_id, User.role != "admin").delete(synchronize_session=False)

    # 2. For any platform admins who had this org assigned, clear organization_id
    db.query(User).filter(User.organization_id == org_id, User.role == "admin").update({"organization_id": None}, synchronize_session=False)

    # 3. Delete associated branches
    db.query(Branch).filter(Branch.organization_id == org_id).delete(synchronize_session=False)

    # 4. Delete the organization (cascading deletes approval_requests, audit_logs, service_allocations, categories, services)
    db.delete(org)
    db.commit()

    return {
        "success": True,
        "message": f"Organization '{org.name}' and all associated records deleted successfully."
    }

# ==================== APPROVAL WORKFLOW ENGINE ====================

@router.get("/approvals", response_model=List[ApprovalRequestResponse])
def list_approvals(
    organization_id: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(ApprovalRequest)
    if organization_id:
        query = query.filter(ApprovalRequest.organization_id == organization_id)
    if status_filter:
        query = query.filter(ApprovalRequest.status == status_filter)
    return query.order_by(ApprovalRequest.created_at.desc()).all()

@router.post("/approvals", response_model=ApprovalRequestResponse, status_code=status.HTTP_201_CREATED)
def create_approval_request(req: ApprovalRequestCreate, db: Session = Depends(get_db)):
    # Fallback to first org if not provided
    org_id = req.organization_id
    if not org_id:
        first_org = db.query(Organization).first()
        org_id = first_org.id if first_org else "org_default"

    item = ApprovalRequest(
        organization_id=org_id,
        branch_id=req.branch_id,
        request_type=req.request_type,
        title=req.title,
        description=req.description,
        requested_by=req.requested_by,
        requested_by_id=req.requested_by_id,
        beneficiary_name=req.beneficiary_name,
        beneficiary_id=req.beneficiary_id,
        department=req.department,
        amount=req.amount,
        status="pending",
        metadata_payload=req.metadata_payload or {}
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.post("/approvals/{approval_id}/decision", response_model=ApprovalRequestResponse)
def decide_approval(approval_id: str, decision: ApprovalDecision, db: Session = Depends(get_db)):
    item = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Approval request not found")

    item.status = decision.status
    item.approver_id = decision.approver_id
    item.approver_name = decision.approver_name
    item.approver_notes = decision.approver_notes

    # Add audit log entry
    audit = AuditLog(
        organization_id=item.organization_id,
        user_id=decision.approver_id,
        user_name=decision.approver_name,
        action=f"DECISION_{decision.status.upper()}",
        module="GOVERNANCE",
        entity_id=item.id,
        details={"request_type": item.request_type, "title": item.title, "notes": decision.approver_notes}
    )
    db.add(audit)

    db.commit()
    db.refresh(item)
    return item

# ==================== AUDIT LOGS ====================

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def list_audit_logs(
    organization_id: Optional[str] = None,
    module: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if organization_id:
        query = query.filter(AuditLog.organization_id == organization_id)
    if module:
        query = query.filter(AuditLog.module == module)
    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()

@router.post("/audit-logs", response_model=AuditLogResponse, status_code=status.HTTP_201_CREATED)
def record_audit_log(req: AuditLogCreate, db: Session = Depends(get_db)):
    org_id = req.organization_id
    if not org_id:
        first_org = db.query(Organization).first()
        org_id = first_org.id if first_org else "org_default"

    log_entry = AuditLog(
        organization_id=org_id,
        user_id=req.user_id,
        user_name=req.user_name,
        user_role=req.user_role,
        action=req.action,
        module=req.module,
        entity_id=req.entity_id,
        ip_address=req.ip_address,
        details=req.details or {}
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry

# ==================== SERVICE ALLOCATIONS (GOV / INSTITUTIONAL) ====================

@router.get("/allocations", response_model=List[ServiceAllocationResponse])
def list_service_allocations(
    organization_id: Optional[str] = None,
    beneficiary_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ServiceAllocation)
    if organization_id:
        query = query.filter(ServiceAllocation.organization_id == organization_id)
    if beneficiary_id:
        query = query.filter(ServiceAllocation.beneficiary_id == beneficiary_id)
    return query.order_by(ServiceAllocation.created_at.desc()).all()

@router.post("/allocations", response_model=ServiceAllocationResponse, status_code=status.HTTP_201_CREATED)
def create_service_allocation(req: ServiceAllocationCreate, db: Session = Depends(get_db)):
    org_id = req.organization_id
    if not org_id:
        first_org = db.query(Organization).first()
        org_id = first_org.id if first_org else "org_default"

    alloc = ServiceAllocation(
        organization_id=org_id,
        beneficiary_id=req.beneficiary_id,
        beneficiary_name=req.beneficiary_name,
        department=req.department,
        cost_center=req.cost_center,
        service_id=req.service_id,
        service_name=req.service_name,
        quota_monthly=req.quota_monthly,
        quota_used=0,
        unit_entitlement_value=req.unit_entitlement_value,
        valid_from=req.valid_from,
        valid_to=req.valid_to,
        status="active"
    )
    db.add(alloc)
    db.commit()
    db.refresh(alloc)
    return alloc

@router.post("/allocations/{allocation_id}/consume", response_model=ServiceAllocationResponse)
def consume_allocation(allocation_id: str, db: Session = Depends(get_db)):
    alloc = db.query(ServiceAllocation).filter(ServiceAllocation.id == allocation_id).first()
    if not alloc:
        raise HTTPException(status_code=404, detail="Service allocation not found")
    if alloc.quota_used >= alloc.quota_monthly:
        raise HTTPException(status_code=400, detail="Monthly entitlement quota already exhausted")
    alloc.quota_used += 1
    db.commit()
    db.refresh(alloc)
    return alloc
