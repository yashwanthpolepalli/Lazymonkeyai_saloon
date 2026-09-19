from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.erp import ERPInvoice
from src.models.customer import Customer, WalletTransaction
from src.models.inventory import InventoryProduct, StockMovement
from src.schemas.pos import POSTransactionCreate, POSTransactionResponse
from src.utils.number_series import generate_invoice_number, generate_reference_code
from src.services.whatsapp_service import whatsapp_client

router = APIRouter(prefix="/pos/transactions", tags=["POS - Transactions"])

@router.post("", response_model=POSTransactionResponse, status_code=status.HTTP_201_CREATED)
def create_pos_transaction(payload: POSTransactionCreate, db: Session = Depends(get_db)):
    branch_code = "BR1"
    inv_count = db.query(ERPInvoice).count() + 1
    invoice_number = generate_invoice_number(branch_code, inv_count)

    # Calculate tax split
    gst_rate = 0.18
    cgst_amount = round(payload.gst_amount / 2, 2)
    sgst_amount = round(payload.gst_amount / 2, 2)

    invoice = ERPInvoice(
        invoice_number=invoice_number,
        customer_id=payload.customer_id,
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        branch_id=payload.branch_id or "br_default",
        branch_name=payload.branch_name or "Main Flagship Studio",
        subtotal=payload.subtotal,
        discount_total=payload.discount_amount,
        tax_total=payload.gst_amount,
        cgst_amount=cgst_amount,
        sgst_amount=sgst_amount,
        final_total=payload.total_amount,
        items=payload.items,
        payments=payload.payments or [{"method": payload.payment_mode, "amount": payload.total_amount}],
        payment_status="paid",
        payment_mode=payload.payment_mode,
        cashier_name=payload.cashier_name or "Front Desk Cashier",
        notes=payload.notes,
        receipt_url=f"/receipts/{invoice_number.replace('/', '-')}.pdf"
    )
    db.add(invoice)

    # If customer is registered, update lifetime spend and check wallet payment
    if payload.customer_id:
        customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
        if customer:
            customer.total_spent = (customer.total_spent or 0) + payload.total_amount
            customer.visits_count = (customer.visits_count or 0) + 1
            
            # Loyalty accrual: 5% of subtotal as points
            earned_points = int(payload.subtotal * 0.05)
            customer.loyalty_points = (customer.loyalty_points or 0) + earned_points

            # Check if wallet was used in payments
            for p in (payload.payments or []):
                if p.get("method") == "wallet":
                    w_amt = float(p.get("amount", 0))
                    customer.wallet_balance = max(0.0, (customer.wallet_balance or 0.0) - w_amt)
                    db.add(WalletTransaction(
                        customer_id=customer.id,
                        type="debit",
                        amount=w_amt,
                        balance_after=customer.wallet_balance,
                        payment_method="pos_checkout",
                        reference_id=invoice_number,
                        notes="Payment for POS Invoice"
                    ))

    # Auto-deplete inventory for product sales
    for item in payload.items:
        if item.get("type") == "product" and item.get("id"):
            prod = db.query(InventoryProduct).filter(InventoryProduct.id == item.get("id")).first()
            if prod:
                qty = item.get("quantity", 1)
                prod.current_stock = max(0, (prod.current_stock or 0) - qty)
                db.add(StockMovement(
                    product_id=prod.id,
                    product_name=prod.name,
                    type="pos_sale",
                    branch_id=payload.branch_id or "br_default",
                    quantity=qty,
                    unit=prod.unit,
                    reference=invoice_number,
                    date=datetime.now().strftime("%Y-%m-%d"),
                    performed_by=payload.cashier_name or "POS Cashier",
                    reason="Customer Retail Purchase"
                ))

    db.commit()
    db.refresh(invoice)

    # WhatsApp e-Receipt notification
    if payload.customer_phone:
        try:
            whatsapp_client.send_template_message(
                phone=payload.customer_phone,
                template="invoice_receipt",
                variables={
                    "customer_name": payload.customer_name,
                    "invoice_number": invoice_number,
                    "total_amount": f"₹{payload.total_amount:,.2f}"
                }
            )
        except Exception:
            pass

    return {
        "invoice_id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "receipt_url": invoice.receipt_url,
        "status": "success"
    }
