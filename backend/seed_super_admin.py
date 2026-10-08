#!/usr/bin/env python3
"""
Seed Super Admin Script for Salon OS Platform
----------------------------------------------
Creates or updates the Super Admin user in PostgreSQL with a bcrypt-hashed password.

Correct import paths matched to this backend:
  - src.core.config    -> settings
  - src.core.database  -> engine, SessionLocal, Base
  - src.models.erp     -> User
  - src.utils.security -> get_password_hash

Usage:
  python3 backend/seed_super_admin.py --email admin@salon.com --password Secret@123 --name "Platform Super Admin"
  
  Or via env vars:
  SUPER_ADMIN_EMAIL=admin@salon.com SUPER_ADMIN_PASSWORD=Secret@123 python3 backend/seed_super_admin.py
"""
import argparse
import sys
import os
import getpass
import urllib.parse

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# ── Make sure "backend/src" is importable ───────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ── Correct imports matched to actual backend paths ──────────────────────────
from src.core.config import settings          # ✓  was: src.config.settings
from src.core.database import engine, SessionLocal, Base  # ✓  was: src.database.session + src.database.base
from src.models.erp import User               # ✓  was: src.models.user
from src.utils.security import get_password_hash  # ✓  was: hash_password (doesn't exist)


# ── Step 1: Ensure the PostgreSQL database exists ────────────────────────────
def ensure_database_exists():
    try:
        db_url = settings.effective_database_url
        parsed = urllib.parse.urlparse(db_url)
        username  = parsed.username or "postgres"
        password  = urllib.parse.unquote(parsed.password) if parsed.password else ""
        hostname  = parsed.hostname or "localhost"
        port      = parsed.port or 5432
        dbname    = parsed.path.lstrip("/") or "salon"

        conn = psycopg2.connect(
            user=username, password=password,
            host=hostname, port=port,
            dbname="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s;", (dbname,))
        if not cur.fetchone():
            cur.execute(f'CREATE DATABASE "{dbname}";')
            print(f"[DB] Database '{dbname}' created.")
        else:
            print(f"[DB] Database '{dbname}' already exists.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"[DB] Warning during DB check: {e}")


# ── Step 2: Create all tables (safe — skips existing ones) ───────────────────
def init_tables():
    # Import ALL models so their metadata is registered before create_all
    import src.models.erp          # noqa: F401 – User, Company, ERPInvoice …
    import src.models.organization  # noqa: F401
    import src.models.salon         # noqa: F401
    import src.models.customer      # noqa: F401
    import src.models.appointment   # noqa: F401
    import src.models.hrms          # noqa: F401
    import src.models.inventory     # noqa: F401
    import src.models.marketing     # noqa: F401
    import src.models.pos           # noqa: F401
    import src.models.finance       # noqa: F401

    Base.metadata.create_all(bind=engine)
    print("[DB] All tables verified / created.")


# ── Step 3: Seed the Super Admin ─────────────────────────────────────────────
def seed_super_admin(email: str, password: str, name: str,
                     phone: str = None, avatar_url: str = None,
                     role: str = "admin"):
    ensure_database_exists()
    init_tables()

    db = SessionLocal()
    try:
        clean_email    = email.strip().lower()
        clean_name     = name.strip()
        clean_password = password.strip()
        clean_role     = role.strip().lower()   # stored lowercase to match auth.py
        hashed_pw      = get_password_hash(clean_password)

        existing = db.query(User).filter(User.email == clean_email).first()

        if existing:
            # Update existing record
            existing.name          = clean_name or existing.name
            existing.password_hash = hashed_pw
            existing.role          = clean_role
            existing.is_active     = True
            if phone:
                existing.phone = phone.strip()
            if avatar_url:
                existing.avatar = avatar_url.strip()
            user = existing
            action = "UPDATED"
        else:
            # Create new super admin
            user = User(
                email         = clean_email,
                password_hash = hashed_pw,
                name          = clean_name,
                role          = clean_role,
                phone         = phone.strip() if phone else None,
                avatar        = avatar_url.strip() if avatar_url else None,
                is_active     = True,
                is_verified   = True,
            )
            db.add(user)
            action = "CREATED"

        db.commit()
        db.refresh(user)

        print("\n" + "=" * 68)
        print("👑  SALON OS — SUPER ADMIN READY!")
        print("=" * 68)
        print(f"  Action        : {action}")
        print(f"  Email         : {user.email}")
        print(f"  Name          : {user.name}")
        print(f"  Role          : {user.role}")
        print(f"  Bcrypt Hash   : {user.password_hash[:30]}…")
        print(f"  Active        : {user.is_active}")
        print(f"  DB ID         : {user.id}")
        print("=" * 68)
        print("\n✅  You can now log in at the frontend with these credentials.\n")

    except Exception as e:
        db.rollback()
        print(f"\n❌  Error seeding Super Admin: {e}")
        raise
    finally:
        db.close()


# ── CLI ───────────────────────────────────────────────────────────────────────
def parse_args():
    p = argparse.ArgumentParser(description="Seed a Super Admin into the Salon OS PostgreSQL database.")
    p.add_argument("--email",    "-e", default=os.getenv("SUPER_ADMIN_EMAIL"),    help="Login email")
    p.add_argument("--password", "-p", default=os.getenv("SUPER_ADMIN_PASSWORD"), help="Plain-text password (will be bcrypt-hashed)")
    p.add_argument("--name",     "-n", default=os.getenv("SUPER_ADMIN_NAME", "Platform Super Admin"), help="Full name")
    p.add_argument("--phone",          default=os.getenv("SUPER_ADMIN_PHONE"),    help="Phone number (optional)")
    p.add_argument("--avatar",         default=os.getenv("SUPER_ADMIN_AVATAR"),   help="Avatar URL (optional)")
    p.add_argument("--role",           default=os.getenv("SUPER_ADMIN_ROLE", "admin"), help="Role (default: admin)")
    return p.parse_args()


def main():
    args = parse_args()

    email    = args.email
    password = args.password
    name     = args.name or "Platform Super Admin"

    # Interactive prompts if running in terminal
    if not email:
        if sys.stdin.isatty():
            email = input("Super Admin Email: ").strip()
        else:
            raise SystemExit("❌  SUPER_ADMIN_EMAIL is required.")

    if not password:
        if sys.stdin.isatty():
            password = getpass.getpass("Super Admin Password: ").strip()
        else:
            raise SystemExit("❌  SUPER_ADMIN_PASSWORD is required in non-interactive mode.")

    if not password:
        raise SystemExit("❌  Password cannot be empty.")

    seed_super_admin(
        email      = email,
        password   = password,
        name       = name,
        phone      = args.phone,
        avatar_url = args.avatar,
        role       = args.role,
    )


if __name__ == "__main__":
    main()
