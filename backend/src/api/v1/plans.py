from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import re

from src.core.database import get_db
from src.models.organization import SubscriptionPlan
from src.schemas.organization import (
    SubscriptionPlanCreate,
    SubscriptionPlanUpdate,
    SubscriptionPlanResponse,
)

router = APIRouter(prefix="/plans", tags=["Subscription & SaaS Plans"])


@router.get("", response_model=List[SubscriptionPlanResponse])
def list_plans(db: Session = Depends(get_db)):
    """List all subscription plans directly from DB."""
    return db.query(SubscriptionPlan).order_by(SubscriptionPlan.price_monthly.asc()).all()


@router.post("", response_model=SubscriptionPlanResponse, status_code=status.HTTP_201_CREATED)
def create_plan(req: SubscriptionPlanCreate, db: Session = Depends(get_db)):
    """Super Admin creates a new subscription tier directly stored in DB."""
    plan_code = req.code.strip() if req.code and req.code.strip() else re.sub(r"[^a-zA-Z0-9_]", "_", req.name.lower().strip())
    existing = db.query(SubscriptionPlan).filter(SubscriptionPlan.code == plan_code).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Subscription plan with code '{plan_code}' already exists",
        )

    plan = SubscriptionPlan(
        name=req.name.strip(),
        code=plan_code,
        description=req.description.strip() if req.description else None,
        price_monthly=float(req.price_monthly or 0.0),
        price_yearly=float(req.price_yearly or 0.0),
        currency=req.currency or "INR",
        branches_limit=int(req.branches_limit if req.branches_limit is not None else 1),
        staff_limit=int(req.staff_limit if req.staff_limit is not None else 1),
        ai_credits_limit=int(req.ai_credits_limit if req.ai_credits_limit is not None else 0),
        features=req.features or [],
        is_popular=bool(req.is_popular),
        is_active=bool(req.is_active if req.is_active is not None else True),
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
