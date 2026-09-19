from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.hrms import LeaveRequest, Employee
from src.schemas.hrms import LeaveRequestCreate, LeaveRequestResponse

router = APIRouter(prefix="/hrms/leaves", tags=["HRMS - Leaves & Time Off"])

@router.get("", response_model=List[LeaveRequestResponse])
def get_leave_requests(status: Optional[str] = None, employee_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(LeaveRequest)
    if status:
        query = query.filter(LeaveRequest.status == status)
    if employee_id:
        query = query.filter(LeaveRequest.employee_id == employee_id)
    return query.all()

@router.post("", response_model=LeaveRequestResponse, status_code=status.HTTP_201_CREATED)
def apply_leave(payload: LeaveRequestCreate, db: Session = Depends(get_db)):
    leave = LeaveRequest(**payload.model_dump(), status="pending")
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave

@router.put("/{leave_id}/status")
def update_leave_status(leave_id: str, new_status: str, db: Session = Depends(get_db)):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    leave.status = new_status
    if new_status == "approved":
        emp = db.query(Employee).filter(Employee.id == leave.employee_id).first()
        if emp and emp.leave_balance and emp.leave_balance > 0:
            emp.leave_balance -= 1
    
    db.commit()
    return {"status": "success", "leave_id": leave_id, "new_status": new_status}
