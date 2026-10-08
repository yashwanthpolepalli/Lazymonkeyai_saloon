import csv
import io
import time
import uuid
import json
import re
from typing import Optional, Any, List, Dict
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from src.core.database import get_db
from src.models.salon import Service, ServiceCategory
from src.models.customer import Customer
from src.models.inventory import InventoryProduct

router = APIRouter(prefix="/bulk-import", tags=["Bulk CSV Stream Importer"])


def _clean_str(val: Any) -> str:
    if val is None:
        return ""
    if isinstance(val, (list, tuple)):
        return ", ".join(str(v) for v in val if v)
    if isinstance(val, dict):
        return ""
    return str(val).strip()


def _get_dynamic(row: dict, *candidate_keys: str) -> Any:
    """Finds first matching key in row with case-insensitivity, space/underscore stripping."""
    # 1. Direct key match
    for k in candidate_keys:
        if k in row and row[k] is not None and row[k] != "" and row[k] != []:
            return row[k]

    # 2. Lowercase / snake_case normalized matching
    normalized_row = {}
    for k, v in row.items():
        if v is not None and v != "" and v != []:
            norm = k.lower().replace(" ", "_").replace("-", "_").split("(")[0].strip("_")
            if norm not in normalized_row:
                normalized_row[norm] = v

    for k in candidate_keys:
        norm_k = k.lower().replace(" ", "_").replace("-", "_").split("(")[0].strip("_")
        if norm_k in normalized_row:
            return normalized_row[norm_k]

    return None


def _extract_name(row: dict, data_type: str, idx: int = 0) -> str:
    """Extracts a display name from any open dataset or salon catalog format."""
    candidates = [
        "service_name", "product_name", "product_name_en", "product_name_fr",
        "generic_name", "item_name", "treatment_name", "title", "name",
        "treatment", "service", "item", "product", "label", "client_name",
        "customer_name", "full_name", "first_name"
    ]
    val = _get_dynamic(row, *candidates)
    if val and _clean_str(val):
        return _clean_str(val)

    # Fallbacks: brand + code or id
    brand = _clean_str(_get_dynamic(row, "brand", "brands", "vendor", "supplier"))
    code = _clean_str(_get_dynamic(row, "code", "_id", "id", "sku", "barcode"))
    if brand and code:
        return f"{brand} #{code}"
    if code:
        return f"Item #{code}"
    if brand:
        return f"{brand} Treatment"

    # Description fallback
    desc = _clean_str(_get_dynamic(row, "short_desc", "description", "details", "summary"))
    if desc:
        return desc[:40].strip() + ("..." if len(desc) > 40 else "")

    return f"Salon {data_type.capitalize()} #{idx + 1}"


def _extract_category(row: dict, default_cat: str = "Hair Couture & Styling") -> str:
    """Extracts clean category name from text, lists, or tags."""
    candidates = [
        "category", "categories", "category_name", "categories_tags",
        "categories_hierarchy", "main_category", "department", "dept",
        "group", "pnns_groups_1", "pnns_groups_2", "brand", "brands",
        "product_type", "type"
    ]
    val = _get_dynamic(row, *candidates)
    if val is not None:
        if isinstance(val, list) and len(val) > 0:
            for item in val:
                clean = _clean_str(item).replace("en:", "").replace("fr:", "").replace("-", " ").title().strip()
                if clean and clean.lower() not in ["unknown", "none", "null", "not applicable", ""]:
                    return clean[:60]
        elif isinstance(val, str) and val.strip():
            # could be comma-separated
            parts = val.split(",")
            for p in parts:
                clean = p.replace("en:", "").replace("fr:", "").replace("-", " ").title().strip()
                if clean and clean.lower() not in ["unknown", "none", "null", "not applicable", ""]:
                    return clean[:60]

    return default_cat


