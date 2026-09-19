from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr

class BeautyProfileSchema(BaseModel):
    hair_type: Optional[str] = None
    hair_texture: Optional[str] = None
    scalp_condition: Optional[str] = None
    skin_type: Optional[str] = None
    skin_concerns: List[str] = []
    allergies: List[str] = []
    preferred_beverage: Optional[str] = None
    preferred_music: Optional[str] = None
    last_consultation_date: Optional[str] = None
    ai_skin_score: Optional[float] = None

class CustomerMembershipSchema(BaseModel):
    tier_id: str
    tier_name: str
    active: bool = True
    expires_at: str
    remaining_blowouts: int = 0
    total_saved: float = 0.0

class CustomerPackageSchema(BaseModel):
    id: str
    name: str
    total_credits: int
    remaining_credits: int
    service_category: str
    expires_at: str

class CustomerBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    avatar: Optional[str] = None
    gender: str = "female" # female, male, other
    preferred_branch_id: Optional[str] = None
    preferred_stylist_id: Optional[str] = None
    wallet_balance: float = 0.0
    loyalty_points: int = 0
    membership: Optional[Dict[str, Any]] = None
    membership_tier: Optional[str] = "Standard"
    packages: Optional[List[Dict[str, Any]]] = []
    beauty_profile: Optional[Dict[str, Any]] = None
    hair_profile: Optional[Dict[str, Any]] = None
    total_spent: float = 0.0
    visits_count: int = 0
    segment: str = "New Customer"
    tags: List[str] = []
    allergies: List[str] = []
    notes: Optional[str] = None

class CustomerCreate(BaseModel):
    name: str
    phone: str
    gender: Optional[str] = "unspecified"
    email: Optional[str] = None
    tier: Optional[str] = None
    preferred_branch_id: Optional[str] = None
    notes: Optional[str] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    gender: Optional[str] = None
    preferred_branch_id: Optional[str] = None
    preferred_stylist_id: Optional[str] = None
    wallet_balance: Optional[float] = None
    loyalty_points: Optional[int] = None
    membership: Optional[Dict[str, Any]] = None
    membership_tier: Optional[str] = None
    packages: Optional[List[Dict[str, Any]]] = None
    beauty_profile: Optional[Dict[str, Any]] = None
    hair_profile: Optional[Dict[str, Any]] = None
    total_spent: Optional[float] = None
    visits_count: Optional[int] = None
    segment: Optional[str] = None
    tags: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    notes: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: str

    class Config:
        from_attributes = True

class WalletTopUpRequest(BaseModel):
    customer_id: str
    amount: float
    bonus: float = 0.0
    payment_method: str = "card"

class WalletBalanceResponse(BaseModel):
    balance: float
    currency: str = "INR"
    history: List[Dict[str, Any]] = []

class MembershipTierBase(BaseModel):
    name: str
    price: float
    validity_days: int = 365
    discount_percentage: float = 15.0
    color: str = "#D4AF37"
    bg_gradient: str = "from-amber-500 to-yellow-600"
    benefits: List[str] = []
    eligible_categories: List[str] = []
    eligible_branches: List[str] = []
    free_monthly_blowouts: int = 0
    priority_booking: bool = True

class MembershipTierCreate(MembershipTierBase):
    pass

class MembershipTierResponse(MembershipTierBase):
    id: str

    class Config:
        from_attributes = True
