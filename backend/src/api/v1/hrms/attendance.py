from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.hrms import Employee, AttendanceRecord
from src.schemas.hrms import (
    AttendanceClockRequest, AttendanceClockResponse, AttendanceRecordResponse
)

router = APIRouter(prefix="/hrms/attendance", tags=["HRMS - Attendance & Clocking"])

@router.get("", response_model=List[AttendanceRecordResponse])
def get_attendance_records(date: Optional[str] = None, employee_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(AttendanceRecord)
    if date:
        query = query.filter(AttendanceRecord.date == date)
    if employee_id:
        query = query.filter(AttendanceRecord.employee_id == employee_id)
    return query.order_by(AttendanceRecord.date.desc()).all()

@router.post("/clock", response_model=AttendanceClockResponse)
def clock_attendance(req: AttendanceClockRequest, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == req.staff_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    today_str = datetime.now().strftime("%Y-%m-%d")
    now_time_str = datetime.now().strftime("%I:%M %p")
    timestamp_iso = datetime.now().isoformat()

    record = db.query(AttendanceRecord).filter(
        AttendanceRecord.employee_id == req.staff_id,
        AttendanceRecord.date == today_str
    ).first()

    active_shift_hours = 0.0

    if req.action == "clock_in":
        if not record:
            record = AttendanceRecord(
                employee_id=emp.id,
                employee_name=emp.name,
                date=today_str,
                check_in=now_time_str,
                status="present",
                working_hours=8.0,
                active_shift_hours=0.0
            )
            db.add(record)
            emp.shifts_this_month = (emp.shifts_this_month or 0) + 1
        else:
            record.check_in = now_time_str
            record.status = "present"
        active_shift_hours = 0.5

    elif req.action == "clock_out":
        if record:
            record.check_out = now_time_str
            active_shift_hours = 8.5
            record.active_shift_hours = active_shift_hours

    elif req.action == "tea_break":
        active_shift_hours = 4.0

    db.commit()

    return {
        "status": f"Successfully recorded {req.action.replace('_', ' ')}",
        "timestamp": timestamp_iso,
        "active_shift_hours": active_shift_hours,
        "record_id": record.id if record else None
    }
