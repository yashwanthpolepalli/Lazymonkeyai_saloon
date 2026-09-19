from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class OwnerProfileSchema(BaseModel):
    name: str
    title: str
    email: str
    phone: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    role: str

class SalonCustomizationSchema(BaseModel):
    salon_name: str
    tagline: str
    logo_url: Optional[str] = None
    monogram: Optional[str] = "AL"
    brand_color: str = "#D4AF37"
    accent_preset: str = "amber"
    currency_symbol: str = "₹"
    tax_rate_pct: float = 18.0
    invoice_header: Optional[str] = None
    invoice_footer: Optional[str] = None
    slot_duration: int = 30
    buffer_time: int = 10
    sms_booking_confirm: bool = True
    sms_reminder_2h: bool = True
    whatsapp_receipt: bool = True
    online_booking_open: bool = True

class GSTDiscountSettingsSchema(BaseModel):
    is_gst_enabled: bool = True
    is_discount_enabled: bool = True
    is_sgst_enabled: bool = True
    is_cgst_enabled: bool = True
    is_igst_enabled: bool = False
    gst_rate_pct: float = 18.0
    cgst_rate_pct: float = 9.0
    sgst_rate_pct: float = 9.0
    igst_rate_pct: float = 18.0
    gstin: Optional[str] = None
    hsn_sac_code: Optional[str] = "999721"
    tax_pricing_mode: str = "exclusive" # exclusive, inclusive
    default_discount_presets: List[int] = [5, 10, 15, 20]
    max_cashier_discount_pct: float = 25.0
    apply_discount_before_tax: bool = True
    membership_discounts: Dict[str, float] = {"regular": 0, "silver": 10, "gold": 15, "platinum": 20}

class MFASettingsSchema(BaseModel):
    is_mfa_enabled: bool = False
    mfa_method: str = "authenticator"
    backup_phone: Optional[str] = None
    backup_email: Optional[str] = None
    page_protection: Dict[str, bool] = {
        "posPayments": False,
        "payrollStructures": True,
        "inventoryCosting": False,
        "customerExport": True,
        "branchPlatform": True,
        "staffManagement": True,
    }
