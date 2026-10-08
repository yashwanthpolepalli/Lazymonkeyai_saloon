import os
import sys

# Add src to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "src")))

from src.core.database import SessionLocal, engine, Base
import src.models  # Ensure all SQLAlchemy models are registered on Base.metadata

def init_relational_database():
    """
    Initializes PostgreSQL database tables cleanly.
    Zero hardcoded mock data or fake records are injected.
    All data is created and managed dynamically via REST APIs.
    """
    print("🚀 Initializing PostgreSQL relational schema (Zero Hardcoded Mock Defaults)...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ PostgreSQL relational tables created successfully and ready for dynamic operations!")
    except Exception as e:
        print(f"❌ Error initializing database schema: {e}")

if __name__ == "__main__":
    init_relational_database()
