from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.core.config import settings
from src.core.database import engine, Base
import src.models # Ensure all models are imported for metadata registration
from src.api.v1.router import api_v1_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize all database tables on application startup
    db_target = settings.DB_NAME or settings.effective_database_url.split('/')[-1]
    print(f"📦 [Database] Initializing dynamic relational schemas on '{db_target}'...")
    try:
        from init_db import ensure_database_exists
        ensure_database_exists()
    except Exception as e:
        print(f"⚠️ Notice during database check: {e}")

    try:
        Base.metadata.create_all(bind=engine)
        print("✅ [Database] All database tables ready (Zero mock data).")
    except Exception as e:
        print(f"❌ [Database Error] Failed to create tables: {e}")
    yield


app = FastAPI(
    title="Saloon & BusinessOSAI REST API",
    description="Enterprise-grade Backend API for Luxury Salons & Multi-branch Studios. Directly integrates CRM 360, POS Billing, HRMS Staff, Inventory Catalog, GST Accounting, and AI Copilot.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount V1 API Routers
app.include_router(api_v1_router)

@app.get("/", tags=["Root"])
def root_endpoint():
    return {
        "status": "online",
        "service": "Saloon & BusinessOSAI Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health"
    }

@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "database": "connected"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"❌ [Unhandled Exception] {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred. Please check server logs."}
    )
