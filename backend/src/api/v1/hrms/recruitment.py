from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/hrms/recruitment", tags=["HRMS - Recruitment"])

class JobOpening(BaseModel):
    id: str
    title: str
    department: str
    open_positions: int
    applicants_count: int
    status: str

@router.get("/jobs")
def get_job_openings():
    return []

@router.post("/jobs")
def create_job_opening(job: JobOpening):
    return {"status": "created", "job": job}
