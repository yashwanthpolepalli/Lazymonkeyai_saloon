from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.settings import SalonSettings
from src.schemas.settings import (
    OwnerProfileSchema, SalonCustomizationSchema, GSTDiscountSettingsSchema, MFASettingsSchema
)

router = APIRouter(prefix="/settings", tags=["System Settings & Brand Customization"])

def _get_or_create_settings(db: Session) -> SalonSettings:
    settings = db.query(SalonSettings).first()
    if not settings:
        settings = SalonSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

# --- Owner Profile ---
@router.get("/owner_profile", response_model=OwnerProfileSchema)
def get_owner_profile(db: Session = Depends(get_db)):
    s = _get_or_create_settings(db)
    return {
        "name": s.owner_name,
        "title": s.owner_title,
        "email": s.owner_email,
        "phone": s.owner_phone,
        "avatar_url": s.owner_avatar,
        "bio": s.owner_bio,
        "role": s.owner_role
    }

@router.put("/owner_profile", response_model=OwnerProfileSchema)
def update_owner_profile(payload: OwnerProfileSchema, db: Session = Depends(get_db)):
    s = _get_or_create_settings(db)
    s.owner_name = payload.name
    s.owner_title = payload.title
    s.owner_email = payload.email
    s.owner_phone = payload.phone
    s.owner_avatar = payload.avatar_url
    s.owner_bio = payload.bio
    s.owner_role = payload.role
    db.commit()
    return payload

# --- Salon Brand Customization ---
@router.get("/customization", response_model=SalonCustomizationSchema)
def get_salon_customization(db: Session = Depends(get_db)):
    s = _get_or_create_settings(db)
    return {
        "salon_name": s.salon_name,
        "tagline": s.tagline,
        "logo_url": s.logo_url,
        "monogram": s.monogram,
        "brand_color": s.brand_color,
        "accent_preset": s.accent_preset,
        "currency_symbol": s.currency_symbol,
        "tax_rate_pct": s.tax_rate_pct,
        "invoice_header": s.invoice_header,
        "invoice_footer": s.invoice_footer,
        "slot_duration": s.slot_duration,
        "buffer_time": s.buffer_time,
        "sms_booking_confirm": s.sms_booking_confirm,
        "sms_reminder_2h": s.sms_reminder_2h,
        "whatsapp_receipt": s.whatsapp_receipt,
        "online_booking_open": s.online_booking_open
    }

@router.put("/customization", response_model=SalonCustomizationSchema)
def update_salon_customization(payload: SalonCustomizationSchema, db: Session = Depends(get_db)):
    s = _get_or_create_settings(db)
    for k, v in payload.model_dump().items():
        setattr(s, k, v)
    db.commit()
    return payload

# --- GST & Tax Settings ---
@router.get("/gst", response_model=GSTDiscountSettingsSchema)
def get_gst_settings(db: Session = Depends(get_db)):
    s = _get_or_create_settings(db)
    return {
        "is_gst_enabled": s.is_gst_enabled,
        "is_discount_enabled": s.is_discount_enabled,
        "is_sgst_enabled": s.is_sgst_enabled,
        "is_cgst_enabled": s.is_cgst_enabled,
        "is_igst_enabled": s.is_igst_enabled,
        "gst_rate_pct": s.gst_rate_pct,
        "cgst_rate_pct": s.cgst_rate_pct,
        "sgst_rate_pct": s.sgst_rate_pct,
        "igst_rate_pct": s.igst_rate_pct,
        "gstin": s.gstin,
        "hsn_sac_code": s.hsn_sac_code,
        "tax_pricing_mode": s.tax_pricing_mode,
        "default_discount_presets": s.default_discount_presets,
        "max_cashier_discount_pct": s.max_cashier_discount_pct,
        "apply_discount_before_tax": s.apply_discount_before_tax,
        "membership_discounts": s.membership_discounts
    }

@router.put("/gst", response_model=GSTDiscountSettingsSchema)
def update_gst_settings(payload: GSTDiscountSettingsSchema, db: Session = Depends(get_db)):
    s = _get_or_create_settings(db)
    for k, v in payload.model_dump().items():
        setattr(s, k, v)
    db.commit()
    return payload

# --- MFA & Security Settings ---
@router.get("/mfa", response_model=MFASettingsSchema)
def get_mfa_settings(db: Session = Depends(get_db)):
    s = _get_or_create_settings(db)
    return {
        "is_mfa_enabled": s.is_mfa_enabled,
        "mfa_method": s.mfa_method,
        "backup_phone": s.backup_phone,
        "backup_email": s.backup_email,
        "page_protection": s.page_protection
    }

@router.put("/mfa", response_model=MFASettingsSchema)
def update_mfa_settings(payload: MFASettingsSchema, db: Session = Depends(get_db)):
    s = _get_or_create_settings(db)
    s.is_mfa_enabled = payload.is_mfa_enabled
    s.mfa_method = payload.mfa_method
    s.backup_phone = payload.backup_phone
    s.backup_email = payload.backup_email
    s.page_protection = payload.page_protection
    db.commit()
    return payload
