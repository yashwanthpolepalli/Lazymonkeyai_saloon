from sqlalchemy import Column, String, Boolean, Float, Integer, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from src.models.base import TimeStampedModel

class InventoryProduct(TimeStampedModel):
    __tablename__ = "inventory_products"

    sku = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    brand = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False) # Hair Care, Skin Care, Colorants, Nail Polish, Styling Tools, Spa Oils
    unit = Column(String(50), default="units") # ml, grams, bottles, tubes, units
    cost_price = Column(Float, default=0.0)
    retail_price = Column(Float, default=0.0)
    current_stock = Column(Integer, default=0)
    reorder_threshold = Column(Integer, default=10)
    stocks_by_branch = Column(JSON, default=dict) # branchId -> {current, minThreshold, optimal}
    image = Column(String(500), nullable=True)
    supplier = Column(String(255), nullable=True)
    last_restocked = Column(String(50), nullable=True)
    is_retail = Column(Boolean, default=True) # Available for POS sale
    is_active = Column(Boolean, default=True)

    stock_movements = relationship("StockMovement", back_populates="product", cascade="all, delete-orphan")

class StockMovement(TimeStampedModel):
    __tablename__ = "stock_movements"

    product_id = Column(String(36), ForeignKey("inventory_products.id", ondelete="CASCADE"), nullable=False)
    product_name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False) # consumption, purchase, transfer, wastage, pos_sale, adjustment
    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), default="units")
    reference = Column(String(100), nullable=True)
    date = Column(String(50), nullable=False)
    performed_by = Column(String(255), nullable=True)
    reason = Column(Text, nullable=True)

    product = relationship("InventoryProduct", back_populates="stock_movements")
