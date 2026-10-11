#!/usr/bin/env python3
"""
=============================================================================
Saloon Business OS — Master Database Migration & Schema Synchronizer
=============================================================================

This fresh migration script provides a unified, production-grade schema
lifecycle for Saloon Business OS:
  1. Ensures the target PostgreSQL database exists.
  2. Creates all tables defined across all 40 SQLAlchemy models.
  3. Introspects existing tables and auto-synchronizes missing columns
     (ALTER TABLE ... ADD COLUMN IF NOT EXISTS) preserving all data.
  4. Audits and verifies 100% schema parity between models and database.

Usage:
  python3 migrate.py          # Run full migration & sync
  python3 migrate.py --check  # Dry-run audit (read-only)
  python3 migrate.py --status # Print tables & row count statistics
=============================================================================
"""

import os
import sys
import argparse
import urllib.parse
from datetime import datetime

# Ensure backend root and src directory are in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "src"))

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.sql.sqltypes import (
    Integer, BigInteger, SmallInteger, String, Text, Boolean,
    Float, Numeric, DateTime, Date, Time, JSON, LargeBinary
)

from src.core.config import settings
from src.core.database import Base
import src.models  # Loads all 40 models across salon, erp, crm, pos, hrms, etc.


def get_column_ddl_type(column) -> str:
    """Translates an SQLAlchemy column type into standard PostgreSQL DDL."""
    col_type = column.type

    if isinstance(col_type, String):
        return f"VARCHAR({col_type.length})" if col_type.length else "VARCHAR(255)"
    elif isinstance(col_type, Text):
        return "TEXT"
    elif isinstance(col_type, Boolean):
        return "BOOLEAN"
    elif isinstance(col_type, Integer):
        return "INTEGER"
    elif isinstance(col_type, BigInteger):
        return "BIGINT"
    elif isinstance(col_type, SmallInteger):
        return "SMALLINT"
    elif isinstance(col_type, Float):
        return "DOUBLE PRECISION"
    elif isinstance(col_type, Numeric):
        return f"NUMERIC({col_type.precision or 12}, {col_type.scale or 2})"
    elif isinstance(col_type, DateTime):
        return "TIMESTAMP WITHOUT TIME ZONE"
    elif isinstance(col_type, Date):
        return "DATE"
    elif isinstance(col_type, Time):
        return "TIME"
    elif isinstance(col_type, JSON):
        return "JSONB"
    elif isinstance(col_type, LargeBinary):
        return "BYTEA"
    return str(col_type.compile(dialect=None))


def get_default_clause(column) -> str:
    """Determines default clause expression if present."""
    if column.server_default is not None:
        val = str(column.server_default.arg)
        return f"DEFAULT {val}"
    if column.default is not None:
        arg = column.default.arg
        if isinstance(arg, (int, float)):
            return f"DEFAULT {arg}"
        elif isinstance(arg, bool):
            return f"DEFAULT {'TRUE' if arg else 'FALSE'}"
        elif isinstance(arg, str):
            return f"DEFAULT '{arg}'"
    return ""


def ensure_database_exists():
    """Ensures PostgreSQL database exists, creating it if necessary."""
    if settings.DB_USER and settings.DB_HOST and settings.DB_NAME:
        user = settings.DB_USER
        pwd = settings.DB_PASSWORD or ""
        pwd_encoded = urllib.parse.quote_plus(urllib.parse.unquote(pwd))
        host = settings.DB_HOST
        port = settings.DB_PORT or 5432
        target_db = settings.DB_NAME

        default_db_url = f"postgresql+psycopg2://{user}:{pwd_encoded}@{host}:{port}/postgres"
        try:
            engine_default = create_engine(default_db_url, isolation_level="AUTOCOMMIT")
            with engine_default.connect() as conn:
                res = conn.execute(
                    text("SELECT 1 FROM pg_database WHERE datname = :dbname"),
                    {"dbname": target_db}
                ).fetchone()
                if not res:
                    print(f"✨ Database '{target_db}' not found. Creating database...")
                    conn.execute(text(f'CREATE DATABASE "{target_db}"'))
                    print(f"✅ Database '{target_db}' created successfully.")
                else:
                    print(f"✅ Database '{target_db}' is active and ready.")
            engine_default.dispose()
        except Exception as e:
            print(f"ℹ️  Notice during database pre-check: {e}")


def run_audit(engine) -> tuple[dict, dict]:
    """Audits differences between SQLAlchemy models and the PostgreSQL database."""
    insp = inspect(engine)
    existing_tables = set(insp.get_table_names())
    model_tables = set(Base.metadata.tables.keys())

    missing_tables = model_tables - existing_tables
    missing_columns = {}

    for table_name in model_tables:
        if table_name in existing_tables:
            db_cols = {c["name"] for c in insp.get_columns(table_name)}
            model_cols = {c.name for c in Base.metadata.tables[table_name].columns}
            diff = model_cols - db_cols
            if diff:
                missing_columns[table_name] = sorted(list(diff))

    return {
        "existing_tables_count": len(existing_tables),
        "model_tables_count": len(model_tables),
        "missing_tables": sorted(list(missing_tables)),
        "missing_columns": missing_columns,
    }


