from sqlalchemy import Column, String, Boolean, Float, Integer, JSON, Text
from src.models.base import TimeStampedModel

class SalonSettings(TimeStampedModel):
    __tablename__ = "salon_settings"

    # Owner Profile
    owner_name = Column(String(255), default="Salon Director")
    owner_title = Column(String(255), default="Founder & Creative Director")
    owner_email = Column(String(255), default="director@saloon.com")
    owner_phone = Column(String(50), default="+91 98765 43210")
    owner_avatar = Column(String(500), nullable=True)
    owner_bio = Column(Text, nullable=True)
    owner_role = Column(String(50), default="Owner")

    # Salon Brand Customization
    salon_name = Column(String(255), default="AURA LUXE SALON")
    tagline = Column(String(255), default="Haute Coiffure & Aesthetic Sanctuary")
    logo_url = Column(String(500), nullable=True)
    monogram = Column(String(20), default="AL")
    brand_color = Column(String(50), default="#D4AF37")
    accent_preset = Column(String(50), default="amber")
    currency_symbol = Column(String(10), default="₹")
    tax_rate_pct = Column(Float, default=18.0)
    invoice_header = Column(Text, nullable=True)
    invoice_footer = Column(Text, nullable=True)
    slot_duration = Column(Integer, default=30)
    buffer_time = Column(Integer, default=10)
    sms_booking_confirm = Column(Boolean, default=True)
    sms_reminder_2h = Column(Boolean, default=True)
    whatsapp_receipt = Column(Boolean, default=True)
    online_booking_open = Column(Boolean, default=True)

    # GST & Tax Settings
    is_gst_enabled = Column(Boolean, default=True)
    is_discount_enabled = Column(Boolean, default=True)
    is_sgst_enabled = Column(Boolean, default=True)
    is_cgst_enabled = Column(Boolean, default=True)
    is_igst_enabled = Column(Boolean, default=False)
    gst_rate_pct = Column(Float, default=18.0)
    cgst_rate_pct = Column(Float, default=9.0)
    sgst_rate_pct = Column(Float, default=9.0)
    igst_rate_pct = Column(Float, default=18.0)
    gstin = Column(String(50), nullable=True)
    hsn_sac_code = Column(String(50), default="999721")
    tax_pricing_mode = Column(String(50), default="exclusive") # exclusive, inclusive
    default_discount_presets = Column(JSON, default=lambda: [5, 10, 15, 20])
    max_cashier_discount_pct = Column(Float, default=25.0)
    apply_discount_before_tax = Column(Boolean, default=True)
    membership_discounts = Column(JSON, default=lambda: {"regular": 0, "silver": 10, "gold": 15, "platinum": 20})

    # MFA Settings
    is_mfa_enabled = Column(Boolean, default=False)
    mfa_method = Column(String(50), default="authenticator")
    backup_phone = Column(String(50), nullable=True)
    backup_email = Column(String(255), nullable=True)
    page_protection = Column(JSON, default=lambda: {
        "posPayments": False,
        "payrollStructures": True,
        "inventoryCosting": False,
        "customerExport": True,
        "branchPlatform": True,
        "staffManagement": True,
    })
