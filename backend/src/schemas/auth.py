from typing import Optional
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    role: str = "staff" # super_admin, director, branch_manager, cashier, staff, customer, auditor
    organization_id: Optional[str] = None
    branch_id: Optional[str] = None
    department: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str
    organization_id: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    phone: Optional[str] = None
    name: str
    role: str
    organization_id: Optional[str] = None
    branch_id: Optional[str] = None
    department: Optional[str] = None
    avatar: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True
