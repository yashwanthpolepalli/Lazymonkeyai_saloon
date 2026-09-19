# Saloon & BusinessOSAI - Backend API (FastAPI)

Enterprise-grade, modular Python FastAPI backend designed specifically for luxury salons, multi-branch hair studios, and spa management platforms. 

Built with **FastAPI**, **SQLAlchemy 2.0**, **Pydantic v2**, and **JWT Authentication**, mapped directly to the frontend reactive data layers.

---

## 📂 Architecture Overview

```
backend/
├── requirements.txt                       # Python dependencies
├── .env.example                           # Environment configuration template
├── run.py                                 # Server startup script
│
└── src/
    ├── main.py                            # FastAPI entry point, CORS, Lifespan table creation
    │
    ├── 📁 api/                            # REST API Routing Layer
    │   ├── deps.py                        # Auth dependencies, DB sessions, RBAC guards
    │   └── v1/
    │       ├── router.py                  # Main V1 Router Aggregator
    │       ├── auth.py                    # /auth (Register, Login, Me)
    │       ├── branches.py                # /branches (Studio & Franchise branches)
    │       ├── services.py                # /services & /categories (Catalog CRUD)
    │       ├── stylists.py                # /stylists (Staff tiers & schedules)
    │       ├── appointments.py            # /appointments (Bookings, Reschedule, Lifecycle)
    │       ├── inventory.py               # /inventory (Master catalog & stock adjustments)
    │       ├── marketing.py               # /marketing (Campaigns & Coupons)
    │       ├── finance.py                 # /finance (Expenses & P&L)
    │       ├── copilot.py                 # /copilot (AI Assistant Query Engine)
    │       ├── notifications.py           # /notifications (Live notices & alerts)
    │       ├── system_settings.py         # /settings (Branding, GST, MFA, Profile)
    │       │
    │       ├── 📂 hrms/                   # HRMS Core Sub-Modules
    │       │   ├── employees.py           # /hrms/employees (Staff directory & roster)
    │       │   ├── attendance.py          # /hrms/attendance (Punch clock-in/out, shift hours)
    │       │   ├── leaves.py              # /hrms/leaves (Leave requests & balances)
    │       │   ├── payroll.py             # /hrms/payroll (Monthly salary slip generation)
    │       │   ├── performance.py         # /hrms/performance (Matrix & Reviews)
    │       │   ├── learning.py            # /hrms/learning (Staff training LMS)
    │       │   ├── recruitment.py         # /hrms/recruitment (Job openings & applicants)
    │       │   ├── intelligence.py        # /hrms/intelligence (Workforce analytics)
    │       │   └── exit_management.py    # /hrms/exit (Offboarding & resignations)
    │       │
    │       ├── 📂 erp/                    # ERP & Accounting Modules
    │       │   ├── invoices.py            # /erp/invoices (Tax invoices & history)
    │       │   ├── accounting.py          # /erp/accounting (General ledger & financial summary)
    │       │   ├── gst_filing.py          # /erp/tax/summary (GST, CGST, SGST, IGST totals)
    │       │   ├── vouchers.py            # /erp/vouchers (Journal & payment vouchers)
    │       │   └── fixed_assets.py        # /erp/fixed_assets (Salon equipment tracking)
    │       │
    │       ├── 📂 crm_modules/            # CRM & Customer Engagement
    │       │   ├── customers.py           # /crm/customers & Wallet top-up
    │       │   ├── memberships.py         # /crm_modules/memberships (VIP Tiers)
    │       │   ├── loyalty.py             # /crm_modules/loyalty (Points & Rewards)
    │       │   ├── segments.py            # /crm_modules/segments (Cohort distribution)
    │       │   ├── whatsapp_automation.py # /crm_modules/whatsapp (Cloud API messaging)
    │       │   ├── leads.py               # /crm/leads (Inquiries & conversions)
    │       │   └── tickets.py             # /tickets (Customer support tickets & chat)
    │       │
    │       └── 📂 pos/                    # Point of Sale & Billing
    │           ├── transactions.py        # /pos/transactions (Cart checkout, split payments)
    │           ├── products.py            # /pos/products (POS quick-select catalog)
    │           ├── sessions.py            # /pos/sessions (Cash register reconciliation)
    │           └── free_qty_rules.py      # /pos/free_qty_rules (BOGO promotions)
    │
    ├── 📁 core/                           # Database & Config
    │   ├── config.py                      # Pydantic Settings (.env loader)
    │   └── database.py                    # SQLAlchemy Engine, SessionLocal & get_db
    │
    ├── 📁 models/                         # Database Models (SQLAlchemy ORM)
    │   ├── base.py                        # TimeStamped UUID base model
    │   ├── salon.py                       # Branches, Categories, Services, Stylists, TimeSlots
    │   ├── customer.py                    # Customers, Memberships, Wallet, Loyalty
    │   ├── appointment.py                 # Bookings, Feedbacks, Pricing state
    │   ├── pos.py                         # Cash sessions, BOGO promotional rules
    │   ├── inventory.py                   # Master products & stock movement audit logs
    │   ├── hrms.py                        # Employees, Attendance, Leaves, Payroll
    │   ├── marketing.py                   # Campaigns, Coupons, Leads
    │   ├── finance.py                     # Financial expenses & records
    │   ├── customer_service.py            # Support tickets & chat messages
    │   ├── settings.py                    # Brand customizations, GST config, MFA
    │   └── erp.py                         # Invoices, Companies, Users, Ledger
    │
    ├── 📁 schemas/                        # Pydantic Request/Response DTO Schemas
    │   ├── auth.py
    │   ├── salon.py
    │   ├── customer.py
    │   ├── appointment.py
    │   ├── pos.py
    │   ├── inventory.py
    │   ├── hrms.py
    │   ├── marketing.py
    │   ├── finance.py
    │   ├── customer_service.py
    │   └── settings.py
    │
    ├── 📁 services/                       # Business Logic & Calculation Engines
    │   ├── pricing_engine.py              # Dynamic price, tier markup, discount & GST calculation
    │   ├── invoice_pdf.py                 # HTML/PDF invoice generation
    │   ├── razorpay_service.py            # Online payment gateway
    │   ├── pinelabs_service.py            # Physical POS card terminal processor
    │   ├── whatsapp_service.py            # WhatsApp Cloud API automated notifications
    │   └── copilot_service.py             # Salon AI Copilot engine
    │
    ├── 📁 integrations/                   # External Connectors
    │   ├── recruitment_provider.py        # External job board sync
    │   └── zoho/sync.py                   # Zoho Books sync
    │
    └── 📁 utils/                          # Utilities & Middleware
        ├── security.py                    # Bcrypt hashing & JWT token encode/decode
        ├── rbac_policy.py                 # RBAC permission checks
        ├── redis_cache.py                 # In-memory & Redis cache manager
        ├── pagination.py                  # Standard pagination helpers
        └── number_series.py               # Auto-numbering for invoices, bookings, codes
```

---

## 🚀 Quick Start

### 1. Create and Activate a Python Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` (optional; defaults to local SQLite `sqlite:///./saloon.db`):

```bash
cp .env.example .env
```

### 4. Run the Backend Server

```bash
python run.py
```

The server starts on **`http://localhost:8000`** with auto-reload enabled in development mode.

---

## 📖 API Documentation & Swagger UI

Once running, access interactive API documentation in your browser:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
