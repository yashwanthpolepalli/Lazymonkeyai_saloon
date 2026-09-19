from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.hrms import PayrollSlip, Employee
from src.schemas.hrms import PayrollSlipResponse
from pydantic import BaseModel

router = APIRouter(prefix="/hrms/payroll", tags=["HRMS - Payroll & Payslips"])

class GeneratePayrollRequest(BaseModel):
    month: str # e.g. "2026-09"
    employee_id: Optional[str] = None

@router.get("", response_model=List[PayrollSlipResponse])
def get_payroll_slips(employee_id: Optional[str] = None, month: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(PayrollSlip)
    if employee_id:
        query = query.filter(PayrollSlip.employee_id == employee_id)
    if month:
        query = query.filter(PayrollSlip.month == month)
    return query.order_by(PayrollSlip.created_at.desc()).all()

@router.post("/generate", response_model=List[PayrollSlipResponse])
def generate_monthly_payroll(req: GeneratePayrollRequest, db: Session = Depends(get_db)):
    query = db.query(Employee).filter(Employee.is_active == True)
    if req.employee_id:
        query = query.filter(Employee.id == req.employee_id)
    
    employees = query.all()
    created_slips = []

    for emp in employees:
        existing = db.query(PayrollSlip).filter(
            PayrollSlip.employee_id == emp.id,
            PayrollSlip.month == req.month
        ).first()

        if existing:
            created_slips.append(existing)
            continue

        basic = emp.basic_salary or (emp.salary_base * 0.5)
        hra = emp.hra or (emp.salary_base * 0.25)
        allowances = emp.allowances or (emp.salary_base * 0.25)
        commission = emp.monthly_commission or 0.0
        gross = basic + hra + allowances + commission
        statutory = emp.statutory_ded or (basic * 0.12)
        tax = gross * 0.05
        net = gross - statutory - tax

        slip = PayrollSlip(
            employee_id=emp.id,
            employee_name=emp.name,
            month=req.month,
            basic_salary=basic,
            hra=hra,
            allowances=allowances,
            commission_amount=commission,
            gross_pay=gross,
            statutory_deductions=statutory,
            tax_deducted=tax,
            net_salary=net,
            payment_status="generated"
        )
        db.add(slip)
        created_slips.append(slip)

    db.commit()
    for s in created_slips:
        db.refresh(s)
    return created_slips
