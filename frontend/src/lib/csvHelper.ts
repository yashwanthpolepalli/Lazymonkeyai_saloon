/**
 * CSV, JSONL and JSON Data Import / Export Utilities
 * Handles: CSV, JSONL (one JSON object per line), plain JSON array, plain JSON object with array root key.
 * All cell values in ParsedCsvResult rows are ALWAYS primitives (string | number | boolean) — never objects —
 * so they are always safe to render directly in React table cells.
 */

export interface ParsedCsvResult<T = Record<string, any>> {
  headers: string[];
  rows: T[];
  errors: string[];
  totalRows: number;
  detectedFormat: "csv" | "jsonl" | "json-array" | "json-object" | "unknown";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively flattens a nested object into a single-level map using dot-notation keys.
 * Arrays of primitives become comma-joined strings. Arrays of objects become JSON strings.
 * This ensures NO nested object ever reaches a React render cell.
 */
function flattenObject(
  obj: Record<string, any>,
  prefix = "",
  depth = 0
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  if (depth > 4) {
    return { [prefix || "value"]: JSON.stringify(obj) };
  }

  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];

    if (val === null || val === undefined) {
      result[fullKey] = "";
    } else if (typeof val === "object" && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val, fullKey, depth + 1));
    } else if (Array.isArray(val)) {
      if (val.every((v) => typeof v !== "object")) {
        result[fullKey] = val.join(", ");
      } else {
        result[fullKey] = JSON.stringify(val);
      }
    } else {
      result[fullKey] = val as string | number | boolean;
    }
  }
  return result;
}

/**
 * Coerce any value to a primitive safe for React rendering.
 */
function toPrimitive(val: any): string | number | boolean {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") {
    if (Array.isArray(val)) {
      if (val.every((v) => typeof v !== "object")) return val.join(", ");
      return JSON.stringify(val);
    }
    return JSON.stringify(val);
  }
  return val as string | number | boolean;
}

// ---------------------------------------------------------------------------
// Downloads
// ---------------------------------------------------------------------------

/** Downloads a string as a CSV file with UTF-8 BOM (so Excel opens it cleanly). */
export function downloadCsvFile(filename: string, csvContent: string) {
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Downloads a string as a JSONL (JSON Lines) file. */
export function downloadJsonlFile(filename: string, jsonlContent: string) {
  const blob = new Blob([jsonlContent], { type: "application/x-ndjson;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".jsonl") ? filename : `${filename}.jsonl`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

/**
 * Parse JSONL (JSON Lines) — one JSON object per line.
 * If the whole text is a valid JSON array, delegates to parseJsonArrayText.
 */
export function parseJsonlText(jsonlText: string): ParsedCsvResult {
  const errors: string[] = [];
  if (!jsonlText || !jsonlText.trim()) {
    return { headers: [], rows: [], errors: ["File is empty"], totalRows: 0, detectedFormat: "jsonl" };
  }

  const trimmed = jsonlText.trim();

  // A .jsonl file given a JSON array content → delegate
  if (trimmed.startsWith("[")) {
    return parseJsonArrayText(trimmed);
  }

  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rows: Record<string, string | number | boolean>[] = [];
  const headerSet = new Set<string>();

  lines.forEach((line, index) => {
    try {
      const parsed = JSON.parse(line);
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            const flat = flattenObject(item);
            rows.push(flat);
            Object.keys(flat).forEach((k) => headerSet.add(k));
          }
        });
      } else if (typeof parsed === "object" && parsed !== null) {
        const flat = flattenObject(parsed);
        rows.push(flat);
        Object.keys(flat).forEach((k) => headerSet.add(k));
      } else {
        if (index < 5) errors.push(`Line ${index + 1}: Not a JSON object, skipped.`);
      }
    } catch (e: any) {
      if (index < 5) {
        errors.push(`Line ${index + 1}: Invalid JSON — ${e?.message || "parse error"}`);
      }
    }
  });

  return {
    headers: Array.from(headerSet),
    rows,
    errors,
    totalRows: rows.length,
    detectedFormat: "jsonl",
  };
}

