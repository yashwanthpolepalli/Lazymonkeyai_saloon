from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.salon import Service, ServiceCategory
from src.schemas.salon import (
    ServiceCategoryCreate, ServiceCategoryResponse,
    ServiceCreate, ServiceUpdate, ServiceResponse
)

router = APIRouter(tags=["Services & Categories"])

# --- Categories ---
@router.get("/categories", response_model=List[ServiceCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(ServiceCategory).filter(ServiceCategory.is_active == True).all()

@router.post("/categories", response_model=ServiceCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(payload: ServiceCategoryCreate, db: Session = Depends(get_db)):
    existing = db.query(ServiceCategory).filter(ServiceCategory.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Category slug '{payload.slug}' already exists")
    
    cat = ServiceCategory(**payload.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

# --- Services Catalog ---
@router.get("/services", response_model=List[ServiceResponse])
def get_services(
    category_id: Optional[str] = None,
    gender: Optional[str] = None,
    branch_id: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Service).filter(Service.is_active == True)
    
    if category_id:
        query = query.filter(Service.category_id == category_id)
    if search:
        query = query.filter(Service.name.ilike(f"%{search}%"))
        
    services = query.all()
    
    # In-memory filter for JSON fields if specified
    if branch_id:
        services = [s for s in services if not s.branch_ids or branch_id in s.branch_ids]
    if gender:
        services = [s for s in services if "unisex" in s.gender or gender in s.gender]

    return services

@router.post("/services", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
def create_service(payload: ServiceCreate, db: Session = Depends(get_db)):
    service = Service(**payload.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service

@router.get("/services/{service_id}", response_model=ServiceResponse)
def get_service_by_id(service_id: str, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.put("/services/{service_id}", response_model=ServiceResponse)
def update_service(service_id: str, payload: ServiceUpdate, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(service, key, value)
    
    db.commit()
    db.refresh(service)
    return service

@router.delete("/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(service_id: str, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    service.is_active = False
    db.commit()
    return None
