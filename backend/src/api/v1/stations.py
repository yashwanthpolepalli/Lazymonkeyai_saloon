from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.salon import SalonStation, Branch
from pydantic import BaseModel

router = APIRouter(prefix="/stations", tags=["Salon - Stations & Resource Allocation"])

class StationCreate(BaseModel):
    branch_id: str
    station_code: str
    name: str
    station_type: str = "styling_chair" # styling_chair, spa_bed, wash_basin, bridal_suite, nail_bar
    status: str = "available" # available, occupied, maintenance, cleaning
    assigned_stylist_name: Optional[str] = None

class StationUpdateStatus(BaseModel):
    status: str
    current_appointment_id: Optional[str] = None
    assigned_stylist_name: Optional[str] = None

class StationResponse(BaseModel):
    id: str
    branch_id: str
    station_code: str
    name: str
    station_type: str
    status: str
    current_appointment_id: Optional[str] = None
    assigned_stylist_name: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

@router.get("", response_model=List[StationResponse])
def get_stations(
    branch_id: Optional[str] = None,
    station_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SalonStation).filter(SalonStation.is_active == True)
    if branch_id:
        query = query.filter(SalonStation.branch_id == branch_id)
    if station_type:
        query = query.filter(SalonStation.station_type == station_type)
    if status_filter:
        query = query.filter(SalonStation.status == status_filter)
    return query.order_by(SalonStation.station_code.asc()).all()

@router.post("", response_model=StationResponse, status_code=status.HTTP_201_CREATED)
def create_station(payload: StationCreate, db: Session = Depends(get_db)):
    station = SalonStation(
        branch_id=payload.branch_id,
        station_code=payload.station_code.strip().upper(),
        name=payload.name,
        station_type=payload.station_type,
        status=payload.status,
        assigned_stylist_name=payload.assigned_stylist_name,
        is_active=True
    )
    db.add(station)
    db.commit()
    db.refresh(station)
    return station

@router.patch("/{station_id}/status", response_model=StationResponse)
def update_station_status(station_id: str, payload: StationUpdateStatus, db: Session = Depends(get_db)):
    station = db.query(SalonStation).filter(SalonStation.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    station.status = payload.status
    if payload.current_appointment_id is not None:
        station.current_appointment_id = payload.current_appointment_id
    if payload.assigned_stylist_name is not None:
        station.assigned_stylist_name = payload.assigned_stylist_name
    
    db.commit()
    db.refresh(station)
    return station