/**
 * Parse a plain JSON file. Handles:
 *  - JSON array:   [{...}, {...}]
 *  - JSON object with a root array key: { "data": [...] }
 *  - Single JSON object: {...}  → treated as 1-row table
 * Deeply flattens nested objects so every cell value is a safe primitive.
 */
export function parseJsonArrayText(jsonText: string): ParsedCsvResult {
  const errors: string[] = [];
  try {
    const parsed = JSON.parse(jsonText.trim());

    let arr: any[] = [];
    let fmt: ParsedCsvResult["detectedFormat"] = "json-array";

    if (Array.isArray(parsed)) {
      arr = parsed;
    } else if (typeof parsed === "object" && parsed !== null) {
      fmt = "json-object";
      // Try well-known root array keys first
      const ARRAY_KEYS = [
        "data", "items", "results", "records", "rows",
        "services", "customers", "inventory", "employees", "staff",
        "products", "appointments", "invoices", "orders",
      ];
      for (const key of ARRAY_KEYS) {
        if (Array.isArray(parsed[key])) {
          arr = parsed[key];
          break;
        }
      }
      if (arr.length === 0) {
        // Try first array-valued key found
        for (const key of Object.keys(parsed)) {
          if (Array.isArray(parsed[key]) && (parsed[key] as any[]).length > 0) {
            arr = parsed[key];
            break;
          }
        }
      }
      if (arr.length === 0) {
        // Single JSON object → treat as one-row table
        arr = [parsed];
      }
    }

    if (arr.length === 0) {
      return { headers: [], rows: [], errors: ["JSON file contains an empty array."], totalRows: 0, detectedFormat: fmt };
    }

    const headerSet = new Set<string>();
    const rows: Record<string, string | number | boolean>[] = arr.map((item) => {
      if (typeof item !== "object" || item === null) {
        return { value: toPrimitive(item) };
      }
      const flat = flattenObject(item);
      Object.keys(flat).forEach((k) => headerSet.add(k));
      return flat;
    });

    return { headers: Array.from(headerSet), rows, errors, totalRows: rows.length, detectedFormat: fmt };
  } catch (e: any) {
    errors.push(`JSON parse failed: ${e?.message || "invalid JSON"}`);
    return { headers: [], rows: [], errors, totalRows: 0, detectedFormat: "json-array" };
  }
}

/**
 * Universal Parser — auto-detects format from file extension AND content.
 *
 * Priority:
 *   1. .jsonl / .ndjson  → JSONL parser
 *   2. .json             → JSON parser (handles arrays AND objects with root key unwrapping)
 *   3. Content starts with '[' → JSON array parser
 *   4. Content starts with '{' → Try full JSON parse; if ok → JSON parser; if not → JSONL
 *   5. Everything else → CSV parser
 */
export function parseUniversalText(text: string, filename?: string): ParsedCsvResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { headers: [], rows: [], errors: ["File is empty"], totalRows: 0, detectedFormat: "unknown" };
  }

  const lower = (filename || "").toLowerCase();
  const isJsonlExt = lower.endsWith(".jsonl") || lower.endsWith(".ndjson");
  const isJsonExt = lower.endsWith(".json");

  if (isJsonlExt) {
    return parseJsonlText(trimmed);
  }

  if (isJsonExt) {
    return parseJsonArrayText(trimmed);
  }

  // Content-based detection
  if (trimmed.startsWith("[")) {
    return parseJsonArrayText(trimmed);
  }

  if (trimmed.startsWith("{")) {
    // Try parsing the whole thing as one JSON value
    try {
      JSON.parse(trimmed);
      // Succeeded → it's either a single object or the file is valid JSON
      return parseJsonArrayText(trimmed);
    } catch {
      // Invalid as a single JSON doc → multi-line JSONL stream
      return parseJsonlText(trimmed);
    }
  }

  return parseCsvText(trimmed);
}

