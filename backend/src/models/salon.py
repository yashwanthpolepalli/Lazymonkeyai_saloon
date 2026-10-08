from sqlalchemy import Column, String, Boolean, Float, Integer, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from src.models.base import TimeStampedModel

class Branch(TimeStampedModel):
    __tablename__ = "branches"

    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    branch_type = Column(String(100), nullable=True)
    manager_name = Column(String(255), nullable=True)
    status = Column(String(50), default="active")
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    whatsapp = Column(String(50), nullable=True)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    pin_code = Column(String(20), nullable=True)
    map_location = Column(String(500), nullable=True)
    currency = Column(String(10), nullable=True)
    tax_rate = Column(Float, default=0.0)
    rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    image = Column(String(500), nullable=True)
    logo = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    chairs_count = Column(Integer, default=0)
    opening_hours = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)

    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    organization = relationship("Organization", back_populates="branches")

    company_id = Column(String(36), ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    company = relationship("Company", back_populates="branches")
    
    invoices = relationship("ERPInvoice", back_populates="branch", cascade="all, delete-orphan")
    stylists = relationship("Stylist", back_populates="branch", cascade="all, delete-orphan")
    employees = relationship("Employee", back_populates="branch", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="branch", cascade="all, delete-orphan")

class MasterServiceCategory(TimeStampedModel):
    __tablename__ = "master_service_categories"

    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    icon_name = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)
    subcategories = Column(JSON, default=list)
    gender = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)

    services = relationship("MasterService", back_populates="category", cascade="all, delete-orphan")

class MasterService(TimeStampedModel):
    __tablename__ = "master_services"

    category_id = Column(String(36), ForeignKey("master_service_categories.id", ondelete="CASCADE"), nullable=False)
    category_name = Column(String(255), nullable=False)
    subcategory = Column(String(255), nullable=True)
    name = Column(String(255), nullable=False, index=True)
    short_desc = Column(Text, nullable=True)
    full_desc = Column(Text, nullable=True)
    default_duration = Column(Integer, nullable=True)
    suggested_price_min = Column(Float, nullable=True)
    suggested_price_max = Column(Float, nullable=True)
    default_price = Column(Float, nullable=True)
    member_price = Column(Float, nullable=True)
    gender = Column(JSON, default=list)
    audience = Column(String(50), nullable=True)
    required_skills = Column(JSON, default=list)
    add_ons = Column(JSON, default=list)
    consumed_products = Column(JSON, default=list)
    is_popular = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    category = relationship("MasterServiceCategory", back_populates="services")

class ServiceCategory(TimeStampedModel):
    __tablename__ = "service_categories"

    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    icon_name = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    image = Column(String(500), nullable=True)
    gender = Column(JSON, default=list)
    subcategories = Column(JSON, default=list)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)
    is_active = Column(Boolean, default=True)

    services = relationship("Service", back_populates="category", cascade="all, delete-orphan")

class Service(TimeStampedModel):
    __tablename__ = "services"

    master_service_id = Column(String(36), ForeignKey("master_services.id", ondelete="SET NULL"), nullable=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)
    category_id = Column(String(36), ForeignKey("service_categories.id", ondelete="CASCADE"), nullable=False)
    category_name = Column(String(255), nullable=False)
    subcategory = Column(String(255), nullable=True)
    name = Column(String(255), nullable=False, index=True)
    short_desc = Column(Text, nullable=True)
    full_desc = Column(Text, nullable=True)
    base_price = Column(Float, nullable=False)
    member_price = Column(Float, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    gender = Column(JSON, default=list)
    branch_ids = Column(JSON, default=list)
    image = Column(String(500), nullable=True)
    featured = Column(Boolean, default=False)
    is_popular = Column(Boolean, default=False)
    variants = Column(JSON, default=list)
    branch_pricing = Column(JSON, default=dict)
    option_groups = Column(JSON, default=list)
    add_ons = Column(JSON, default=list)
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
    tier = Column(String(50), nullable=True)
    tier_multiplier = Column(Float, default=1.0)
    specialties = Column(JSON, default=list)
    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Float, default=0.0)
    experience_years = Column(Integer, default=0)
    bio = Column(Text, nullable=True)
    is_available_today = Column(Boolean, default=True)
    commission_rate = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)

    branch = relationship("Branch", back_populates="stylists")
    appointments = relationship("Appointment", back_populates="stylist")

class TimeSlotConfig(TimeStampedModel):
    __tablename__ = "time_slot_configs"

    time = Column(String(50), nullable=False)
    is_available = Column(Boolean, default=True)
    blocked_reason = Column(String(255), nullable=True)
    branch_id = Column(String(36), nullable=True)
    stylist_id = Column(String(36), nullable=True)
    allowed_genders = Column(JSON, default=list)
    allowed_categories = Column(JSON, default=list)
    slot_type = Column(String(50), default="regular")

class SalonStation(TimeStampedModel):
    __tablename__ = "salon_stations"

    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    station_code = Column(String(50), index=True, nullable=False)
    name = Column(String(255), nullable=False)
    station_type = Column(String(50), default="styling_chair")
    status = Column(String(50), default="available")
    current_appointment_id = Column(String(36), nullable=True)
    assigned_stylist_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)

