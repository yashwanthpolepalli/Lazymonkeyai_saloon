from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/hrms/exit", tags=["HRMS - Exit Management"])

class ResignationRequest(BaseModel):
    employee_id: str
    reason: str
    notice_period_days: int = 30
    last_working_day: str

@router.get("/requests")
def get_exit_requests():
    return []

@router.post("/submit")
def submit_resignation(req: ResignationRequest):
    return {"status": "submitted", "clearance_initiated": True, "data": req}
