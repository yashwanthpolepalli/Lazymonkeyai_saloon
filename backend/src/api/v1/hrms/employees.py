from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.hrms import Employee
from src.schemas.hrms import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from src.utils.number_series import generate_employee_code

router = APIRouter(prefix="/hrms/employees", tags=["HRMS - Staff & Employees"])

@router.get("", response_model=List[EmployeeResponse])
def get_employees(branch_id: Optional[str] = None, department: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Employee).filter(Employee.is_active == True)
    if branch_id:
        query = query.filter(Employee.branch_id == branch_id)
    if department:
        query = query.filter(Employee.department == department)
    return query.all()

@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    existing = db.query(Employee).filter(Employee.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Employee with email '{payload.email}' already exists")
    
    emp_count = db.query(Employee).count() + 1
    data = payload.model_dump()
    data["code"] = payload.code or generate_employee_code("SAL", emp_count)
    
    # Validate branch_id exists in database
    from src.models.salon import Branch
    branch = db.query(Branch).filter(Branch.id == payload.branch_id).first()
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Branch with ID '{payload.branch_id}' does not exist"
        )
    data["branch_id"] = branch.id

    emp = Employee(**data)
    db.add(emp)
    db.commit()
    db.refresh(emp)

    # Automatically provision User login account and dispatch credential email
    try:
        from src.services.credential_service import provision_user_account
        provision_user_account(
            db=db,
            name=payload.name.strip(),
            email=payload.email,
            phone=payload.phone,
            role="branch_manager" if "manager" in (payload.role or "").lower() else "staff",
            organization_id=getattr(payload, "organization_id", None) or branch.organization_id,
            branch_id=branch.id,
            department=payload.department,
        )
    except Exception as err:
        print(f"[HRMS] Warning: Credential provisioning failed for employee: {err}")

    return emp

@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee_by_id(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(employee_id: str, payload: EmployeeUpdate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(emp, key, value)
    
    db.commit()
    db.refresh(emp)
    return emp

from pydantic import BaseModel

class BulkDeleteEmployeesRequest(BaseModel):
    employee_ids: List[str]

@router.post("/bulk-delete")
def bulk_delete_employees(payload: BulkDeleteEmployeesRequest, db: Session = Depends(get_db)):
    if not payload.employee_ids:
        return {"success": True, "deleted_count": 0, "deleted_ids": []}

    from src.models.erp import User
    deleted_ids = []
    for emp_id in payload.employee_ids:
        emp = db.query(Employee).filter(Employee.id == emp_id).first()
        if not emp:
            continue

        if emp.email:
            user = db.query(User).filter(User.email == emp.email, User.role != "super_admin").first()
            if user:
                try:
                    db.delete(user)
                except Exception:
                    user.is_active = False

        try:
            db.delete(emp)
            db.commit()
            deleted_ids.append(emp_id)
        except Exception:
            db.rollback()
            emp = db.query(Employee).filter(Employee.id == emp_id).first()
            if emp:
                emp.is_active = False
                db.commit()
                deleted_ids.append(emp_id)

    return {"success": True, "deleted_count": len(deleted_ids), "deleted_ids": deleted_ids}

@router.delete("/{employee_id}")
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    if emp.email:
        from src.models.erp import User
        user = db.query(User).filter(User.email == emp.email, User.role != "super_admin").first()
        if user:
            try:
                db.delete(user)
            except Exception:
                user.is_active = False

    try:
        db.delete(emp)
        db.commit()
    except Exception:
        db.rollback()
        emp = db.query(Employee).filter(Employee.id == employee_id).first()
        if emp:
            emp.is_active = False
            db.commit()

    return {"success": True, "message": "Employee deleted successfully", "id": employee_id}
