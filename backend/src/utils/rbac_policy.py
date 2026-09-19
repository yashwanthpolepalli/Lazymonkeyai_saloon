from typing import List, Optional
from fastapi import HTTPException, status

# Supported Roles across Saloon Business OS
ROLE_ADMIN = "admin"
ROLE_OWNER = "owner"
ROLE_STAFF = "staff"
ROLE_CUSTOMER = "customer"

# Role hierarchy levels for permission gating
ROLE_HIERARCHY = {
    ROLE_ADMIN: 40,
    ROLE_OWNER: 30,
    ROLE_STAFF: 20,
    ROLE_CUSTOMER: 10,
}

def has_required_role(user_role: str, allowed_roles: List[str]) -> bool:
    """Checks whether the user's role is in the list of allowed roles or has administrative override."""
    if user_role == ROLE_ADMIN or user_role == ROLE_OWNER:
        return True
    return user_role in allowed_roles

def check_permission(user_role: str, min_role: str = ROLE_STAFF):
    """Verifies user has at least the minimum role level required."""
    user_level = ROLE_HIERARCHY.get(user_role, 0)
    required_level = ROLE_HIERARCHY.get(min_role, 0)
    
    if user_level < required_level:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: Requires minimum '{min_role}' authorization level."
        )