def _extract_price(row: dict, default_price: float = 1800.0) -> float:
    """Extracts price with fallback to a realistic salon value."""
    candidates = [
        "base_price", "price", "retail_price", "cost_price", "mrp",
        "rate", "amount", "value", "cost", "unit_price", "sale_price",
        "base_price_inr", "retail_price_inr"
    ]
    val = _get_dynamic(row, *candidates)
    if val is not None and val != "":
        try:
            # Strip currency symbols if present e.g. "₹2500" or "$45"
            cleaned = re.sub(r"[^\d.]", "", str(val))
            f = float(cleaned)
            if f > 0:
                return f
        except (ValueError, TypeError):
            pass
    return default_price


def _extract_gender(row: dict, name_text: str = "") -> List[str]:
    """Extracts gender target, falling back to scanning text for keywords."""
    val = _get_dynamic(row, "gender", "audience", "target", "for", "sex")
    text_to_scan = (str(val or "") + " " + name_text).lower()

    if any(w in text_to_scan for w in ["women", "woman", "femme", "ladies", "female", "she", "girl"]):
        if any(w in text_to_scan for w in ["men", "man", "homme", "gents", "male", "barber"]):
            return ["women", "men", "unisex"]
        return ["women"]
    if any(w in text_to_scan for w in ["men", "man", "homme", "gents", "male", "barber", "beard"]):
        return ["men"]
    if any(w in text_to_scan for w in ["kid", "child", "enfant", "baby"]):
        return ["kids"]

    return ["unisex"]


def _extract_image(row: dict) -> str:
    """Extracts image URL from standard or nested dataset formats."""
    img = _get_dynamic(row, "image", "image_url", "image_front_url", "image_small_url", "photo", "picture", "thumbnail")
    if img and isinstance(img, str) and img.startswith("http"):
        return img

    # Check OpenBeautyFacts nested images
    images_dict = row.get("images")
    if isinstance(images_dict, dict):
        for k, v in images_dict.items():
            if isinstance(v, dict):
                sizes = v.get("sizes")
                if isinstance(sizes, dict):
                    for size_key in ["400", "full", "200", "100"]:
                        if size_key in sizes and isinstance(sizes[size_key], dict) and "url" in sizes[size_key]:
                            return sizes[size_key]["url"]

    return "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80"


def _extract_duration(row: dict, default_mins: int = 45) -> int:
    val = _get_dynamic(row, "duration", "duration_minutes", "time", "mins", "minutes", "length")
    if val is not None and val != "":
        try:
            cleaned = re.sub(r"[^\d.]", "", str(val))
            d = int(float(cleaned))
            if d > 0:
                return min(max(d, 10), 360)
        except Exception:
            pass
    return default_mins


def _extract_desc(row: dict) -> str:
    candidates = [
        "short_desc", "description", "ingredients_text", "ingredients_text_en",
        "ingredients_text_fr", "generic_name", "full_desc", "details", "summary", "notes"
    ]
    val = _get_dynamic(row, *candidates)
    clean = _clean_str(val)
    if clean:
        return clean[:1000]
    return "Luxury salon treatment and bespoke professional consultation."


def _ensure_category(db: Session, cat_name: str, org_id: Optional[str], cache: dict) -> str:
    """Return category_id for cat_name, creating the row if needed."""
    key = cat_name.lower().strip()
    if key in cache:
        return cache[key]
    new_cat = ServiceCategory(
        id=str(uuid.uuid4()),
        name=cat_name[:80],
        slug=cat_name.lower().replace(" ", "-").replace("&", "and")[:50] + f"-{str(uuid.uuid4())[:4]}",
        organization_id=org_id,
        is_active=True,
    )
    db.add(new_cat)
    db.flush()
    cache[key] = new_cat.id
    return new_cat.id


