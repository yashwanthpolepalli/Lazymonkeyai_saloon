from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.inventory import InventoryProduct
from src.models.salon import Service

router = APIRouter(prefix="/pos/products", tags=["POS - Products & Quick-Select"])

@router.get("")
def get_pos_products_and_services(category: Optional[str] = None, db: Session = Depends(get_db)):
    """Returns combined active retail products and services available for the POS terminal."""
    # 1. Retail Products
    prod_query = db.query(InventoryProduct).filter(
        InventoryProduct.is_active == True,
        InventoryProduct.is_retail == True
    )
    if category:
        prod_query = prod_query.filter(InventoryProduct.category.ilike(f"%{category}%"))
    products = prod_query.all()

    # 2. Services
    srv_query = db.query(Service).filter(Service.is_active == True)
    if category:
        srv_query = srv_query.filter(Service.category_name.ilike(f"%{category}%"))
    services = srv_query.all()

    combined = []
    for p in products:
        combined.append({
            "id": p.id,
            "type": "product",
            "name": p.name,
            "brand": p.brand,
            "category": p.category,
            "price": p.retail_price,
            "current_stock": p.current_stock,
            "image": p.image,
            "sku": p.sku
        })

    for s in services:
        combined.append({
            "id": s.id,
            "type": "service",
            "name": s.name,
            "category": s.category_name,
            "price": s.base_price,
            "member_price": s.member_price,
            "duration_minutes": s.duration_minutes,
            "image": s.image,
            "option_groups": s.option_groups,
            "add_ons": s.add_ons
        })

    return combined
