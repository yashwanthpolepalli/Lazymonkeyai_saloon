from sqlalchemy import Column, String, Boolean, Float, Integer, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from src.models.base import TimeStampedModel

class Employee(TimeStampedModel):
    __tablename__ = "employees"

    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=False)
    avatar = Column(String(500), nullable=True)
    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    department = Column(String(100), default="Hair Styling") # Hair Styling, Esthetics & Spa, Nail Art, Management, Front Desk
    designation = Column(String(100), default="Senior Stylist")
    tier = Column(String(50), default="senior") # master, senior, executive, director
    join_date = Column(String(50), nullable=False)
    salary_base = Column(Float, default=0.0)
    basic_salary = Column(Float, default=0.0)
    hra = Column(Float, default=0.0)
    allowances = Column(Float, default=0.0)
    statutory_ded = Column(Float, default=0.0)
    net_take_home = Column(Float, default=0.0)
    commission_rate = Column(Float, default=0.15) # percentage
    status = Column(String(50), default="active") # active, on_leave, probation
    code = Column(String(50), nullable=True)
    reporting_manager = Column(String(255), nullable=True)
    employment_type = Column(String(50), default="Full-Time") # Full-Time, Part-Time, Contract
    role = Column(String(50), default="staff")
    skills = Column(JSON, default=list)
    documents_submitted = Column(JSON, default=list)
    performance_rating = Column(Float, default=5.0)
    monthly_commission = Column(Float, default=0.0)
    shifts_this_month = Column(Integer, default=0)
    leave_balance = Column(Integer, default=12)
    is_active = Column(Boolean, default=True)

    branch = relationship("Branch", back_populates="employees")
    attendance_records = relationship("AttendanceRecord", back_populates="employee", cascade="all, delete-orphan")
    leave_requests = relationship("LeaveRequest", back_populates="employee", cascade="all, delete-orphan")
    payroll_slips = relationship("PayrollSlip", back_populates="employee", cascade="all, delete-orphan")

class AttendanceRecord(TimeStampedModel):
    __tablename__ = "attendance_records"

    employee_id = Column(String(36), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    employee_name = Column(String(255), nullable=False)
    date = Column(String(20), nullable=False, index=True) # YYYY-MM-DD
    check_in = Column(String(50), nullable=False)
    check_out = Column(String(50), nullable=True)
    status = Column(String(50), default="present") # present, late, absent, half_day
    working_hours = Column(Float, default=0.0)
    active_shift_hours = Column(Float, default=0.0)

    employee = relationship("Employee", back_populates="attendance_records")

class LeaveRequest(TimeStampedModel):
    __tablename__ = "leave_requests"

    employee_id = Column(String(36), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    employee_name = Column(String(255), nullable=False)
    start_date = Column(String(20), nullable=False)
    end_date = Column(String(20), nullable=False)
    type = Column(String(50), default="casual") # casual, sick, paid, emergency
    reason = Column(Text, nullable=False)
    status = Column(String(50), default="pending") # pending, approved, rejected

    employee = relationship("Employee", back_populates="leave_requests")

class PayrollSlip(TimeStampedModel):
    __tablename__ = "payroll_slips"

    employee_id = Column(String(36), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    employee_name = Column(String(255), nullable=False)
    month = Column(String(20), nullable=False) # e.g. "2026-09"
    basic_salary = Column(Float, default=0.0)
    hra = Column(Float, default=0.0)
    allowances = Column(Float, default=0.0)
    commission_amount = Column(Float, default=0.0)
    gross_pay = Column(Float, default=0.0)
    statutory_deductions = Column(Float, default=0.0)
    tax_deducted = Column(Float, default=0.0)
    net_salary = Column(Float, default=0.0)
    payment_status = Column(String(50), default="generated") # generated, paid, pending
    payment_date = Column(String(50), nullable=True)
    payment_mode = Column(String(50), default="bank_transfer")

    employee = relationship("Employee", back_populates="payroll_slips")
