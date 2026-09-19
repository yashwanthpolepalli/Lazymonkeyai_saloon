from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.appointment import Appointment
from src.models.customer import Customer
from src.schemas.appointment import (
    AppointmentCreate, AppointmentUpdate, AppointmentResponse, RescheduleRequest
)
from src.utils.number_series import generate_booking_ref
from src.services.whatsapp_service import whatsapp_client

router = APIRouter(prefix="/appointments", tags=["Appointments & Bookings"])

@router.get("", response_model=List[AppointmentResponse])
def get_appointments(
    branch_id: Optional[str] = None,
    customer_id: Optional[str] = None,
    stylist_id: Optional[str] = None,
    date: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Appointment)
    if branch_id:
        query = query.filter(Appointment.branch_id == branch_id)
    if customer_id:
        query = query.filter(Appointment.customer_id == customer_id)
    if stylist_id:
        query = query.filter(Appointment.stylist_id == stylist_id)
    if date:
        query = query.filter(Appointment.date == date)
    if status_filter:
        query = query.filter(Appointment.status == status_filter)
    
    return query.order_by(Appointment.date.desc()).all()

@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def book_appointment(payload: AppointmentCreate, db: Session = Depends(get_db)):
    booking_ref = generate_booking_ref()
    
    apt = Appointment(
        booking_ref=booking_ref,
        **payload.model_dump()
    )
    db.add(apt)
    
    # Update customer visit count / stats
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if customer:
        customer.visits_count = (customer.visits_count or 0) + 1
        customer.total_spent = (customer.total_spent or 0) + payload.final_total

    db.commit()
    db.refresh(apt)

    # Trigger booking confirmation notice
    try:
        whatsapp_client.send_template_message(
            phone=apt.customer_phone,
            template="booking_confirmation",
            variables={
                "customer_name": apt.customer_name,
                "service_name": apt.service_name,
                "date": apt.date,
                "time": apt.time_slot,
                "stylist_name": apt.stylist_name
            }
        )
    except Exception:
        pass

    return apt

@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: str, db: Session = Depends(get_db)):
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return apt

@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(appointment_id: str, payload: AppointmentUpdate, db: Session = Depends(get_db)):
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(apt, key, value)
    
    db.commit()
    db.refresh(apt)
    return apt

@router.post("/{appointment_id}/reschedule", response_model=AppointmentResponse)
def reschedule_appointment(appointment_id: str, req: RescheduleRequest, db: Session = Depends(get_db)):
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    apt.date = req.new_date
    apt.time_slot = req.new_time_slot
    apt.status = "rescheduled"
    if req.new_stylist_id:
        apt.stylist_id = req.new_stylist_id
    
    db.commit()
    db.refresh(apt)
    return apt
