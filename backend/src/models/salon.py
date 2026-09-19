from sqlalchemy import Column, String, Boolean, Float, Integer, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from src.models.base import TimeStampedModel

class Branch(TimeStampedModel):
    __tablename__ = "branches"

    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    branch_type = Column(String(100), default="Flagship Studio") # Flagship Studio, Express Bar, Luxury Suite, Franchise Partner, Resort Spa
    manager_name = Column(String(255), nullable=True)
    status = Column(String(50), default="active") # active, maintenance, opening_soon, under_renovation
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    whatsapp = Column(String(50), nullable=True)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India", nullable=False)
    pin_code = Column(String(20), nullable=True)
    map_location = Column(String(500), nullable=True)
    currency = Column(String(10), default="INR", nullable=False)
    tax_rate = Column(Float, default=0.18)
    rating = Column(Float, default=5.0)
    total_reviews = Column(Integer, default=0)
    image = Column(String(500), nullable=True)
    logo = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    chairs_count = Column(Integer, default=6)
    opening_hours = Column(String(255), default="09:00 AM - 09:00 PM")
    is_active = Column(Boolean, default=True)

    company_id = Column(String(36), ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    company = relationship("Company", back_populates="branches")
    
    invoices = relationship("ERPInvoice", back_populates="branch", cascade="all, delete-orphan")
    stylists = relationship("Stylist", back_populates="branch", cascade="all, delete-orphan")
    employees = relationship("Employee", back_populates="branch", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="branch", cascade="all, delete-orphan")

class ServiceCategory(TimeStampedModel):
    __tablename__ = "service_categories"

    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    icon_name = Column(String(100), default="Sparkles")
    description = Column(Text, nullable=True)
    image = Column(String(500), nullable=True)
    gender = Column(JSON, default=lambda: ["women", "men", "unisex"]) # list of GenderType
    subcategories = Column(JSON, default=list) # list of string subcategories
    is_active = Column(Boolean, default=True)

    services = relationship("Service", back_populates="category", cascade="all, delete-orphan")

class Service(TimeStampedModel):
    __tablename__ = "services"

    category_id = Column(String(36), ForeignKey("service_categories.id", ondelete="CASCADE"), nullable=False)
    category_name = Column(String(255), nullable=False)
    subcategory = Column(String(255), nullable=True)
    name = Column(String(255), nullable=False, index=True)
    short_desc = Column(Text, nullable=True)
    full_desc = Column(Text, nullable=True)
    base_price = Column(Float, nullable=False)
    member_price = Column(Float, nullable=True)
    duration_minutes = Column(Integer, default=45)
    gender = Column(JSON, default=lambda: ["unisex"])
    branch_ids = Column(JSON, default=list) # branch ids where offered
    image = Column(String(500), nullable=True)
    featured = Column(Boolean, default=False)
    is_popular = Column(Boolean, default=False)
    variants = Column(JSON, default=list) # list of ServiceVariant
    branch_pricing = Column(JSON, default=dict) # branchId -> BranchPricingConfig
    option_groups = Column(JSON, default=list) # list of ServiceOptionGroup
    add_ons = Column(JSON, default=list) # list of AddOn
    required_skills = Column(JSON, default=list)
    consumed_products = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)

    category = relationship("ServiceCategory", back_populates="services")

class Stylist(TimeStampedModel):
    __tablename__ = "stylists"

    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    avatar = Column(String(500), nullable=True)
    tier = Column(String(50), default="senior") # master, senior, executive, director
    tier_multiplier = Column(Float, default=1.0)
    specialties = Column(JSON, default=list)
    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Float, default=5.0)
    experience_years = Column(Integer, default=3)
    bio = Column(Text, nullable=True)
    is_available_today = Column(Boolean, default=True)
    commission_rate = Column(Float, default=0.15)
    is_active = Column(Boolean, default=True)

    branch = relationship("Branch", back_populates="stylists")
    appointments = relationship("Appointment", back_populates="stylist")

class TimeSlotConfig(TimeStampedModel):
    __tablename__ = "time_slot_configs"

    time = Column(String(50), nullable=False) # e.g. "10:00 AM"
    is_available = Column(Boolean, default=True)
    blocked_reason = Column(String(255), nullable=True)
    branch_id = Column(String(36), nullable=True) # "all" or specific branch
    stylist_id = Column(String(36), nullable=True) # "all" or specific stylist
    allowed_genders = Column(JSON, default=lambda: ["women", "men", "unisex"])
    allowed_categories = Column(JSON, default=list)
    slot_type = Column(String(50), default="regular") # regular, women_exclusive, men_grooming, bridal_suite, etc.
