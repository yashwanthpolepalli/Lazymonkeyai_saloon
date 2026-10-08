"""
Multi-Tenant Role Hierarchy, Auto Credential Engine & Notification Service.

Hierarchy:
1. Super Admin -> Creates Owner / Director accounts (with Company mapping)
2. Owner -> Creates Branch Manager, Stylist / Staff, Cashier
3. Manager / Staff -> Creates Customer accounts

Credential Pattern:
- Username: Registered Name (or Registered Email)
- Password: First 4 characters of Name (Title-cased/alphanumeric) + Last 4 digits of Phone (e.g., 'Yash8765' or 'Salo1234')
- Mapped dynamically to Organization/Company, Branch, and Role.
"""

import re
import uuid
import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from src.models.erp import User
from src.models.organization import Organization
from src.models.salon import Branch
from src.utils.security import get_password_hash

logger = logging.getLogger("CredentialService")


def generate_default_password(name: str, phone: Optional[str] = None) -> str:
    """
    Generates password: First 4 chars of name + Last 4 digits of phone number.
    Example: name='Yashwanth', phone='+919876543210' -> 'Yash3210'
    Fallback if phone is missing or short: 'Yash2026'
    """
    clean_name = re.sub(r"[^a-zA-Z]", "", name or "User")
    name_prefix = (clean_name[:4] if len(clean_name) >= 4 else clean_name.ljust(4, "X")).capitalize()

    digits_only = re.sub(r"[^\d]", "", phone or "")
    phone_suffix = digits_only[-4:] if len(digits_only) >= 4 else "2026"

    return f"{name_prefix}{phone_suffix}"


def dispatch_credential_email(
    to_email: str,
    name: str,
    username: str,
    plain_password: str,
    role: str,
    organization_name: Optional[str] = None,
    branch_name: Optional[str] = None,
    login_url: str = "http://localhost:3000"
) -> Dict[str, Any]:
    """
    Sends/logs credentials email to the newly registered user/employee/customer.
    """
    role_labels = {
        "super_admin": "Platform Super Administrator",
        "director": "Salon Director & Owner",
        "owner": "Salon Owner",
        "branch_manager": "Salon General Manager",
        "manager": "Branch Manager",
        "cashier": "Front-Desk Cashier",
        "staff": "Senior Hair & Beauty Specialist",
        "stylist": "Hairstylist & Consultant",
        "customer": "Valued VIP Customer",
    }
    role_display = role_labels.get(role.lower(), role.title())
    org_display = organization_name or "LazyMonkey AI Luxury Salon Suite"
    branch_display = branch_name or "Main Flagship Studio"

    email_subject = f"Welcome to {org_display} — Your Login Credentials"
    email_body = f"""
================================================================================
                    LUXURY SALON OS — CREDENTIAL DISPATCH
================================================================================
To: {name} <{to_email}>
Subject: {email_subject}

Dear {name},

Your official access account for {org_display} has been successfully provisioned.

--- ACCOUNT & CREDENTIAL DETAILS ---
Company / Organization : {org_display}
Assigned Branch        : {branch_display}
Assigned Role          : {role_display}

Login Username         : {username} (or {to_email})
Temporary Password     : {plain_password}

Login Portal           : {login_url}
------------------------------------

Please use your credentials to log into your designated dashboard.
For security reasons, we recommend updating your password upon initial login.

Warm regards,
Operations Management Team
{org_display}
================================================================================
"""
    # Print to backend server terminal log for real-time visibility
    print(email_body, flush=True)
    logger.info(f"Dispatched login credentials to {to_email} for role={role}")

    return {
        "status": "sent",
        "recipient": to_email,
        "username": username,
        "password": plain_password,
        "role": role,
        "organization": org_display,
        "branch": branch_display,
    }


def provision_user_account(
    db: Session,
    name: str,
    email: str,
    phone: Optional[str],
    role: str,
    organization_id: Optional[str] = None,
    branch_id: Optional[str] = None,
    department: Optional[str] = None,
    custom_password: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Provisions a User account in public.users table mapped to company and branch,
    generates standard password, and sends login credentials.
    """
    clean_email = email.strip().lower()
    plain_password = custom_password or generate_default_password(name, phone)

    # Check if user already exists
    user = db.query(User).filter(User.email == clean_email).first()
    if user:
        # Update existing user role and mapping if needed
        user.name = name.strip()
        user.phone = phone.strip() if phone else user.phone
        user.role = role
        user.password_hash = get_password_hash(plain_password)
        if organization_id:
            user.organization_id = organization_id
        if branch_id:
            user.branch_id = branch_id
        if department:
            user.department = department
        user.is_active = True
        db.commit()
        db.refresh(user)
    else:
        # Create new User row
        user = User(
            id=str(uuid.uuid4()),
            name=name.strip(),
            email=clean_email,
            phone=phone.strip() if phone else None,
            password_hash=get_password_hash(plain_password),
            role=role,
            organization_id=organization_id,
            branch_id=branch_id,
            department=department or ("Front Office" if role == "customer" else "Operations"),
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Fetch organization and branch names for the welcome email
    org = db.query(Organization).filter(Organization.id == user.organization_id).first() if user.organization_id else None
    branch = db.query(Branch).filter(Branch.id == user.branch_id).first() if user.branch_id else None

    # Send Welcome / Credential Email
    dispatch_result = dispatch_credential_email(
        to_email=clean_email,
        name=name,
        username=name.strip(),
        plain_password=plain_password,
        role=role,
        organization_name=org.name if org else None,
        branch_name=branch.name if branch else None,
    )

    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "organization_id": user.organization_id,
        "organization_name": org.name if org else None,
        "branch_id": user.branch_id,
        "branch_name": branch.name if branch else None,
        "generated_password": plain_password,
        "dispatch_status": dispatch_result["status"],
    }
