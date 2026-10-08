from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid

from src.core.database import get_db
from src.models.salon import MasterServiceCategory, MasterService, ServiceCategory, Service, Branch
from src.models.organization import Organization
from src.data.master_catalog_seed import MASTER_CATEGORIES, MASTER_SERVICES

router = APIRouter(prefix="/master-catalog", tags=["Master Service Catalog"])

# --- Schemas ---

class MasterCategoryOut(BaseModel):
    id: str
    name: str
    slug: str
    icon_name: str
    description: Optional[str] = None
    display_order: int = 0
    subcategories: List[str] = []
    gender: List[str] = []
    is_active: bool = True
    service_count: Optional[int] = 0

    class Config:
        from_attributes = True

class MasterServiceOut(BaseModel):
    id: str
    category_id: str
    category_name: str
    subcategory: Optional[str] = None
    name: str
    short_desc: Optional[str] = None
    full_desc: Optional[str] = None
    default_duration: Optional[int] = None
    suggested_price_min: Optional[float] = None
    suggested_price_max: Optional[float] = None
    default_price: Optional[float] = None
    member_price: Optional[float] = None
    gender: List[str] = []
    audience: Optional[str] = None
    required_skills: List[str] = []
    add_ons: List[Dict[str, Any]] = []
    consumed_products: List[Dict[str, Any]] = []
    is_popular: bool = False
    is_active: bool = True

    class Config:
        from_attributes = True

class AdoptServiceItem(BaseModel):
    master_service_id: str
    custom_name: Optional[str] = None
    custom_price: Optional[float] = None
    custom_duration: Optional[int] = None
    branch_ids: Optional[List[str]] = None

class AdoptCatalogRequest(BaseModel):
    organization_id: Optional[str] = None
    branch_ids: Optional[List[str]] = None
    services: List[AdoptServiceItem]

# --- Helper to auto-seed if empty ---

def ensure_master_catalog_seeded(db: Session):
    cat_count = db.query(MasterServiceCategory).count()
    if cat_count > 0:
        return

    cat_map: Dict[str, MasterServiceCategory] = {}
    for cat_data in MASTER_CATEGORIES:
        cat = MasterServiceCategory(
            id=f"mcat_{cat_data['slug'].replace('-', '_')}",
            name=cat_data["name"],
            slug=cat_data["slug"],
            icon_name=cat_data.get("icon_name", "Sparkles"),
            description=cat_data.get("description", ""),
            display_order=cat_data.get("display_order", 0),
            subcategories=cat_data.get("subcategories", []),
            gender=cat_data.get("gender", ["women", "men", "unisex"]),
            is_active=True,
        )
        db.add(cat)
        cat_map[cat_data["slug"]] = cat
    db.commit()

    for s_data in MASTER_SERVICES:
        cat = cat_map.get(s_data["category_slug"])
        if not cat:
            continue
        svc = MasterService(
            id=f"msvc_{uuid.uuid4().hex[:10]}",
            category_id=cat.id,
            category_name=cat.name,
            subcategory=s_data.get("subcategory"),
            name=s_data["name"],
            short_desc=s_data.get("short_desc", ""),
            full_desc=s_data.get("short_desc", ""),
            default_duration=s_data.get("default_duration", 45),
            suggested_price_min=s_data.get("suggested_price_min", 500.0),
            suggested_price_max=s_data.get("suggested_price_max", 1500.0),
            default_price=s_data.get("default_price", 800.0),
            member_price=round(s_data.get("default_price", 800.0) * 0.9, 2),
            gender=s_data.get("gender", ["unisex"]),
            audience=s_data.get("audience", "unisex"),
            required_skills=s_data.get("required_skills", []),
            add_ons=s_data.get("add_ons", []),
            consumed_products=s_data.get("consumed_products", []),
            is_popular=s_data.get("is_popular", False),
            is_active=True,
        )
        db.add(svc)
    db.commit()

# --- Endpoints ---

@router.get("/categories", response_model=List[MasterCategoryOut])
def get_master_categories(db: Session = Depends(get_db)):
    """Fetch all master service catalog categories with service counts."""
    ensure_master_catalog_seeded(db)
    cats = db.query(MasterServiceCategory).filter(MasterServiceCategory.is_active == True).order_by(MasterServiceCategory.display_order.asc()).all()
    
    result = []
    for c in cats:
        count = db.query(MasterService).filter(MasterService.category_id == c.id, MasterService.is_active == True).count()
        cat_dict = {
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "icon_name": c.icon_name,
            "description": c.description,
            "display_order": c.display_order,
            "subcategories": c.subcategories or [],
            "gender": c.gender or [],
            "is_active": c.is_active,
            "service_count": count,
        }
        result.append(cat_dict)
    return result

