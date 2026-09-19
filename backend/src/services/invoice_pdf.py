import os
from typing import Dict, Any

def generate_invoice_html(invoice_data: Dict[str, Any], salon_data: Dict[str, Any]) -> str:
    """Generates an HTML receipt/invoice document for printing or PDF conversion."""
    items_html = ""
    for idx, item in enumerate(invoice_data.get("items", []), start=1):
        price = item.get("final_price") or item.get("price", 0)
        qty = item.get("quantity", 1)
        total = price * qty
        items_html += f"""
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{idx}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>{item.get('name')}</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">{qty}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹{price:,.2f}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹{total:,.2f}</td>
        </tr>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Tax Invoice - {invoice_data.get('invoice_number')}</title>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; margin: 40px; }}
            .header {{ display: flex; justify-content: space-between; border-bottom: 2px solid #d4af37; padding-bottom: 20px; }}
            .title {{ font-size: 24px; font-weight: bold; color: #111827; }}
            .invoice-meta {{ margin-top: 20px; display: flex; justify-content: space-between; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 25px; }}
            th {{ background: #f9fafb; padding: 10px 8px; text-align: left; border-bottom: 2px solid #e5e7eb; font-size: 13px; text-transform: uppercase; }}
            .summary {{ margin-top: 30px; float: right; width: 300px; }}
            .summary-row {{ display: flex; justify-content: space-between; padding: 6px 0; }}
            .total-row {{ font-weight: bold; font-size: 18px; border-top: 2px solid #111827; padding-top: 10px; color: #b45309; }}
        </style>
    </head>
    <body>
        <div class="header">
            <div>
                <div class="title">{salon_data.get('salon_name', 'AURA LUXE SALON')}</div>
                <div>{salon_data.get('tagline', 'Haute Coiffure & Aesthetic Sanctuary')}</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">GSTIN: {salon_data.get('gstin', 'N/A')}</div>
            </div>
            <div style="text-align: right;">
                <h2 style="margin: 0; color: #d4af37;">TAX INVOICE</h2>
                <div style="font-weight: bold;">#{invoice_data.get('invoice_number')}</div>
                <div style="color: #6b7280; font-size: 13px;">Date: {invoice_data.get('date', '')}</div>
            </div>
        </div>

        <div class="invoice_meta" style="margin-top: 20px; display: flex; justify-content: space-between;">
            <div>
                <strong>Billed To:</strong><br>
                {invoice_data.get('customer_name')}<br>
                Phone: {invoice_data.get('customer_phone', 'N/A')}<br>
            </div>
            <div style="text-align: right;">
                <strong>Branch:</strong> {invoice_data.get('branch_name', 'Main Studio')}<br>
                <strong>Cashier:</strong> {invoice_data.get('cashier_name', 'Front Desk')}<br>
                <strong>Status:</strong> {invoice_data.get('payment_status', 'PAID').upper()}<br>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 40px;">#</th>
                    <th>Item Description</th>
                    <th style="text-align: center; width: 60px;">Qty</th>
                    <th style="text-align: right; width: 100px;">Rate</th>
                    <th style="text-align: right; width: 100px;">Amount</th>
                </tr>
            </thead>
            <tbody>
                {items_html}
            </tbody>
        </table>

        <div class="summary">
            <div class="summary-row"><span>Subtotal:</span> <span>₹{invoice_data.get('subtotal', 0):,.2f}</span></div>
            <div class="summary-row"><span>Discount:</span> <span>-₹{invoice_data.get('discount_total', 0):,.2f}</span></div>
            <div class="summary-row"><span>GST (CGST + SGST):</span> <span>₹{invoice_data.get('tax_total', 0):,.2f}</span></div>
            <div class="summary-row total-row"><span>Grand Total:</span> <span>₹{invoice_data.get('final_total', 0):,.2f}</span></div>
        </div>
    </body>
    </html>
    """
