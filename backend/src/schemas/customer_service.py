from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class TicketMessageSchema(BaseModel):
    sender: str
    role: str # customer, staff, manager
    text: str
    time: str

class CustomerTicketBase(BaseModel):
    customer_id: str
    customer_name: str
    customer_phone: str
    branch_id: str
    subject: str
    category: str = "Service Quality"
    priority: str = "medium"
    status: str = "open"
    sla_minutes_remaining: int = 240
    assigned_to: Optional[str] = None
    messages: List[Dict[str, Any]] = []

class CustomerTicketCreate(CustomerTicketBase):
    pass

class CustomerTicketResponse(CustomerTicketBase):
    id: str
    ticket_number: str

    class Config:
        from_attributes = True

class AddMessageRequest(BaseModel):
    sender: str
    role: str = "staff"
    text: str
