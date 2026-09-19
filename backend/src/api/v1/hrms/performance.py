from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.hrms import Employee

router = APIRouter(prefix="/hrms/performance", tags=["HRMS - Performance & Matrix"])

@router.get("/matrix")
def get_performance_matrix(db: Session = Depends(get_db)):
    employees = db.query(Employee).filter(Employee.is_active == True).all()
    matrix = []
    for emp in employees:
        matrix.append({
            "employee_id": emp.id,
            "name": emp.name,
            "designation": emp.designation,
            "rating": emp.performance_rating,
            "shifts": emp.shifts_this_month,
            "commission": emp.monthly_commission,
            "tier": emp.tier
        })
    return matrix
