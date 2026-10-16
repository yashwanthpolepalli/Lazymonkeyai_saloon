from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import re

from src.core.database import get_db
from src.models.organization import SubscriptionPlan
from src.schemas.organization import (
    SubscriptionPlanCreate,
    SubscriptionPlanUpdate,
    SubscriptionPlanResponse,
)

router = APIRouter(prefix="/plans", tags=["Subscription & SaaS Plans"])

# DEFAULT_SEED_PLANS = [
#     {
#         "name": "Starter",
#         "code": "starter",
#         "description": "Essential single-branch salon management with core POS & booking.",
#         "price_monthly": 4999.0,
#         "price_yearly": 49990.0,
#         "currency": "INR",
#         "branches_limit": 1,
#         "staff_limit": 5,
#         "ai_credits_limit":  ,
#         "features": [
#             "1 Branch License",
#             "5 Staff Accounts",
#             "5k AI Credits for Hairstyle & POS",
#             "WhatsApp & SMS Gateway",
#         ],
#         "is_popular": False,
#         "is_active": True,
#         "color": "border-slate-200 bg-white",
#     },
#     {
#         "name": "Professional",
#         "code": "professional",
#         "description": "Growing salon chains with multi-branch analytics and staff payroll.",
#         "price_monthly": 14999.0,
#         "price_yearly": 149990.0,
#         "currency": "INR",
#         "branches_limit": 2,
#         "staff_limit": 15,
#         "ai_credits_limit": 20000,
#         "features": [
#             "2 Branches License",
#             "15 Staff Accounts",
#             "20k AI Credits for Hairstyle & POS",
#             "Advanced Analytics & Payroll",
#         ],
#         "is_popular": False,
#         "is_active": True,
#         "color": "border-sky-200 bg-sky-50/30",
#     },
#     {
#         "name": "Business",
#         "code": "business",
#         "description": "Established salon brands with complete ERP, marketing and high AI capacity.",
#         "price_monthly": 29999.0,
#         "price_yearly": 299990.0,
#         "currency": "INR",
#         "branches_limit": 5,
#         "staff_limit": 50,
#         "ai_credits_limit":  0,
#         "features": [
#             "5 Branches License",
#             "50 Staff Accounts",
#             "50k AI Credits for Hairstyle & POS",
#             "Full Marketing & Loyalty Suite",
#         ],
#         "is_popular": True,
#         "is_active": True,
#         "color": "border-purple-300 bg-purple-50/40",
#     },
#     {
#         "name": "Enterprise",
#         "code": "enterprise",
#         "description": "Large multi-city franchise networks requiring custom policies and dedicated SLAs.",
#         "price_monthly": 79999.0,
#         "price_yearly": 799990.0,
#         "currency": "INR",
#         "branches_limit": 999,
#         "staff_limit": 999,
#         "ai_credits_limit": 200000,
#         "features": [
#             "Unlimited Branch Licenses",
#             "Unlimited Staff Accounts",
#             "200k AI Credits & Gemini LLM Core",
#             "Dedicated Account Manager & Custom SLA",
#         ],
#         "is_popular": False,
#         "is_active": True,
#         "color": "border-amber-300 bg-amber-50/40",
#     },
# ]


def _seed_plans_if_empty(db: Session):
    count = db.query(SubscriptionPlan).count()
    if count == 0:
        for plan_data in DEFAULT_SEED_PLANS:
            plan = SubscriptionPlan(**plan_data)
            db.add(plan)
        db.commit()


@router.get("", response_model=List[SubscriptionPlanResponse])
def list_plans(db: Session = Depends(get_db)):
    """List all subscription plans from DB."""
    _seed_plans_if_empty(db)
    return db.query(SubscriptionPlan).order_by(SubscriptionPlan.price_monthly.asc()).all()


@router.post("", response_model=SubscriptionPlanResponse, status_code=status.HTTP_201_CREATED)
def create_plan(req: SubscriptionPlanCreate, db: Session = Depends(get_db)):
    """Super Admin creates a new subscription tier stored in DB."""
    plan_code = req.code or re.sub(r"[^a-zA-Z0-9_]", "_", req.name.lower().strip())
    existing = db.query(SubscriptionPlan).filter(SubscriptionPlan.code == plan_code).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Subscription plan with code '{plan_code}' already exists",
        )

    plan = SubscriptionPlan(
        name=req.name.strip(),
        code=plan_code,
        description=req.description,
        price_monthly=req.price_monthly,
        price_yearly=req.price_yearly or (req.price_monthly * 10),
        currency=req.currency or "INR",
        branches_limit=req.branches_limit if req.branches_limit is not None else 1,
        staff_limit=req.staff_limit if req.staff_limit is not None else 5,
        ai_credits_limit=req.ai_credits_limit if req.ai_credits_limit is not None else 1000,
        features=req.features or [],
        is_popular=req.is_popular or False,
        is_active=req.is_active if req.is_active is not None else True,
        color=req.color or "border-slate-200 bg-white",
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


@router.get("/{plan_id}", response_model=SubscriptionPlanResponse)
def get_plan(plan_id: str, db: Session = Depends(get_db)):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")
    return plan


@router.put("/{plan_id}", response_model=SubscriptionPlanResponse)
def update_plan(plan_id: str, req: SubscriptionPlanUpdate, db: Session = Depends(get_db)):
    """Super Admin updates an existing subscription tier in DB."""
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")

    update_data = req.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(plan, key, value)

    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/{plan_id}")
def delete_plan(plan_id: str, db: Session = Depends(get_db)):
    """Super Admin deletes a subscription tier from DB."""
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")

    db.delete(plan)
    db.commit()
    return {"success": True, "message": f"Plan '{plan.name}' deleted successfully"}
