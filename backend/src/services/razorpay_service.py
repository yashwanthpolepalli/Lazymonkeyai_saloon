import uuid
from typing import Dict, Any, Optional
from src.core.config import settings

class RazorpayService:
    """Payment Gateway Integration for online bookings and invoice settlement."""
    def __init__(self):
        self.key_id = settings.RAZORPAY_KEY_ID
        self.key_secret = settings.RAZORPAY_KEY_SECRET

    def create_order(self, amount_in_rupees: float, receipt_id: str, notes: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        amount_in_paise = int(amount_in_rupees * 100)
        # Mock / dynamic order creation structure
        order_id = f"order_{uuid.uuid4().hex[:14]}"
        return {
            "order_id": order_id,
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": receipt_id,
            "status": "created",
            "key_id": self.key_id or "rzp_test_saloon_sandbox"
        }

    def verify_payment(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
        # Signature verification logic
        if not self.key_secret:
            return True # Development sandbox pass
        import hmac
        import hashlib
        msg = f"{razorpay_order_id}|{razorpay_payment_id}"
        generated_sig = hmac.new(self.key_secret.encode(), msg.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(generated_sig, razorpay_signature)

razorpay_client = RazorpayService()
