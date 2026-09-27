from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.customer import Customer, FormulaCard
from src.schemas.customer import FormulaCardCreate, FormulaCardResponse

router = APIRouter(prefix="/crm/formula-cards", tags=["CRM - Formula Cards"])

@router.get("", response_model=List[FormulaCardResponse])
def get_formula_cards(
    customer_id: Optional[str] = None,
    service_type: Optional[str] = None,
    branch_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(FormulaCard).filter(FormulaCard.is_active == True)
    if customer_id:
        query = query.filter(FormulaCard.customer_id == customer_id)
    if service_type:
        query = query.filter(FormulaCard.service_type.ilike(f"%{service_type}%"))
    if branch_id:
        query = query.filter(FormulaCard.branch_id == branch_id)
    return query.order_by(FormulaCard.created_at.desc()).all()

@router.post("", response_model=FormulaCardResponse, status_code=status.HTTP_201_CREATED)
def create_formula_card(payload: FormulaCardCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    formula = FormulaCard(
        customer_id=payload.customer_id,
        customer_name=payload.customer_name or customer.name,
        stylist_id=payload.stylist_id,
        stylist_name=payload.stylist_name,
        branch_id=payload.branch_id,
        service_type=payload.service_type,
        date=payload.date or datetime.now().strftime("%Y-%m-%d"),
        formula_details=payload.formula_details,
        processing_time_mins=payload.processing_time_mins,
        patch_test_date=payload.patch_test_date,
        patch_test_result=payload.patch_test_result,
        before_image=payload.before_image,
        after_image=payload.after_image,
        technique_notes=payload.technique_notes,
        client_feedback=payload.client_feedback,
        is_active=True
    )
    db.add(formula)
    db.commit()
    db.refresh(formula)
    return formula

@router.delete("/{formula_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_formula_card(formula_id: str, db: Session = Depends(get_db)):
    formula = db.query(FormulaCard).filter(FormulaCard.id == formula_id).first()
    if not formula:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Formula record not found")
    formula.is_active = False
    db.commit()
    return None
