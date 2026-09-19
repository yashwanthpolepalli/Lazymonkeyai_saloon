from typing import Dict, Any, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from src.services.copilot_service import copilot_engine

router = APIRouter(prefix="/copilot", tags=["AI Copilot Assistant"])

class CopilotQueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

@router.post("/query")
def process_copilot_query(req: CopilotQueryRequest):
    response_text = copilot_engine.generate_response(req.query, req.context or {})
    return {
        "query": req.query,
        "response": response_text,
        "suggestions": [
            "Analyze weekend chair utilization rate",
            "Generate low-stock purchase orders",
            "Launch VIP client reactivation campaign"
        ]
    }
