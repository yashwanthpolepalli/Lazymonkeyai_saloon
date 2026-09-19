from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class CartItemSchema(BaseModel):
    id: str
    service_id: Optional[str] = None
    product_id: Optional[str] = None
    type: str = "service" # service, product
    name: str
    category: Optional[str] = None
    price: float
    base_price: Optional[float] = None
    final_price: Optional[float] = None
    duration_minutes: Optional[int] = None
    quantity: int = 1
    stylist_id: Optional[str] = None
    stylist_name: Optional[str] = None
    selected_options: Optional[List[Dict[str, Any]]] = []
    selected_add_ons: Optional[List[Dict[str, Any]]] = []

class SplitPaymentSchema(BaseModel):
    method: str # cash, upi, card, wallet, loyalty
    amount: float
    reference: Optional[str] = None

class POSTransactionCreate(BaseModel):
    customer_id: Optional[str] = None
    customer_name: str
    customer_phone: Optional[str] = None
    branch_id: Optional[str] = None
    branch_name: Optional[str] = None
    items: List[Dict[str, Any]]
    subtotal: float
    discount_amount: float = 0.0
    gst_amount: float = 0.0
    tip_amount: float = 0.0
    total_amount: float
    payment_mode: str = "cash" # cash, card, upi, wallet, split
    payments: Optional[List[Dict[str, Any]]] = []
    cashier_name: Optional[str] = None
    notes: Optional[str] = None

class POSTransactionResponse(BaseModel):
    invoice_id: str
    invoice_number: str
    receipt_url: str
    status: str = "success"

class ERPInvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    appointment_id: Optional[str] = None
    customer_id: Optional[str] = None
    customer_name: str
    customer_phone: Optional[str] = None
    branch_id: str
    branch_name: Optional[str] = None
    subtotal: float
    discount_total: float
    tax_total: float
    cgst_amount: float
    sgst_amount: float
    igst_amount: float
    final_total: float
    items: List[Dict[str, Any]]
    payments: List[Dict[str, Any]]
    payment_status: str
    payment_mode: str
    cashier_name: Optional[str] = None
    receipt_url: Optional[str] = None
    created_at: Any

    class Config:
        from_attributes = True

class TaxSummaryResponse(BaseModel):
    total_gst: float
    cgst: float
    sgst: float
    igst: float
    taxable_turnover: float
