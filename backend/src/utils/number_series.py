import random
import string
from datetime import datetime

def generate_reference_code(prefix: str = "REF", length: int = 6) -> str:
    """Generates a unique timestamped or random alphanumeric reference identifier."""
    digits = "".join(random.choices(string.digits, k=length))
    return f"{prefix}-{digits}"

def generate_invoice_number(branch_code: str = "HQ", sequence: int = 1) -> str:
    """Generates a standard GST-compliant fiscal invoice number."""
    now = datetime.now()
    year_str = now.strftime("%y")
    next_year_str = str(int(year_str) + 1)
    fiscal_year = f"{year_str}{next_year_str}"
    return f"INV/{branch_code}/{fiscal_year}/{str(sequence).zfill(5)}"

def generate_employee_code(branch_code: str = "HQ", sequence: int = 1) -> str:
    """Generates a unique employee ID code."""
    return f"EMP-{branch_code.upper()}-{str(sequence).zfill(4)}"

def generate_booking_ref() -> str:
    """Generates an alphanumeric 6-character booking reference e.g., SLN-84920."""
    num = "".join(random.choices(string.digits, k=5))
    return f"SLN-{num}"
