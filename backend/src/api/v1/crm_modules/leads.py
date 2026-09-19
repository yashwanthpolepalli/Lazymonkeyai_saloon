from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.marketing import Lead
from src.schemas.marketing import LeadCreate, LeadResponse

router = APIRouter(prefix="/crm/leads", tags=["CRM - Leads"])

@router.get("", response_model=List[LeadResponse])
def get_leads(stage: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Lead)
    if stage:
        query = query.filter(Lead.stage == stage)
    return query.order_by(Lead.created_at.desc()).all()

@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    lead = Lead(
        **payload.model_dump(),
        created_date=datetime.now().strftime("%Y-%m-%d")
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead

@router.put("/{lead_id}/stage")
def update_lead_stage(lead_id: str, stage: str, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.stage = stage
    db.commit()
    return {"status": "success", "lead_id": lead_id, "new_stage": stage}
