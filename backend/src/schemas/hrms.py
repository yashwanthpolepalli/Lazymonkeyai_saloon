from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr

class EmployeeBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    avatar: Optional[str] = None
    branch_id: str
    department: str = "Hair Styling"
    designation: str = "Senior Stylist"
    tier: str = "senior"
    join_date: str
    salary_base: float = 0.0
    basic_salary: Optional[float] = 0.0
    hra: Optional[float] = 0.0
    allowances: Optional[float] = 0.0
    statutory_ded: Optional[float] = 0.0
    net_take_home: Optional[float] = 0.0
    commission_rate: float = 0.15
    status: str = "active"
    code: Optional[str] = None
    reporting_manager: Optional[str] = None
    employment_type: str = "Full-Time"
    role: str = "staff"
    skills: List[str] = []
    documents_submitted: List[str] = []
    performance_rating: float = 5.0
    monthly_commission: float = 0.0
    shifts_this_month: int = 0
    leave_balance: int = 12

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    branch_id: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    tier: Optional[str] = None
    salary_base: Optional[float] = None
    basic_salary: Optional[float] = None
    hra: Optional[float] = None
    allowances: Optional[float] = None
    statutory_ded: Optional[float] = None
    net_take_home: Optional[float] = None
    commission_rate: Optional[float] = None
    status: Optional[str] = None
    code: Optional[str] = None
    reporting_manager: Optional[str] = None
    employment_type: Optional[str] = None
    skills: Optional[List[str]] = None
    performance_rating: Optional[float] = None
    monthly_commission: Optional[float] = None
    leave_balance: Optional[int] = None

class EmployeeResponse(EmployeeBase):
    id: str

    class Config:
        from_attributes = True

class AttendanceClockRequest(BaseModel):
    staff_id: str
    action: str # clock_in, clock_out, tea_break
    notes: Optional[str] = None

class AttendanceClockResponse(BaseModel):
    status: str
    timestamp: str
    active_shift_hours: float
    record_id: Optional[str] = None

class AttendanceRecordResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: str
    date: str
    check_in: str
    check_out: Optional[str] = None
    status: str
    working_hours: float

    class Config:
        from_attributes = True

class LeaveRequestCreate(BaseModel):
    employee_id: str
    employee_name: str
    start_date: str
    end_date: str
    type: str = "casual"
    reason: str

class LeaveRequestResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: str
    start_date: str
    end_date: str
    type: str
    reason: str
    status: str

    class Config:
        from_attributes = True

class PayrollSlipResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: str
    month: str
    basic_salary: float
    hra: float
    allowances: float
    commission_amount: float
    gross_pay: float
    statutory_deductions: float
    tax_deducted: float
    net_salary: float
    payment_status: str

    class Config:
        from_attributes = True
