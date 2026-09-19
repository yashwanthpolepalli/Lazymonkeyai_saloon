from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class BookingSelectedOptionSchema(BaseModel):
    group_id: str
    group_name: str
    option_id: str
    option_label: str
    price_delta: float

class AddOnSchema(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    price: float
    duration_minutes: int

class AppointmentBase(BaseModel):
    customer_id: str
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    branch_id: str
    branch_name: str
    service_id: str
    service_name: str
    category_name: str
    stylist_id: str
    stylist_name: str
    stylist_tier: str = "senior"
    date: str # YYYY-MM-DD
    time_slot: str # HH:MM e.g. "14:30"
    duration_minutes: int = 60
    selected_options: List[Dict[str, Any]] = []
    selected_add_ons: List[Dict[str, Any]] = []
    status: str = "confirmed"

    # Pricing breakdown
    base_price: float = 0.0
    options_price: float = 0.0
    add_ons_price: float = 0.0
    stylist_tier_markup: float = 0.0
    subtotal: float = 0.0
    membership_discount: float = 0.0
    package_credit_used: bool = False
    wallet_used: float = 0.0
    loyalty_discount: float = 0.0
    coupon_discount: float = 0.0
    coupon_code: Optional[str] = None
    tax_amount: float = 0.0
    final_total: float = 0.0

    payment_status: str = "unpaid"
    payment_method: Optional[str] = None
    chair_number: Optional[int] = None
    service_notes: Optional[str] = None
    before_photo: Optional[str] = None
    after_photo: Optional[str] = None
    products_used: Optional[List[Dict[str, Any]]] = []
    client_feedback_rating: Optional[float] = None
    client_feedback_review: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    date: Optional[str] = None
    time_slot: Optional[str] = None
    stylist_id: Optional[str] = None
    stylist_name: Optional[str] = None
    payment_status: Optional[str] = None
    payment_method: Optional[str] = None
    chair_number: Optional[int] = None
    service_notes: Optional[str] = None
    before_photo: Optional[str] = None
    after_photo: Optional[str] = None
    products_used: Optional[List[Dict[str, Any]]] = None
    client_feedback_rating: Optional[float] = None
    client_feedback_review: Optional[str] = None

class AppointmentResponse(AppointmentBase):
    id: str
    booking_ref: str
    created_at: Any

    class Config:
        from_attributes = True

class RescheduleRequest(BaseModel):
    new_date: str
    new_time_slot: str
    new_stylist_id: Optional[str] = None