@router.post("/upload")
async def bulk_upload_csv_stream(
    file: UploadFile = File(...),
    data_type: str = Form("services"), # services | customers | inventory
    mode: str = Form("append"), # append | replace
    organization_id: Optional[str] = Form(None),
    branch_id: Optional[str] = Form(None),
    max_records: Optional[int] = Form(10000), # safety limit for single web upload
    db: Session = Depends(get_db)
):
    """
    High-Performance Universal Streaming Ingestor.
    Supports CSV, JSONL, NDJSON, OpenBeautyFacts, OpenFoodFacts, and custom JSON datasets of any size.
    """
    is_jsonl = file.filename.lower().endswith(('.jsonl', '.ndjson', '.json'))
    is_csv = file.filename.lower().endswith(('.csv', '.txt'))

    start_time = time.time()
    batch_size = 1000
    rows_processed = 0
    rows_inserted = 0
    rows_skipped = 0

    # Seed category cache for services
    category_cache: dict = {}
    if data_type == "services":
        for cat in db.query(ServiceCategory).all():
            category_cache[cat.name.lower()] = cat.id
        if not category_cache:
            cat_id = _ensure_category(db, "Hair Couture & Styling", organization_id, category_cache)
            db.commit()

    # Replace mode — wipe existing rows first
    if mode == "replace":
        if data_type == "services":
            q = db.query(Service)
            if organization_id:
                q = q.filter(Service.organization_id == organization_id)
            q.delete(synchronize_session=False)
        elif data_type == "customers":
            db.query(Customer).delete(synchronize_session=False)
        elif data_type == "inventory":
            db.query(InventoryProduct).delete(synchronize_session=False)
        db.commit()

    text_stream = io.TextIOWrapper(file.file, encoding="utf-8-sig", errors="replace")

    def row_generator():
        """True streaming generator reading line-by-line without loading entire file in RAM."""
        if is_jsonl:
            first_line = text_stream.readline()
            if not first_line:
                return

            stripped = first_line.strip()
            # If JSON array e.g. [ {...}, {...} ]
            if stripped.startswith("["):
                try:
                    full_content = first_line + text_stream.read()
                    arr = json.loads(full_content)
                    if isinstance(arr, list):
                        for item in arr:
                            if isinstance(item, dict):
                                yield item
                    return
                except Exception:
                    pass

            # Process first line if valid JSON
            if stripped:
                try:
                    obj = json.loads(stripped)
                    if isinstance(obj, dict):
                        # Check root array wrappers e.g. {"products": [...]} or {"data": [...]}
                        found_nested = False
                        for key in ["products", "data", "services", "items", "rows", "results", "records"]:
                            if key in obj and isinstance(obj[key], list):
                                for item in obj[key]:
                                    if isinstance(item, dict):
                                        yield item
                                found_nested = True
                                break
                        if not found_nested:
                            yield obj
                    elif isinstance(obj, list):
                        for item in obj:
                            if isinstance(item, dict):
                                yield item
                except Exception:
                    pass

            # Stream remaining lines one-by-one
            for line in text_stream:
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                    if isinstance(obj, dict):
                        yield obj
                    elif isinstance(obj, list):
                        for item in obj:
                            if isinstance(item, dict):
                                yield item
                except Exception:
                    continue
        else:
            reader = csv.DictReader(text_stream)
            for row in reader:
                yield row

    batch_buffer = []

    for idx, row in enumerate(row_generator()):
        if not isinstance(row, dict):
            continue

        rows_processed += 1
        if max_records and rows_inserted >= max_records:
            break

        try:
            name = _extract_name(row, data_type, idx)
            desc = _extract_desc(row)
            image_url = _extract_image(row)

            if data_type == "services":
                cat_name = _extract_category(row, "Hair Couture & Styling")
                cat_id = _ensure_category(db, cat_name, organization_id, category_cache)
                price = _extract_price(row, 1800.0)
                duration = _extract_duration(row, 45)
                gender_list = _extract_gender(row, name)

                obj = Service(
                    id=str(uuid.uuid4()),
                    name=name[:150],
                    category_id=cat_id,
                    category_name=cat_name[:80],
                    base_price=price,
                    member_price=round(price * 0.85, 2),
                    duration_minutes=duration,
                    short_desc=desc[:1000],
                    full_desc=desc[:2000],
                    gender=gender_list,
                    branch_ids=[branch_id] if branch_id else [],
                    organization_id=organization_id,
                    is_active=True,
                )

            elif data_type == "customers":
                phone = _clean_str(_get_dynamic(row, "phone", "phone_number", "mobile", "contact", "tel"))
                if not phone:
                    phone = f"+9198{str(uuid.uuid4().int)[:8]}"
                email = _clean_str(_get_dynamic(row, "email", "email_address")) or None
                gender_list = _extract_gender(row, name)
                gender = "female" if "women" in gender_list else "male" if "men" in gender_list else "other"

                obj = Customer(
                    id=str(uuid.uuid4()),
                    name=name[:100],
                    phone=phone[:25],
                    email=email[:100] if email else None,
                    gender=gender,
                    wallet_balance=_extract_price(row, 0.0),
                    loyalty_points=100,
                    membership_tier=str(_get_dynamic(row, "membership_tier", "tier") or "Rose Silver"),
                    segment=str(_get_dynamic(row, "segment") or "New Customer"),
                    notes=desc[:500],
                    preferred_branch_id=branch_id,
                    is_active=True,
                )

            elif data_type == "inventory":
                sku = _clean_str(_get_dynamic(row, "sku", "barcode", "code", "_id", "id")) or f"SKU-{str(uuid.uuid4())[:8].upper()}"
                brand = _clean_str(_get_dynamic(row, "brand", "brands", "vendor", "supplier")) or "Generic Professional"
                cat_name = _extract_category(row, "Salon Care & Consumables")
                cost_price = _extract_price(row, 650.0)
                retail_price = round(cost_price * 1.5, 2)

                obj = InventoryProduct(
                    id=str(uuid.uuid4()),
                    sku=sku[:50],
                    name=name[:150],
                    brand=brand[:80],
                    category=cat_name[:80],
                    unit=str(_get_dynamic(row, "unit", "quantity") or "units")[:30],
                    cost_price=cost_price,
                    retail_price=retail_price,
                    current_stock=int(float(_get_dynamic(row, "current_stock", "stock", "qty") or 50)),
                    reorder_threshold=10,
                    supplier=brand[:80],
                    is_retail=True,
                    is_active=True,
                )

            if obj is not None:
                batch_buffer.append(obj)

            if len(batch_buffer) >= batch_size:
                db.bulk_save_objects(batch_buffer)
                db.commit()
                rows_inserted += len(batch_buffer)
                batch_buffer = []

        except Exception as err:
            rows_skipped += 1
            continue

    if batch_buffer:
        db.bulk_save_objects(batch_buffer)
        db.commit()
        rows_inserted += len(batch_buffer)

    elapsed_time = round(time.time() - start_time, 2)
    return {
        "status": "success",
        "message": f"Successfully ingested {rows_inserted:,} records in {elapsed_time}s.",
        "data_type": data_type,
        "mode": mode,
        "rows_processed": rows_processed,
        "rows_inserted": rows_inserted,
        "rows_skipped": rows_skipped,
        "elapsed_seconds": elapsed_time,
        "speed_rows_per_sec": round(rows_inserted / (elapsed_time or 1), 1),
        "refresh_required": True,
    }


