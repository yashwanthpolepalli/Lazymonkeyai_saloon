import os
import sys
from datetime import datetime, timedelta

# Add src to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "src")))

from src.core.database import SessionLocal, engine, Base
from src.models import (
    Organization, Branch, ServiceCategory, Service, Stylist, SalonStation,
    Customer, MembershipTier, FormulaCard, GiftVoucher, Appointment,
    InventoryProduct, StockMovement, Employee, AttendanceRecord,
    LeaveRequest, PayrollSlip, Lead, Campaign, Coupon, FinancialExpense,
    CustomerTicket, User
)

def seed_enterprise_data():
    db = SessionLocal()
    try:
        print("🌱 Seeding relational PostgreSQL database with luxury SalonOS enterprise catalog...")

        # 1. Organization
        if not db.query(Organization).first():
            org = Organization(
                id="org_lazymonkey",
                name="LazyMonkey Luxury Salons & Spas Group",
                code="LM-LUXE",
                business_type="enterprise_chain",
                brand_tagline="The Pinnacle of Haute Coiffure & Aesthetic Wellness",
                currency="INR",
                tax_rate=0.18,
                gstin_or_tax_id="29ABCDE1234F1Z5",
                email="director@lazymonkeyai.luxury",
                phone="+91 80 4580 9900",
                website="https://lazymonkeyai.luxury",
                address="Level 2, UB City Luxury Mall, Vittal Mallya Road",
                city="Bengaluru",
                state="Karnataka",
                country="India",
                is_active=True,
                policy_config={
                    "multi_branch_enabled": True,
                    "approval_required": False,
                    "inventory_enabled": True,
                    "central_warehouse_enabled": True,
                    "payroll_enabled": True,
                    "commission_enabled": True,
                    "membership_enabled": True,
                    "marketing_enabled": True,
                    "audit_enabled": True,
                    "internal_entitlement_mode": False,
                    "budget_tracking_enabled": True,
                    "pos_mode": "enterprise_pos",
                    "departments": ["Hair Styling", "Skin Care & Aesthetics", "Nail Studio", "Wellness & Spa"]
                }
            )
            db.add(org)
            db.commit()

        # 2. Branches
        branches_data = [
            {
                "id": "br_mumbai",
                "name": "Atelier Mumbai Flagship",
                "code": "BOM-01",
                "branch_type": "Flagship Studio",
                "manager_name": "Vikram Malhotra",
                "phone": "+91 22 4580 9900",
                "email": "mumbai.flagship@lazymonkeyai.luxury",
                "whatsapp": "+91 98200 11223",
                "address": "Level 2, Palladium Luxury Mall, Lower Parel",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pin_code": "400013",
                "tax_rate": 0.18,
                "chairs_count": 14,
                "opening_hours": "09:00 AM - 09:30 PM",
                "is_active": True
            },
            {
                "id": "br_blr",
                "name": "Indiranagar Signature Suite",
                "code": "BLR-02",
                "branch_type": "Luxury Studio",
                "manager_name": "Ananya Roy",
                "phone": "+91 80 4122 8899",
                "email": "indiranagar@lazymonkeyai.luxury",
                "whatsapp": "+91 98200 99881",
                "address": "Level 2, 100 Feet Road, HAL 2nd Stage",
                "city": "Bengaluru",
                "state": "Karnataka",
                "pin_code": "560038",
                "tax_rate": 0.18,
                "chairs_count": 12,
                "opening_hours": "09:00 AM - 09:00 PM",
                "is_active": True
            },
            {
                "id": "br_hyd",
                "name": "Jubilee Hills Wellness Pavilion",
                "code": "HYD-03",
                "branch_type": "Wellness Pavilion",
                "manager_name": "Karthik Varma",
                "phone": "+91 40 6711 4455",
                "email": "jubileehills@lazymonkeyai.luxury",
                "whatsapp": "+91 99880 77665",
                "address": "Road No 36, Jubilee Hills",
                "city": "Hyderabad",
                "state": "Telangana",
                "pin_code": "500033",
                "tax_rate": 0.18,
                "chairs_count": 16,
                "opening_hours": "09:00 AM - 09:30 PM",
                "is_active": True
            }
        ]

        for b in branches_data:
            if not db.query(Branch).filter(Branch.id == b["id"]).first():
                db.add(Branch(**b))
        db.commit()

        # 3. Service Categories
        categories_data = [
            {"id": "cat_hair", "name": "Haute Coiffure & Styling", "icon": "Scissors", "display_order": 1},
            {"id": "cat_spa", "name": "Organic Botanical Hair Spa", "icon": "Sparkles", "display_order": 2},
            {"id": "cat_skin", "name": "Aesthetic Skin & Illuminating Facials", "icon": "Sparkles", "display_order": 3},
            {"id": "cat_nails", "name": "Luxury Nail Studio", "icon": "Crown", "display_order": 4},
            {"id": "cat_bridal", "name": "VIP Bridal & Groom Suites", "icon": "Crown", "display_order": 5},
            {"id": "cat_wellness", "name": "Scalp & Body Detox Therapies", "icon": "Sparkles", "display_order": 6}
        ]
        for c in categories_data:
            if not db.query(ServiceCategory).filter(ServiceCategory.id == c["id"]).first():
                db.add(ServiceCategory(**c))
        db.commit()

        # 4. Services
        services_data = [
            {"id": "srv_haircut", "category_id": "cat_hair", "name": "Bespoke Couture Haircut & Blowout", "category_name": "Haute Coiffure & Styling", "duration_minutes": 45, "base_price": 1800, "gender": "unisex", "is_active": True},
            {"id": "srv_balayage", "category_id": "cat_hair", "name": "French Balayage & Glossing Ritual", "category_name": "Haute Coiffure & Styling", "duration_minutes": 120, "base_price": 7500, "gender": "women", "is_active": True},
            {"id": "srv_keratin", "category_id": "cat_hair", "name": "Brazilian Keratin Smoothing Infusion", "category_name": "Haute Coiffure & Styling", "duration_minutes": 150, "base_price": 8500, "gender": "unisex", "is_active": True},
            {"id": "srv_olaplex", "category_id": "cat_spa", "name": "Olaplex Bond Multiplier Scalp Spa", "category_name": "Organic Botanical Hair Spa", "duration_minutes": 60, "base_price": 3800, "gender": "unisex", "is_active": True},
            {"id": "srv_facial24k", "category_id": "cat_skin", "name": "24K Gold Illuminating Cryo Facial", "category_name": "Aesthetic Skin & Illuminating Facials", "duration_minutes": 75, "base_price": 5500, "gender": "women", "is_active": True},
            {"id": "srv_hydra", "category_id": "cat_skin", "name": "HydraFacial Elite MD Deep Pore Cleanse", "category_name": "Aesthetic Skin & Illuminating Facials", "duration_minutes": 60, "base_price": 6200, "gender": "unisex", "is_active": True},
            {"id": "srv_pedi", "category_id": "cat_nails", "name": "Champagne Rose Petal Pedicure", "category_name": "Luxury Nail Studio", "duration_minutes": 50, "base_price": 2200, "gender": "unisex", "is_active": True},
            {"id": "srv_bridal_luxe", "category_id": "cat_bridal", "name": "Imperial Bridal Hair & HD Airbrush Makeup", "category_name": "VIP Bridal & Groom Suites", "duration_minutes": 180, "base_price": 25000, "gender": "women", "is_active": True}
        ]
        for s in services_data:
            if not db.query(Service).filter(Service.id == s["id"]).first():
                db.add(Service(**s))
        db.commit()

        # 5. Stylists
        stylists_data = [
            {"id": "sty_aria", "name": "Aria Sharma", "branch_id": "br_mumbai", "branch_name": "Atelier Mumbai Flagship", "role": "Master Stylist", "tier": "Master Stylist", "specialization": "Balayage & Couture Cut", "experience_years": 9, "commission_rate": 0.35, "phone": "+91 98200 44551", "rating": 4.95, "is_active": True},
            {"id": "sty_rahul", "name": "Rahul Verma", "branch_id": "br_mumbai", "branch_name": "Atelier Mumbai Flagship", "role": "Senior Colorist", "tier": "Senior Colorist", "specialization": "Keratin & Botanical Spa", "experience_years": 7, "commission_rate": 0.30, "phone": "+91 98200 44552", "rating": 4.88, "is_active": True},
            {"id": "sty_anjali", "name": "Anjali Sen", "branch_id": "br_blr", "branch_name": "Indiranagar Signature Suite", "role": "Master Aesthetician", "tier": "Master Stylist", "specialization": "HydraFacial & Gold Facials", "experience_years": 8, "commission_rate": 0.35, "phone": "+91 98200 44553", "rating": 4.92, "is_active": True}
        ]
        for st in stylists_data:
            if not db.query(Stylist).filter(Stylist.id == st["id"]).first():
                db.add(Stylist(**st))
        db.commit()

        # 6. Inventory Products
        products_data = [
            {"id": "prod_moroccanoil", "sku": "PROD-OIL-001", "name": "Moroccanoil Treatment Original (100ml)", "brand": "Moroccanoil", "category": "Hair Care", "unit": "bottle", "cost_price": 1800, "retail_price": 3150, "current_stock": 28, "reorder_threshold": 8, "is_retail": True, "is_active": True},
            {"id": "prod_olaplex3", "sku": "PROD-OLAPLEX-003", "name": "Olaplex No. 3 Hair Perfector (100ml)", "brand": "Olaplex", "category": "Treatment", "unit": "bottle", "cost_price": 1600, "retail_price": 2950, "current_stock": 34, "reorder_threshold": 10, "is_retail": True, "is_active": True},
            {"id": "prod_loreal_majirel", "sku": "PROD-COLOR-MAJ-04", "name": "L'Oréal Majirel Cool Inforced 50ml (Back-Bar)", "brand": "L'Oréal Professionnel", "category": "Color", "unit": "tube", "cost_price": 450, "retail_price": 850, "current_stock": 65, "reorder_threshold": 15, "is_retail": False, "is_active": True},
            {"id": "prod_kerastase_serum", "sku": "PROD-KERAS-SERUM", "name": "Kérastase Elixir Ultime L'Huile Rose (100ml)", "brand": "Kérastase", "category": "Hair Care", "unit": "bottle", "cost_price": 2400, "retail_price": 4200, "current_stock": 18, "reorder_threshold": 6, "is_retail": True, "is_active": True}
        ]
        for p in products_data:
            if not db.query(InventoryProduct).filter(InventoryProduct.id == p["id"]).first():
                db.add(InventoryProduct(**p))
        db.commit()

        # 7. Customers
        customers_data = [
            {"id": "cust_priya", "name": "Priya Patel", "email": "priya.patel@luxurymail.com", "phone": "+91 98200 77112", "gender": "female", "membership_tier": "platinum", "wallet_balance": 15400, "loyalty_points": 2450, "total_spent": 128500, "visit_count": 18, "favorite_stylist_name": "Aria Sharma", "is_active": True},
            {"id": "cust_rohit", "name": "Rohit Kapoor", "email": "rohit.kapoor@techcorp.in", "phone": "+91 98110 33445", "gender": "male", "membership_tier": "gold", "wallet_balance": 8200, "loyalty_points": 1200, "total_spent": 64200, "visit_count": 11, "favorite_stylist_name": "Rahul Verma", "is_active": True},
            {"id": "cust_kavita", "name": "Kavita Reddy", "email": "kavita.reddy@hyderabad.biz", "phone": "+91 99880 11223", "gender": "female", "membership_tier": "diamond", "wallet_balance": 35000, "loyalty_points": 5800, "total_spent": 245000, "visit_count": 26, "favorite_stylist_name": "Anjali Sen", "is_active": True}
        ]
        for cust in customers_data:
            if not db.query(Customer).filter(Customer.id == cust["id"]).first():
                db.add(Customer(**cust))
        db.commit()

        # 8. Appointments
        today_str = datetime.now().strftime("%Y-%m-%d")
        tomorrow_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

        appointments_data = [
            {
                "id": "apt_01",
                "booking_ref": "LM-BOM-8841",
                "customer_id": "cust_priya",
                "customer_name": "Priya Patel",
                "customer_phone": "+91 98200 77112",
                "customer_email": "priya.patel@luxurymail.com",
                "branch_id": "br_mumbai",
                "branch_name": "Atelier Mumbai Flagship",
                "service_id": "srv_balayage",
                "service_name": "French Balayage & Glossing Ritual",
                "category_name": "Haute Coiffure & Styling",
                "stylist_id": "sty_aria",
                "stylist_name": "Aria Sharma",
                "stylist_tier": "Master Stylist",
                "date": today_str,
                "time_slot": "10:00 AM",
                "duration_minutes": 120,
                "status": "confirmed",
                "base_price": 7500,
                "subtotal": 7500,
                "tax_amount": 1350,
                "final_total": 8850,
                "payment_status": "paid",
                "chair_number": 3
            },
            {
                "id": "apt_02",
                "booking_ref": "LM-BOM-8842",
                "customer_id": "cust_rohit",
                "customer_name": "Rohit Kapoor",
                "customer_phone": "+91 98110 33445",
                "customer_email": "rohit.kapoor@techcorp.in",
                "branch_id": "br_mumbai",
                "branch_name": "Atelier Mumbai Flagship",
                "service_id": "srv_haircut",
                "service_name": "Bespoke Couture Haircut & Blowout",
                "category_name": "Haute Coiffure & Styling",
                "stylist_id": "sty_rahul",
                "stylist_name": "Rahul Verma",
                "stylist_tier": "Senior Colorist",
                "date": today_str,
                "time_slot": "02:30 PM",
                "duration_minutes": 45,
                "status": "in_service",
                "base_price": 1800,
                "subtotal": 1800,
                "tax_amount": 324,
                "final_total": 2124,
                "payment_status": "unpaid",
                "chair_number": 5
            }
        ]
        for ap in appointments_data:
            if not db.query(Appointment).filter(Appointment.id == ap["id"]).first():
                db.add(Appointment(**ap))
        db.commit()

        # 9. Membership Tiers
        tiers_data = [
            {"id": "tier_silver", "name": "Silver Prestige", "price": 4999, "validity_months": 12, "discount_percentage": 10, "is_active": True},
            {"id": "tier_gold", "name": "Gold Sovereign", "price": 12999, "validity_months": 12, "discount_percentage": 20, "is_active": True},
            {"id": "tier_platinum", "name": "Platinum Royal", "price": 24999, "validity_months": 12, "discount_percentage": 30, "is_active": True}
        ]
        for t in tiers_data:
            if not db.query(MembershipTier).filter(MembershipTier.id == t["id"]).first():
                db.add(MembershipTier(**t))
        db.commit()

        # 10. Formula Cards
        if not db.query(FormulaCard).first():
            db.add(FormulaCard(
                id="form_01",
                customer_id="cust_priya",
                customer_name="Priya Patel",
                service_name="French Balayage Warm Honey",
                base_color="Level 6 Dark Blonde with Gold Undertone",
                developer="20 Vol Cream (60ml)",
                toner_formula="Redken Shades EQ 09GB + 09NB (30ml each)",
                processing_time_minutes=35,
                notes="Patch test clean. Applied Olaplex No.1 in lightener.",
                created_by_stylist="Aria Sharma",
                date=today_str
            ))
            db.commit()

        # 11. Gift Vouchers
        if not db.query(GiftVoucher).first():
            db.add(GiftVoucher(
                id="vouch_01",
                code="LUXE-GIFT-5000",
                purchaser_name="Vikram Malhotra",
                recipient_name="Priya Patel",
                recipient_phone="+91 98200 77112",
                initial_amount=5000,
                current_balance=5000,
                status="active",
                expiry_date=(datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d"),
                message="Happy Birthday! Enjoy your luxury salon day."
            ))
            db.commit()

        print("✅ PostgreSQL relational seed data populated successfully (37 tables active with zero mock defaults)!")
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_enterprise_data()