/**
 * Parse CSV text into headers and structured row objects.
 * Respects quoted fields with embedded commas/newlines.
 * All values are plain strings — never objects.
 */
export function parseCsvText(csvText: string): ParsedCsvResult {
  const errors: string[] = [];
  if (!csvText || !csvText.trim()) {
    return { headers: [], rows: [], errors: ["File is empty"], totalRows: 0, detectedFormat: "csv" };
  }

  const lines: string[] = [];
  let currentLine = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') { currentLine += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      if (currentLine.trim()) lines.push(currentLine);
      currentLine = "";
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) lines.push(currentLine);

  if (lines.length < 2) {
    return {
      headers: [],
      rows: [],
      errors: ["CSV must contain at least a header row and one data row"],
      totalRows: 0,
      detectedFormat: "csv",
    };
  }

  const parseRow = (line: string): string[] => {
    const values: string[] = [];
    let curVal = "";
    let inside = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      const next = line[i + 1];
      if (c === '"') {
        if (inside && next === '"') { curVal += '"'; i++; }
        else { inside = !inside; }
      } else if (c === "," && !inside) {
        values.push(curVal.trim());
        curVal = "";
      } else {
        curVal += c;
      }
    }
    values.push(curVal.trim());
    return values;
  };

  const rawHeaders = parseRow(lines[0]);
  const headers = rawHeaders.map((h) => h.replace(/^[\"']|[\"']$/g, "").trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const values = parseRow(line);
    const rowObj: Record<string, string> = {};
    headers.forEach((header, index) => {
      let val = values[index] !== undefined ? values[index] : "";
      val = val.replace(/^[\"']|[\"']$/g, "").trim();
      rowObj[header] = val;
    });
    rows.push(rowObj);
  }

  return { headers, rows, errors, totalRows: rows.length, detectedFormat: "csv" };
}

// ---------------------------------------------------------------------------
// Schema Templates
// ---------------------------------------------------------------------------

export const SAMPLE_SERVICES_CSV = `Service Name,Category,Subcategory,Base Price (INR),VIP Member Price (INR),Duration (Minutes),Audience,Description,Image URL
"Sample Haircut & Style","Hair Couture & Styling","Haircut",1200,960,45,"unisex","Precision styling consultation and service.",""`;

export const SAMPLE_CUSTOMERS_CSV = `Full Name,Phone Number,Email Address,Gender,Membership Tier,Wallet Balance (INR),Loyalty Points,Segment,Notes
"Sample Client","+91 98000 00001","client@example.com","female","Standard",0,100,"Regular Loyalist",""`;

export const SAMPLE_INVENTORY_CSV = `SKU,Product Name,Brand,Category,Unit,Cost Price (INR),Retail Price (INR),Current Stock,Reorder Level,Supplier
"SKU-PROD-001","Sample Hair Serum 100ml","Professional","Hair Care","bottles",500,950,20,5,"Default Supplier"`;

export const SAMPLE_SERVICES_JSONL = `{"name": "Sample Haircut & Style", "category": "Hair Couture & Styling", "base_price": 1200, "duration": 45, "gender": "unisex", "short_desc": "Precision styling consultation and service."}`;

export const SAMPLE_CUSTOMERS_JSONL = `{"name": "Sample Client", "phone": "+91 98000 00001", "email": "client@example.com", "membership_tier": "Standard", "wallet_balance": 0, "loyalty_points": 100, "segment": "Regular Loyalist"}`;

export const SAMPLE_INVENTORY_JSONL = `{"sku": "SKU-PROD-001", "name": "Sample Hair Serum 100ml", "brand": "Professional", "category": "Hair Care", "unit": "bottles", "cost_price": 500, "retail_price": 950, "current_stock": 20}`;

// Empty placeholder for dynamic data ingestion
export const DEMO_DUMP_SERVICES: any[] = [];

