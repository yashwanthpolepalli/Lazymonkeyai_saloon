# Saloon & BusinessOS AI

A full-stack, enterprise-grade Salon Management and Business Operating System engineered with **React + TypeScript (Vite)** on the frontend and **FastAPI + PostgreSQL (SQLAlchemy)** on the backend.

---

## 🌟 Key Features

- **Multi-Branch Operations**: Real-time management across multiple salon outlets with multi-currency and local tax support.
- **Dynamic Relational Backend**: Automated PostgreSQL schema provisioning with complete REST APIs for all salon verticals.
- **Enterprise POS & Billing**: Fast point-of-sale checkout, split payments, coupon validation, free gift rules, and thermal/PDF receipt generation.
- **Staff & HRMS**: Stylist commissions, tiered incentive structures, shift scheduling, and attendance tracking.
- **Client CRM & 360° Profiles**: Membership tiers (Rose Silver, Gold, Black Diamond), client beauty profiles, visit histories, and loyalty wallets.
- **Inventory & Supply Chain**: Multi-warehouse stock tracking, vendor purchase orders, automated low-stock reorder triggers, and usage auditing.
- **Financial Analytics & ERP**: Profit & loss statement breakdown, expense tracking, daily registers, and revenue projections.

---

## 🚀 Architecture & Tech Stack

```
saloon/
├── backend/                  # FastAPI & SQLAlchemy Backend
│   ├── src/
│   │   ├── api/v1/          # Modular API endpoints (branches, hrms, crm, pos, erp, inventory)
│   │   ├── core/            # Database config, security, settings
│   │   ├── models/          # SQLAlchemy dynamic relational models
│   │   └── schemas/         # Pydantic v2 validation schemas
│   ├── run.py               # Uvicorn entry point
│   └── requirements.txt     # Python dependencies
│
└── frontend/                 # React 18 + Vite + TypeScript Frontend
    ├── src/
    │   ├── components/      # UI components & modern glassmorphism design system
    │   ├── context/         # SalonContext (state management & backend synchronization)
    │   ├── services/        # Axios API clients for FastAPI integration
    │   └── types/           # TypeScript interfaces & domain models
    └── package.json         # Node dependencies
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **PostgreSQL** running locally on port `5432`

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (optional)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Update DATABASE_URL in .env with your PostgreSQL credentials

# Start the FastAPI server
python run.py
```
> Backend API will start at: `http://localhost:8000`  
> Interactive Swagger API docs: `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
> Frontend application will start at: `http://localhost:3000`

---

## 📄 License

Proprietary & Confidential © 2026 LazyMonkey AI / Saloon. All rights reserved.
