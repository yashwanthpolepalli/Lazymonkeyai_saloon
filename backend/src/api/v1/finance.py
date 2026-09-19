from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.finance import FinancialExpense
from src.schemas.finance import FinancialExpenseCreate, FinancialExpenseResponse

router = APIRouter(prefix="/finance", tags=["Finance & Expenses"])

@router.get("/expenses", response_model=List[FinancialExpenseResponse])
def get_expenses(branch_id: Optional[str] = None, category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(FinancialExpense)
    if branch_id:
        query = query.filter(FinancialExpense.branch_id == branch_id)
    if category:
        query = query.filter(FinancialExpense.category == category)
    return query.order_by(FinancialExpense.date.desc()).all()

@router.post("/expenses", response_model=FinancialExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(payload: FinancialExpenseCreate, db: Session = Depends(get_db)):
    expense = FinancialExpense(**payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense
