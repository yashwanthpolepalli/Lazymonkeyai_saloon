from typing import List, Optional, Dict, Any
from pydantic import BaseModel

# Branch Schemas
class BranchBase(BaseModel):
    name: str
    code: str
    branch_type: Optional[str] = "Flagship Studio"
    manager_name: Optional[str] = None
    status: Optional[str] = "active"
    phone: str
    email: str
    whatsapp: Optional[str] = None
    address: str
    city: str
    state: Optional[str] = None
    country: Optional[str] = "India"
    pin_code: Optional[str] = None
    map_location: Optional[str] = None
    currency: Optional[str] = "INR"
    tax_rate: Optional[float] = 0.18
    rating: Optional[float] = 5.0
    total_reviews: Optional[int] = 0
    image: Optional[str] = None
    logo: Optional[str] = None
    description: Optional[str] = None
    chairs_count: Optional[int] = 6
    opening_hours: Optional[str] = "09:00 AM - 09:00 PM"

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    branch_type: Optional[str] = None
    manager_name: Optional[str] = None
    status: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pin_code: Optional[str] = None
    map_location: Optional[str] = None
    currency: Optional[str] = None
    tax_rate: Optional[float] = None
    image: Optional[str] = None
    logo: Optional[str] = None
    description: Optional[str] = None
    chairs_count: Optional[int] = None
    opening_hours: Optional[str] = None

class BranchResponse(BranchBase):
    id: str

    class Config:
        from_attributes = True

# Service Option & Add-on Schemas
class ServiceOption(BaseModel):
    id: str
    label: str
    price_delta: float = 0.0
    duration_delta_minutes: int = 0

class ServiceOptionGroup(BaseModel):
    id: str
    name: str
    required: bool = False
    options: List[ServiceOption] = []

class AddOn(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    price: float
    duration_minutes: int = 15

# Category Schemas
class ServiceCategoryBase(BaseModel):
    name: str
    slug: str
    icon_name: Optional[str] = "Sparkles"
    description: Optional[str] = None
    image: Optional[str] = None
    gender: List[str] = ["women", "men", "unisex"]
    subcategories: List[str] = []

class ServiceCategoryCreate(ServiceCategoryBase):
    pass

class ServiceCategoryResponse(ServiceCategoryBase):
    id: str

    class Config:
        from_attributes = True

# Service Schemas
class ServiceBase(BaseModel):
    category_id: str
    category_name: str
    subcategory: Optional[str] = None
    name: str
    short_desc: Optional[str] = None
    full_desc: Optional[str] = None
    base_price: float
    member_price: Optional[float] = None
    duration_minutes: int = 45
    gender: List[str] = ["unisex"]
    branch_ids: List[str] = []
    image: Optional[str] = None
    featured: Optional[bool] = False
    is_popular: Optional[bool] = False
    variants: Optional[List[Dict[str, Any]]] = []
    branch_pricing: Optional[Dict[str, Any]] = {}
    option_groups: Optional[List[Dict[str, Any]]] = []
    add_ons: Optional[List[Dict[str, Any]]] = []
    required_skills: Optional[List[str]] = []
    consumed_products: Optional[List[Dict[str, Any]]] = []

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    subcategory: Optional[str] = None
    short_desc: Optional[str] = None
    full_desc: Optional[str] = None
    base_price: Optional[float] = None
    member_price: Optional[float] = None
    duration_minutes: Optional[int] = None
    gender: Optional[List[str]] = None
    branch_ids: Optional[List[str]] = None
    image: Optional[str] = None
    featured: Optional[bool] = None
    is_popular: Optional[bool] = None
    variants: Optional[List[Dict[str, Any]]] = None
    branch_pricing: Optional[Dict[str, Any]] = None
    option_groups: Optional[List[Dict[str, Any]]] = None
    add_ons: Optional[List[Dict[str, Any]]] = None
    required_skills: Optional[List[str]] = None
    consumed_products: Optional[List[Dict[str, Any]]] = None

class ServiceResponse(ServiceBase):
    id: str

    class Config:
        from_attributes = True

# Stylist Schemas
class StylistBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    tier: str = "senior"
    tier_multiplier: float = 1.0
    specialties: List[str] = []
    branch_id: str
    rating: float = 5.0
    experience_years: int = 3
    bio: Optional[str] = None
    is_available_today: bool = True
    commission_rate: float = 0.15

class StylistCreate(StylistBase):
    pass

class StylistUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    tier: Optional[str] = None
    tier_multiplier: Optional[float] = None
    specialties: Optional[List[str]] = None
    branch_id: Optional[str] = None
    rating: Optional[float] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    is_available_today: Optional[bool] = None
    commission_rate: Optional[float] = None

class StylistResponse(StylistBase):
    id: str

    class Config:
        from_attributes = True

# Time Slot Config Schemas
class TimeSlotConfigBase(BaseModel):
    time: str
    is_available: bool = True
    blocked_reason: Optional[str] = None
    branch_id: Optional[str] = None
    stylist_id: Optional[str] = None
    allowed_genders: List[str] = ["women", "men", "unisex"]
    allowed_categories: List[str] = []
    slot_type: str = "regular"

class TimeSlotConfigCreate(TimeSlotConfigBase):
    pass

class TimeSlotConfigResponse(TimeSlotConfigBase):
    id: str

    class Config:
        from_attributes = True
