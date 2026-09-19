from typing import List
from datetime import datetime
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/notifications", tags=["Live Notifications & Alerts"])

class NotificationItem(BaseModel):
    id: str
    type: str # booking, inventory, payment, staff
    title: str
    message: str
    timestamp: str
    is_read: bool = False

@router.get("", response_model=List[NotificationItem])
def get_live_notifications():
    return [
        {
            "id": "notif_1",
            "type": "booking",
            "title": "Online Booking Confirmed",
            "message": "New appointment booked for Signature Sculptural Haircut.",
            "timestamp": datetime.now().strftime("%I:%M %p"),
            "is_read": False
        },
        {
            "id": "notif_2",
            "type": "inventory",
            "title": "Stock Alert Threshold",
            "message": "Argan Oil Serum batch is below safety threshold (4 units remaining).",
            "timestamp": datetime.now().strftime("%I:%M %p"),
            "is_read": False
        }
    ]
