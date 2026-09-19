import os
import sys
import urllib.parse
from sqlalchemy import create_engine, text, inspect

# Add src to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "src")))

from src.core.config import settings
import src.models # Ensure all models are loaded
from src.core.database import Base

def ensure_database_exists():
    """
    If using PostgreSQL, connects to the default 'postgres' database
    and creates the target database if it doesn't already exist.
    """
    if settings.DB_USER and settings.DB_HOST and settings.DB_NAME:
        user = settings.DB_USER
        pwd = settings.DB_PASSWORD or ""
        pwd_raw = urllib.parse.unquote(pwd)
        pwd_encoded = urllib.parse.quote_plus(pwd_raw)
        host = settings.DB_HOST
        port = settings.DB_PORT or 5432
        target_db = settings.DB_NAME

        # Connect to default postgres DB with autocommit
        default_db_url = f"postgresql+psycopg2://{user}:{pwd_encoded}@{host}:{port}/postgres"
        try:
            print(f"🔍 Checking PostgreSQL server at {host}:{port}...")
            engine_default = create_engine(default_db_url, isolation_level="AUTOCOMMIT")
            with engine_default.connect() as conn:
                result = conn.execute(
                    text("SELECT 1 FROM pg_database WHERE datname = :dbname"),
                    {"dbname": target_db}
                ).fetchone()

                if not result:
                    print(f"✨ Database '{target_db}' does not exist. Creating it now...")
                    conn.execute(text(f'CREATE DATABASE "{target_db}"'))
                    print(f"✅ Database '{target_db}' created successfully.")
                else:
                    print(f"✅ Database '{target_db}' already exists.")
            engine_default.dispose()
        except Exception as e:
            print(f"⚠️ Notice during DB existence check: {e}")

def create_all_tables():
    ensure_database_exists()
    
    db_url = settings.effective_database_url
    masked_url = db_url
    if settings.DB_PASSWORD:
        masked_url = masked_url.replace(settings.DB_PASSWORD, "***")
    print(f"\n📦 Connecting to: {masked_url}")

    connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
    engine = create_engine(db_url, connect_args=connect_args, pool_pre_ping=True)

    print("🚀 Creating all database tables from SQLAlchemy models...")
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    print(f"\n🎉 Successfully created {len(table_names)} tables in '{settings.DB_NAME or 'saloon'}':")
    for idx, table in enumerate(sorted(table_names), start=1):
        print(f"  {idx:2d}. {table}")

    print("\n✅ Database initialization complete! All tables are ready without any hardcoded data.")

if __name__ == "__main__":
    create_all_tables()
