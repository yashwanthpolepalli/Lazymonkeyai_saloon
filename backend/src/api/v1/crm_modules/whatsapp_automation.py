from typing import Dict
from fastapi import APIRouter
from pydantic import BaseModel
from src.services.whatsapp_service import whatsapp_client

router = APIRouter(prefix="/crm_modules/whatsapp", tags=["CRM - WhatsApp Automation"])

class WhatsAppSendRequest(BaseModel):
    phone: str
    template: str
    variables: Dict[str, str]

@router.post("/send")
def send_whatsapp_notification(req: WhatsAppSendRequest):
    result = whatsapp_client.send_template_message(
        phone=req.phone,
        template=req.template,
        variables=req.variables
    )
    return {
        "status": result["status"],
        "messageId": result["message_id"],
        "success": True
    }
