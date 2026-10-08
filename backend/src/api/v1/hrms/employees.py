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
    
    # Ensure branch_id is valid in branches table
    from src.models.salon import Branch
    target_branch = db.query(Branch).filter(Branch.id == payload.branch_id).first()
    if not target_branch:
        first_branch = db.query(Branch).first()
        if first_branch:
            data["branch_id"] = first_branch.id
        else:
            default_branch = Branch(
                id=payload.branch_id or "branch_01",
                name="Main Flagship Studio",
                code="BR-001",
                city="Bangalore",
                state="Karnataka",
                country="India",
                currency="INR",
                address="100 Feet Road, Indiranagar",
                phone="+919800000000",
                whatsapp="+919800000000",
                email="flagship@saloon.com",
                is_active=True
            )
            db.add(default_branch)
            db.commit()
            data["branch_id"] = default_branch.id

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
            organization_id=payload.branch_id if hasattr(payload, "organization_id") else None,
            branch_id=payload.branch_id,
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

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    emp.is_active = False
    db.commit()
    return None
