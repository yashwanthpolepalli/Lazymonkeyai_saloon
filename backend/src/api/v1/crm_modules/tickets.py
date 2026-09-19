from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.customer_service import CustomerTicket
from src.schemas.customer_service import (
    CustomerTicketCreate, CustomerTicketResponse, AddMessageRequest
)
from src.utils.number_series import generate_reference_code

router = APIRouter(prefix="/tickets", tags=["Customer Support Tickets"])

@router.get("", response_model=List[CustomerTicketResponse])
def get_tickets(branch_id: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CustomerTicket)
    if branch_id:
        query = query.filter(CustomerTicket.branch_id == branch_id)
    if status:
        query = query.filter(CustomerTicket.status == status)
    return query.order_by(CustomerTicket.created_at.desc()).all()

@router.post("", response_model=CustomerTicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: CustomerTicketCreate, db: Session = Depends(get_db)):
    ticket_num = generate_reference_code("TCK")
    ticket = CustomerTicket(
        ticket_number=ticket_num,
        **payload.model_dump()
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

@router.post("/{ticket_id}/messages")
def add_ticket_message(ticket_id: str, payload: AddMessageRequest, db: Session = Depends(get_db)):
    ticket = db.query(CustomerTicket).filter(CustomerTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    msg = {
        "sender": payload.sender,
        "role": payload.role,
        "text": payload.text,
        "time": datetime.now().strftime("%I:%M %p")
    }
    
    current_msgs = list(ticket.messages or [])
    current_msgs.append(msg)
    ticket.messages = current_msgs
    db.commit()
    return {"status": "success", "messages": ticket.messages}
