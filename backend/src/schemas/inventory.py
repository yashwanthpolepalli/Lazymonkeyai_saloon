from typing import Optional, Dict, Any
from pydantic import BaseModel

class InventoryProductBase(BaseModel):
    sku: str
    name: str
    brand: str
    category: str
    unit: str = "units"
    cost_price: float = 0.0
    retail_price: float = 0.0
    current_stock: int = 0
    reorder_threshold: int = 10
    stocks_by_branch: Optional[Dict[str, Any]] = {}
    image: Optional[str] = None
    supplier: Optional[str] = None
    last_restocked: Optional[str] = None
    is_retail: bool = True
    is_active: bool = True

class InventoryProductCreate(InventoryProductBase):
    pass

class InventoryProductUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    cost_price: Optional[float] = None
    retail_price: Optional[float] = None
    current_stock: Optional[int] = None
    reorder_threshold: Optional[int] = None
    stocks_by_branch: Optional[Dict[str, Any]] = None
    image: Optional[str] = None
    supplier: Optional[str] = None
    last_restocked: Optional[str] = None
    is_retail: Optional[bool] = None
    is_active: Optional[bool] = None

class InventoryProductResponse(InventoryProductBase):
    id: str

    class Config:
        from_attributes = True

class StockAdjustmentRequest(BaseModel):
    item_id: str
    adjustment_qty: float
    reason: str
    branch_id: Optional[str] = None
    performed_by: Optional[str] = None

class StockMovementResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    type: str
    branch_id: str
    quantity: float
    unit: str
    reference: Optional[str] = None
    date: str
    performed_by: Optional[str] = None
    reason: Optional[str] = None

    class Config:
        from_attributes = True
