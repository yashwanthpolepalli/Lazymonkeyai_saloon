from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.erp import FixedAsset
from pydantic import BaseModel

router = APIRouter(prefix="/erp/fixed_assets", tags=["ERP - Fixed Assets"])

class FixedAssetCreate(BaseModel):
    name: str
    category: str
    branch_id: str
    purchase_date: str
    purchase_cost: float
    salvage_value: float = 0.0
    useful_life_years: int = 5
    depreciation_rate: float = 0.20

@router.get("")
def get_fixed_assets(db: Session = Depends(get_db)):
    return db.query(FixedAsset).all()

@router.post("", status_code=status.HTTP_201_CREATED)
def create_fixed_asset(payload: FixedAssetCreate, db: Session = Depends(get_db)):
    count = db.query(FixedAsset).count() + 1
    asset_code = f"AST-{str(count).zfill(4)}"
    asset = FixedAsset(
        asset_code=asset_code,
        current_value=payload.purchase_cost,
        **payload.model_dump()
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset
