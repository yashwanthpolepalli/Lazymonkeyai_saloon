from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.pos import FreeQuantityRule
from pydantic import BaseModel

router = APIRouter(prefix="/pos/free_qty_rules", tags=["POS - BOGO & Free Rules"])

class FreeQtyRuleCreate(BaseModel):
    name: str
    buy_product_id: str
    buy_qty: int = 1
    get_product_id: str
    get_qty: int = 1
    discount_pct: float = 100.0

@router.get("")
def get_free_qty_rules(db: Session = Depends(get_db)):
    return db.query(FreeQuantityRule).filter(FreeQuantityRule.is_active == True).all()

@router.post("", status_code=status.HTTP_201_CREATED)
def create_free_qty_rule(req: FreeQtyRuleCreate, db: Session = Depends(get_db)):
    rule = FreeQuantityRule(**req.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule
