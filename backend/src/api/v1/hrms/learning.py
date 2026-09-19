from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/hrms/learning", tags=["HRMS - Learning & LMS"])

class CourseModule(BaseModel):
    id: str
    title: str
    category: str
    duration_hours: float
    is_completed: bool

@router.get("/courses")
def get_lms_courses():
    return [
        {"id": "lms_1", "title": "Advanced French Balayage Mastery", "category": "Hair Technique", "duration_hours": 3.5, "is_completed": True},
        {"id": "lms_2", "title": "Hydra-Gold Facial Protocols & Sanitization", "category": "Aesthetics", "duration_hours": 2.0, "is_completed": False},
        {"id": "lms_3", "title": "VIP Client Consultation & Active Listening", "category": "Guest Experience", "duration_hours": 1.5, "is_completed": True}
    ]
