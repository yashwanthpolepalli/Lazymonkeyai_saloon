from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.customer import Customer

router = APIRouter(prefix="/crm_modules/segments", tags=["CRM - Segments"])

@router.get("/summary")
def get_segments_summary(db: Session = Depends(get_db)):
    customers = db.query(Customer).filter(Customer.is_active == True).all()
    
    segments = {
        "VIP High Spender": 0,
        "Regular Loyalist": 0,
        "Occasional": 0,
        "New Customer": 0,
        "At Risk": 0
    }
    
    for c in customers:
        seg = c.segment or "New Customer"
        if seg in segments:
            segments[seg] += 1
        else:
            segments[seg] = 1

    return {
        "total_customers": len(customers),
        "segments": segments
    }
