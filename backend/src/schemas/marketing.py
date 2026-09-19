from typing import List, Optional
from pydantic import BaseModel, EmailStr

class LeadBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    source: str = "Instagram Ad"
    stage: str = "New"
    interested_service: Optional[str] = None
    estimated_value: float = 0.0
    assigned_staff: Optional[str] = None
    created_date: Optional[str] = None
    notes: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class LeadResponse(LeadBase):
    id: str

    class Config:
        from_attributes = True

class CampaignBase(BaseModel):
    title: str
    channel: str = "WhatsApp"
    status: str = "active"
    target_segment: str = "VIP High Spender"
    audience_count: int = 0
    sent_count: int = 0
    opened_rate: float = 0.0
    conversions: int = 0
    revenue_generated: float = 0.0
    discount_code: Optional[str] = None
    start_date: str
    end_date: str
    template_content: Optional[str] = None

class CampaignCreate(CampaignBase):
    pass

class CampaignResponse(CampaignBase):
    id: str

    class Config:
        from_attributes = True

class CouponBase(BaseModel):
    code: str
    discount_percent: Optional[float] = None
    flat_discount: Optional[float] = None
    min_spend: float = 0.0
    max_discount: Optional[float] = None
    valid_until: str
    times_used: int = 0
    max_usage: int = 100
    applicable_branches: List[str] = []

class CouponCreate(CouponBase):
    pass

class CouponResponse(CouponBase):
    id: str

    class Config:
        from_attributes = True
