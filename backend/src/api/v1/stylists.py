from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.salon import Stylist, TimeSlotConfig
from src.schemas.salon import (
    StylistCreate, StylistUpdate, StylistResponse,
    TimeSlotConfigCreate, TimeSlotConfigResponse
)

router = APIRouter(prefix="/stylists", tags=["Stylists"])

@router.get("", response_model=List[StylistResponse])
def get_stylists(branch_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Stylist).filter(Stylist.is_active == True)
    if branch_id:
        query = query.filter(Stylist.branch_id == branch_id)
    return query.all()

@router.post("", response_model=StylistResponse, status_code=status.HTTP_201_CREATED)
def create_stylist(payload: StylistCreate, db: Session = Depends(get_db)):
    stylist = Stylist(**payload.model_dump())
    db.add(stylist)
    db.commit()
    db.refresh(stylist)
    return stylist

@router.get("/{stylist_id}", response_model=StylistResponse)
def get_stylist(stylist_id: str, db: Session = Depends(get_db)):
    stylist = db.query(Stylist).filter(Stylist.id == stylist_id).first()
    if not stylist:
        raise HTTPException(status_code=404, detail="Stylist not found")
    return stylist

@router.put("/{stylist_id}", response_model=StylistResponse)
def update_stylist(stylist_id: str, payload: StylistUpdate, db: Session = Depends(get_db)):
    stylist = db.query(Stylist).filter(Stylist.id == stylist_id).first()
    if not stylist:
        raise HTTPException(status_code=404, detail="Stylist not found")
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(stylist, key, value)
    
    db.commit()
    db.refresh(stylist)
    return stylist

# --- Stylist Schedules & Time Slots ---
@router.get("/time_slots/all", response_model=List[TimeSlotConfigResponse])
def get_time_slots(branch_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(TimeSlotConfig)
    if branch_id:
        query = query.filter((TimeSlotConfig.branch_id == branch_id) | (TimeSlotConfig.branch_id == None))
    return query.all()

@router.post("/time_slots", response_model=TimeSlotConfigResponse, status_code=status.HTTP_201_CREATED)
def create_time_slot(payload: TimeSlotConfigCreate, db: Session = Depends(get_db)):
    slot = TimeSlotConfig(**payload.model_dump())
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot
