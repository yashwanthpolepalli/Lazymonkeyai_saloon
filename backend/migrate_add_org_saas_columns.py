"""
Migration: Add SaaS subscription columns to organizations table.
Columns: subscription_tier, mrr, ai_credits_limit, ai_credits_used, renewal_date

Run once: python migrate_add_org_saas_columns.py
"""
import os, sys, urllib.parse
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "src")))

from sqlalchemy import create_engine, text
from src.core.config import settings

db_url = settings.effective_database_url
engine = create_engine(db_url, pool_pre_ping=True)

COLUMNS = [
    # (column_name, ddl_type, default_expression)
    ("subscription_tier", "VARCHAR(100)", "'Starter'"),
    ("mrr",               "DOUBLE PRECISION", "0.0"),
    ("ai_credits_limit",  "INTEGER",          "1000"),
    ("ai_credits_used",   "INTEGER",          "0"),
    ("renewal_date",      "VARCHAR(50)",      "NULL"),
]

with engine.connect() as conn:
    # Check existing columns
    result = conn.execute(text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name = 'organizations'"
    ))
    existing = {row[0] for row in result}
    print(f"Existing columns: {sorted(existing)}\n")

    for col, dtype, default in COLUMNS:
        if col in existing:
            print(f"  ✅ Column already exists: {col}")
        else:
            default_clause = f"DEFAULT {default}" if default != "NULL" else ""
            sql = f"ALTER TABLE organizations ADD COLUMN {col} {dtype} {default_clause};"
            print(f"  ➕ Adding column: {col}  ({dtype}) ...")
            conn.execute(text(sql))
            conn.commit()
            print(f"     ✅ Done.")

    # Back-fill NULL values with defaults for existing rows
    print("\nBack-filling NULL values for existing rows ...")
    conn.execute(text(
        "UPDATE organizations SET "
        "  subscription_tier = COALESCE(subscription_tier, 'Starter'), "
        "  mrr               = COALESCE(mrr, 0.0), "
        "  ai_credits_limit  = COALESCE(ai_credits_limit, 1000), "
        "  ai_credits_used   = COALESCE(ai_credits_used, 0) "
        "WHERE subscription_tier IS NULL OR mrr IS NULL OR ai_credits_limit IS NULL OR ai_credits_used IS NULL"
    ))
    conn.commit()
    print("✅ Back-fill complete.\n")

print("🎉 Migration finished — all SaaS columns are now present in 'organizations'.")