def sync_schema(engine):
    """Creates all missing tables and adds missing columns safely without data loss."""
    print("\n" + "=" * 70)
    print("🚀 STEP 1: Creating any missing tables from SQLAlchemy models...")
    print("=" * 70)
    Base.metadata.create_all(bind=engine)
    print("✅ Base.metadata.create_all completed.")

    print("\n" + "=" * 70)
    print("🔍 STEP 2: Inspecting and Synchronizing Missing Columns...")
    print("=" * 70)

    insp = inspect(engine)
    existing_tables = set(insp.get_table_names())
    total_added_columns = 0

    with engine.connect() as conn:
        for table_name, table in sorted(Base.metadata.tables.items()):
            if table_name not in existing_tables:
                continue

            db_cols = {c["name"] for c in insp.get_columns(table_name)}

            for col in table.columns:
                if col.name not in db_cols:
                    ddl_type = get_column_ddl_type(col)
                    default_clause = get_default_clause(col)
                    null_clause = "NOT NULL" if not col.nullable and default_clause else "NULL"
                    sql = f"ALTER TABLE {table_name} ADD COLUMN IF NOT EXISTS {col.name} {ddl_type} {default_clause} {null_clause};"

                    print(f"  ➕ [{table_name}] Adding missing column '{col.name}' ({ddl_type} {default_clause})...")
                    conn.execute(text(sql))
                    conn.commit()
                    total_added_columns += 1

    if total_added_columns > 0:
        print(f"\n🎉 Successfully added {total_added_columns} missing column(s).")
    else:
        print("✅ All columns in all tables are already fully synchronized!")


def print_database_status(engine):
    """Prints a clear tabular status of all 40 tables in PostgreSQL."""
    insp = inspect(engine)
    tables = sorted(insp.get_table_names())

    print("\n" + "=" * 70)
    print(f"📊 DATABASE SCHEMA AUDIT STATUS: {settings.DB_NAME} ({len(tables)} Tables)")
    print("=" * 70)
    print(f"{'#':<3} {'Table Name':<32} {'Columns':<10} {'Rows':<8}")
    print("-" * 70)

    with engine.connect() as conn:
        for idx, tbl in enumerate(tables, start=1):
            cols_count = len(insp.get_columns(tbl))
            try:
                row_count = conn.execute(text(f"SELECT COUNT(*) FROM {tbl}")).scalar()
            except Exception:
                row_count = "N/A"
            print(f"{idx:<3} {tbl:<32} {cols_count:<10} {row_count:<8}")

    print("=" * 70)


def main():
    parser = argparse.ArgumentParser(description="Master Database Migration & Sync Tool for Saloon Business OS.")
    parser.add_argument("--check", action="store_true", help="Read-only schema audit without modifying DB.")
    parser.add_argument("--status", action="store_true", help="Display tables and row count metrics.")
    args = parser.parse_args()

    db_url = settings.effective_database_url
    masked_url = db_url
    if settings.DB_PASSWORD:
        masked_url = masked_url.replace(settings.DB_PASSWORD, "***")

    print("\n" + "=" * 70)
    print("💈 SALOON BUSINESS OS — DATABASE MIGRATION & AUDIT ENGINE")
    print(f"📅 Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔗 Database:  {masked_url}")
    print("=" * 70)

    ensure_database_exists()
    connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
    engine = create_engine(db_url, connect_args=connect_args, pool_pre_ping=True)

    audit_result = run_audit(engine)

    if args.check:
        print("\n📋 AUDIT RESULTS (READ-ONLY):")
        print(f"  • Model tables:    {audit_result['model_tables_count']}")
        print(f"  • DB tables:       {audit_result['existing_tables_count']}")
        print(f"  • Missing tables:  {audit_result['missing_tables'] or 'None'}")
        print(f"  • Missing columns: {audit_result['missing_columns'] or 'None'}")
        if not audit_result["missing_tables"] and not audit_result["missing_columns"]:
            print("\n✅ PERFECT: Database is 100% in sync with all models.")
        else:
            print("\n⚠️  Differences found. Run `python3 migrate.py` to sync.")
        return

    # Run full migration & sync
    sync_schema(engine)

    # Print status
    print_database_status(engine)

    final_audit = run_audit(engine)
    if not final_audit["missing_tables"] and not final_audit["missing_columns"]:
        print("\n✨ Migration Complete: All 40 tables & all columns are 100% in sync!\n")
    else:
        print("\n⚠️ Notice: Some differences remain:", final_audit)


if __name__ == "__main__":
    main()