class BulkJsonImportRequest(BaseModel):
    data_type: str = "services"
    mode: str = "append"
    organization_id: Optional[str] = None
    branch_id: Optional[str] = None
    rows: List[Dict[str, Any]]


@router.post("/json")
async def bulk_upload_json(
    payload: BulkJsonImportRequest,
    db: Session = Depends(get_db)
):
    """
    Directly insert preview rows/JSON records into PostgreSQL database tables.
    """
    start_time = time.time()
    rows_inserted = 0
    data_type = payload.data_type
    mode = payload.mode

    category_cache = {}
    if data_type == "services":
        for cat in db.query(ServiceCategory).all():
            category_cache[cat.name.lower()] = cat.id

        if not category_cache:
            default_cat = ServiceCategory(
                id=str(uuid.uuid4()),
                name="Hair Couture & Styling",
                slug="hair-couture-styling",
                organization_id=payload.organization_id,
                is_active=True
            )
            db.add(default_cat)
            db.commit()
            category_cache["hair couture & styling"] = default_cat.id

    if mode == "replace":
        if data_type == "services":
            q = db.query(Service)
            if payload.organization_id:
                q = q.filter(Service.organization_id == payload.organization_id)
            q.delete(synchronize_session=False)
        elif data_type == "customers":
            db.query(Customer).delete(synchronize_session=False)
        elif data_type == "inventory":
            db.query(InventoryProduct).delete(synchronize_session=False)
        db.commit()

    batch_buffer = []

    for idx, row in enumerate(payload.rows):
        try:
            name = _extract_name(row, data_type, idx)
            desc = _extract_desc(row)

            if data_type == "services":
                cat_name = _extract_category(row, "Hair Couture & Styling")
                cat_id = _ensure_category(db, cat_name, payload.organization_id, category_cache)
                price = _extract_price(row, 1800.0)
                duration = _extract_duration(row, 45)
                gender_list = _extract_gender(row, name)

                obj = Service(
                    id=str(uuid.uuid4()),
                    name=name[:150],
                    category_id=cat_id,
                    category_name=cat_name[:80],
                    base_price=price,
                    member_price=round(price * 0.85, 2),
                    duration_minutes=duration,
                    short_desc=desc[:1000],
                    full_desc=desc[:2000],
                    gender=gender_list,
                    branch_ids=[payload.branch_id] if payload.branch_id else [],
                    organization_id=payload.organization_id,
                    is_active=True,
                )

            elif data_type == "customers":
                phone = _clean_str(_get_dynamic(row, "phone", "phone_number", "mobile", "contact", "tel")) or f"+9198{str(uuid.uuid4().int)[:8]}"
                email = _clean_str(_get_dynamic(row, "email", "email_address")) or None
                gender_list = _extract_gender(row, name)
                gender = "female" if "women" in gender_list else "male" if "men" in gender_list else "other"

                obj = Customer(
                    id=str(uuid.uuid4()),
                    name=name[:100],
                    phone=phone[:25],
                    email=email[:100] if email else None,
                    gender=gender,
                    wallet_balance=_extract_price(row, 0.0),
                    loyalty_points=100,
                    membership_tier=str(_get_dynamic(row, "membership_tier", "tier") or "Rose Silver"),
                    segment=str(_get_dynamic(row, "segment") or "New Customer"),
                    notes=desc[:500],
                    preferred_branch_id=payload.branch_id,
                    is_active=True,
                )

            elif data_type == "inventory":
                sku = _clean_str(_get_dynamic(row, "sku", "barcode", "code", "_id", "id")) or f"SKU-{str(uuid.uuid4())[:8].upper()}"
                brand = _clean_str(_get_dynamic(row, "brand", "brands", "vendor", "supplier")) or "Generic Professional"
                cat_name = _extract_category(row, "Salon Care & Consumables")
                cost_price = _extract_price(row, 650.0)
                retail_price = round(cost_price * 1.5, 2)

                obj = InventoryProduct(
                    id=str(uuid.uuid4()),
                    sku=sku[:50],
                    name=name[:150],
                    brand=brand[:80],
                    category=cat_name[:80],
                    unit=str(_get_dynamic(row, "unit", "quantity") or "units")[:30],
                    cost_price=cost_price,
                    retail_price=retail_price,
                    current_stock=int(float(_get_dynamic(row, "current_stock", "stock", "qty") or 50)),
                    reorder_threshold=10,
                    supplier=brand[:80],
                    is_retail=True,
                    is_active=True,
                )

            if obj is not None:
                batch_buffer.append(obj)

        except Exception:
            continue

    if batch_buffer:
        db.bulk_save_objects(batch_buffer)
        db.commit()
        rows_inserted = len(batch_buffer)

    elapsed = round(time.time() - start_time, 2)
    return {
        "status": "success",
        "message": f"Successfully saved {rows_inserted} records directly to PostgreSQL.",
        "rows_inserted": rows_inserted,
        "elapsed_seconds": elapsed,
        "refresh_required": True,
    }
