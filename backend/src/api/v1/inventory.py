from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.inventory import InventoryProduct, StockMovement
from src.schemas.inventory import (
    InventoryProductCreate, InventoryProductUpdate, InventoryProductResponse,
    StockAdjustmentRequest, StockMovementResponse
)

router = APIRouter(prefix="/inventory", tags=["Inventory & Stock"])

@router.get("/master_catalog", response_model=List[InventoryProductResponse])
@router.get("/products", response_model=List[InventoryProductResponse])
def get_inventory_items(
    low_stock: bool = Query(False),
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(InventoryProduct).filter(InventoryProduct.is_active == True)
    if category:
        query = query.filter(InventoryProduct.category == category)
    
    products = query.all()
    if low_stock:
        products = [p for p in products if (p.current_stock or 0) <= (p.reorder_threshold or 10)]
    return products

@router.post("/products", response_model=InventoryProductResponse, status_code=status.HTTP_201_CREATED)
def create_inventory_item(payload: InventoryProductCreate, db: Session = Depends(get_db)):
    existing = db.query(InventoryProduct).filter(InventoryProduct.sku == payload.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Product SKU '{payload.sku}' already exists")
    
    prod = InventoryProduct(**payload.model_dump())
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return prod

@router.put("/products/{product_id}", response_model=InventoryProductResponse)
def update_inventory_item(product_id: str, payload: InventoryProductUpdate, db: Session = Depends(get_db)):
    prod = db.query(InventoryProduct).filter(InventoryProduct.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(prod, key, value)
    
    db.commit()
    db.refresh(prod)
    return prod

@router.post("/stock_adjustment")
def adjust_stock(req: StockAdjustmentRequest, db: Session = Depends(get_db)):
    prod = db.query(InventoryProduct).filter(InventoryProduct.id == req.item_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Inventory product not found")
    
    prod.current_stock = max(0, int((prod.current_stock or 0) + req.adjustment_qty))
    prod.last_restocked = datetime.now().strftime("%Y-%m-%d")

    movement = StockMovement(
        product_id=prod.id,
        product_name=prod.name,
        type="adjustment" if req.adjustment_qty >= 0 else "wastage",
        branch_id=req.branch_id or "br_default",
        quantity=req.adjustment_qty,
        unit=prod.unit,
        date=datetime.now().strftime("%Y-%m-%d"),
        performed_by=req.performed_by or "Inventory Manager",
        reason=req.reason
    )
    db.add(movement)
    db.commit()
    db.refresh(prod)

    return {
        "newStock": prod.current_stock,
        "productId": prod.id,
        "success": True
    }

@router.get("/movements", response_model=List[StockMovementResponse])
def get_stock_movements(product_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(StockMovement)
    if product_id:
        query = query.filter(StockMovement.product_id == product_id)
    return query.order_by(StockMovement.created_at.desc()).limit(100).all()
