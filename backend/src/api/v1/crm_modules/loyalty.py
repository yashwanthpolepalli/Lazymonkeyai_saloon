from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.customer import Customer
from pydantic import BaseModel

router = APIRouter(prefix="/crm_modules/loyalty", tags=["CRM - Loyalty"])

class LoyaltyAdjustRequest(BaseModel):
    customer_id: str
    points: int
    reason: str

@router.get("/balance/{customer_id}")
def get_loyalty_balance(customer_id: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {
        "customer_id": customer.id,
        "customer_name": customer.name,
        "loyalty_points": customer.loyalty_points,
        "monetary_value": customer.loyalty_points # 1 point = 1 INR
    }

@router.post("/adjust")
def adjust_loyalty_points(payload: LoyaltyAdjustRequest, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer.loyalty_points = max(0, (customer.loyalty_points or 0) + payload.points)
    db.commit()
    db.refresh(customer)
    return {
        "customer_id": customer.id,
        "new_loyalty_points": customer.loyalty_points,
        "status": "success"
    }