@router.get("/services", response_model=List[MasterServiceOut])
def get_master_services(
    category_id: Optional[str] = None,
    category_slug: Optional[str] = None,
    gender: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Fetch master catalog services with multi-criteria filtering."""
    ensure_master_catalog_seeded(db)
    query = db.query(MasterService).filter(MasterService.is_active == True)

    if category_id:
        query = query.filter(MasterService.category_id == category_id)
    elif category_slug:
        cat = db.query(MasterServiceCategory).filter(MasterServiceCategory.slug == category_slug).first()
        if cat:
            query = query.filter(MasterService.category_id == cat.id)

    if isinstance(search, str) and search.strip():
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (MasterService.name.ilike(search_fmt)) |
            (MasterService.subcategory.ilike(search_fmt)) |
            (MasterService.short_desc.ilike(search_fmt))
        )

    services = query.all()

    if gender and gender != "all":
        filtered = []
        for s in services:
            g_list = s.gender or ["unisex"]
            if gender in g_list or "unisex" in g_list or s.audience == gender or s.audience == "unisex":
                filtered.append(s)
        return filtered

    return services

@router.post("/seed")
def reseed_master_catalog(db: Session = Depends(get_db)):
    """Force (re)seed master categories and services in database."""
    ensure_master_catalog_seeded(db)
    cat_count = db.query(MasterServiceCategory).count()
    svc_count = db.query(MasterService).count()
    return {
        "success": True,
        "message": "Master Service Catalog verified and active.",
        "categories_count": cat_count,
        "services_count": svc_count,
    }

@router.post("/adopt")
def adopt_master_services(
    payload: AdoptCatalogRequest,
    db: Session = Depends(get_db),
):
    """
    Adopts selected master catalog services into a specific salon organization / branch.
    Automatically creates the corresponding local ServiceCategories if not already present.
    """
    if not payload.services:
        raise HTTPException(status_code=400, detail="No services selected for adoption.")

    created_services = []
    category_cache: Dict[str, ServiceCategory] = {}

    # Validate organization if provided
    valid_org_id = None
    if payload.organization_id:
        org_exists = db.query(Organization).filter(Organization.id == payload.organization_id).first()
        if org_exists:
            valid_org_id = payload.organization_id

    for item in payload.services:
        msvc = db.query(MasterService).filter(MasterService.id == item.master_service_id).first()
        if not msvc:
            continue

        # Find or create corresponding local ServiceCategory
        cat_key = f"{valid_org_id or 'default'}_{msvc.category_id}"
        if cat_key not in category_cache:
            mcat = db.query(MasterServiceCategory).filter(MasterServiceCategory.id == msvc.category_id).first()
            slug = mcat.slug if mcat else "general"
            
            # Check if local category already exists for this org
            existing_cat = db.query(ServiceCategory).filter(
                ServiceCategory.slug == slug,
                (ServiceCategory.organization_id == valid_org_id) if valid_org_id else True
            ).first()

            if not existing_cat:
                new_cat = ServiceCategory(
                    id=f"cat_{uuid.uuid4().hex[:10]}",
                    name=mcat.name if mcat else msvc.category_name,
                    slug=slug,
                    icon_name=mcat.icon_name if mcat else "Sparkles",
                    description=mcat.description if mcat else "",
                    gender=mcat.gender if mcat else ["women", "men", "unisex"],
                    subcategories=mcat.subcategories if mcat else [],
                    organization_id=valid_org_id,
                    is_active=True,
                )
                db.add(new_cat)
                db.flush()
                existing_cat = new_cat
            category_cache[cat_key] = existing_cat

        local_cat = category_cache[cat_key]

        # Calculate customized pricing & duration
        final_price = item.custom_price if item.custom_price is not None else msvc.default_price
        final_duration = item.custom_duration if item.custom_duration is not None else msvc.default_duration
        final_name = item.custom_name if item.custom_name else msvc.name
        final_branches = item.branch_ids or payload.branch_ids or []

        # Check if service already adopted
        existing_svc = db.query(Service).filter(
            Service.master_service_id == msvc.id,
            Service.category_id == local_cat.id,
            (Service.organization_id == valid_org_id) if valid_org_id else True
        ).first()

        if existing_svc:
            # Update existing
            existing_svc.name = final_name
            existing_svc.base_price = final_price
            existing_svc.duration_minutes = final_duration
            if final_branches:
                existing_svc.branch_ids = list(set((existing_svc.branch_ids or []) + final_branches))
            created_services.append(existing_svc.id)
        else:
            # Create new salon service from master
            new_service = Service(
                id=f"svc_{uuid.uuid4().hex[:10]}",
                master_service_id=msvc.id,
                organization_id=valid_org_id,
                category_id=local_cat.id,
                category_name=local_cat.name,
                subcategory=msvc.subcategory,
                name=final_name,
                short_desc=msvc.short_desc,
                full_desc=msvc.full_desc,
                base_price=final_price,
                member_price=round(final_price * 0.9, 2),
                duration_minutes=final_duration,
                gender=msvc.gender or ["unisex"],
                branch_ids=final_branches,
                image="",
                featured=False,
                is_popular=msvc.is_popular,
                variants=[],
                branch_pricing={},
                option_groups=[],
                add_ons=msvc.add_ons or [],
                required_skills=msvc.required_skills or [],
                consumed_products=msvc.consumed_products or [],
                is_active=True,
            )
            db.add(new_service)
            db.flush()
            created_services.append(new_service.id)

    db.commit()

    return {
        "success": True,
        "message": f"Successfully adopted {len(created_services)} services into salon catalog.",
        "adopted_service_ids": created_services,
    }
