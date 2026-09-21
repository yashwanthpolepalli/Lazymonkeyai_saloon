/**
 * CSV and Excel Data Import / Export Utilities
 * Provides sample CSV templates, robust parsing, validation, and browser downloads.
 */

export interface ParsedCsvResult<T = Record<string, string>> {
  headers: string[];
  rows: T[];
  errors: string[];
  totalRows: number;
}

/**
 * Downloads a string content as a CSV file with UTF-8 BOM so Excel opens it correctly.
 */
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

/**
 * Parse CSV text into headers and structured row objects
 */
export function parseCsvText(csvText: string): ParsedCsvResult {
  const errors: string[] = [];
  if (!csvText || !csvText.trim()) {
    return { headers: [], rows: [], errors: ["File is empty"], totalRows: 0 };
  }

  // Split lines while preserving quotes
  const lines: string[] = [];
  let currentLine = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = "";
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length < 2) {
    return {
      headers: [],
      rows: [],
      errors: ["CSV must contain at least a header row and one data row"],
      totalRows: 0,
    };
  }

  // Parse header
  const parseRow = (line: string): string[] => {
    const values: string[] = [];
    let curVal = "";
    let inside = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      const next = line[i + 1];

      if (c === '"') {
        if (inside && next === '"') {
          curVal += '"';
          i++;
        } else {
          inside = !inside;
        }
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
  const headers = rawHeaders.map((h) => h.replace(/^["']|["']$/g, "").trim());

  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const values = parseRow(line);
    const rowObj: Record<string, string> = {};

    headers.forEach((header, index) => {
      let val = values[index] !== undefined ? values[index] : "";
      val = val.replace(/^["']|["']$/g, "").trim();
      rowObj[header] = val;
    });

    rows.push(rowObj);
  }

  return {
    headers,
    rows,
    errors,
    totalRows: rows.length,
  };
}

/// ==========================================
// SAMPLE CSV / EXCEL TEMPLATES (12 Master Categories)
// ==========================================

export const SAMPLE_SERVICES_CSV = `Service Name,Category,Subcategory,Base Price (INR),VIP Member Price (INR),Duration (Minutes),Audience,Description,Image URL
"Architectural Precision Haircut & Blowdry","Hair","Haircut",900,720,45,"women, men, kids, unisex","Custom consultation, clarifying wash, bespoke geometry cut, and blowout finishing.","https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800"
"French Dimensional Sun-Kissed Balayage","Hair","Balayage",6500,5200,150,"women, unisex","Hand-swept gradient color illumination with seamless root blending and gloss seal.","https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800"
"Amazonian Bio-Keratin & Botox Infusion","Hair","Keratin Treatment",5500,4400,120,"women, men, unisex","Formaldehyde-free intensive smoothing, frizz elimination, and silk mirror gloss.","https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800"
"Royal Beard Sculpting & Razor Edge Line","Beard & Grooming","Beard Styling",550,440,30,"men","Sandalwood pre-oil, warm towel steam, scissor shaping, and straight-razor crisp lines.","https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800"
"Hot Towel Executive Shave & Skin Detox","Beard & Grooming","Shaving",450,360,25,"men","Double lather rich shaving cream, hot eucalyptus towel, and post-shave balm.","https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800"
"Medical-Grade 7-in-1 Hydra Facial Infusion","Facial & Skin","Facial",3200,2560,60,"women, men, unisex","Vortex vacuum pore extraction, salicylic peeling, and antioxidant peptide serum blast.","https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800"
"24K Sovereign Pure Gold Glow Facial","Facial & Skin","Facial",4200,3360,75,"women, men, unisex","Ultrasonic cleansing, 24K pure gold leaf mask, and collagen LED phototherapy.","https://images.unsplash.com/photo-1512290900672-1f486ccf42b3?w=800"
"High-Definition Organic Cotton Eyebrow Architecture","Threading","Eyebrows",150,120,15,"women, unisex","Precision mapping, high-definition symmetry shaping, and soothing aloe gel finish.","https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800"
"Italian Rica Lipo-Soluble Luxury Full Body Wax","Waxing","Full Body",2800,2240,75,"women","Colophony-free Italian liposoluble wax with pre-wax gel and avocado soothing lotion.","https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800"
"Haute Russian Structured BIAB Manicure","Nails","Manicure",1800,1440,60,"women, men, unisex","Flawless dry e-file precision cuticle detailing with durable BIAB rubber base overlay.","https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800"
"Balinese Deep Tissue & Aromatic Oil Therapy","Spa & Massage","Deep Tissue Massage",3200,2560,60,"women, men, unisex","Acupressure thumb-walking, muscle knot release, and warm organic almond herbal elixir.","https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800"
"HD Glam Party & Cocktail Makeover","Makeup","Party Makeup",3800,3040,75,"women","Skin prep, flawless HD contouring, smokey / shimmer eye glam, and mink lashes.","https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800"
"Royal Heritage Signature Bridal Makeover","Bridal","Bridal Makeup",15000,12000,180,"women","Luxury HD bridal makeup, bespoke floral hairstyling, dupatta draping, and jewelry setting.","https://images.unsplash.com/photo-1519741497674-611481863552?w=800"
"Intricate Rajasthani Organic Bridal Henna","Mehendi","Bridal Mehendi",7000,5600,180,"women","Custom love story portrait motifs, full elbows to fingertips, and feet mehendi.","https://images.unsplash.com/photo-1595867818088-57c2c9d2ec0a?w=800"
"Full Body Walnut Scrub & Glow Polishing","Body Care","Body Polish",3500,2800,75,"women, men, unisex","Exfoliating micro-walnut bead scrub followed by warm cocoa butter body glaze.","https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800"
"Triple-Wavelength Painless Laser Underarms Session","Hair Removal","Underarms",1999,1599,20,"women, men, unisex","Medical Diode & Alexandrite laser with ICE contact cooling for permanent reduction.","https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800"`;

export const SAMPLE_CUSTOMERS_CSV = `Full Name,Phone Number,Email Address,Gender,Membership Tier,Wallet Balance (INR),Loyalty Points,Segment,Notes
"Ananya Deshmukh","+91 98200 45678","ananya.deshmukh@gmail.com","female","Black Diamond VIP",12500,850,"VIP High Spender","Prefers chilled sparkling water and Director Stylist for balayage."
"Vikramaditya Singhania","+91 98111 23456","vikram.singhania@corp.in","male","Gold Elite",6000,420,"Regular Loyalist","Executive cuts only on Saturday mornings. Espresso with almond milk."
"Pooja Merchant","+91 99300 78901","pooja.merchant@fashion.co","female","Rose Silver",2000,150,"Regular Loyalist","Sensitive scalp. Always use sulfate-free organic shampoo."
"Rohan Kulkarni","+91 97690 12345","rohan.kulkarni@techindia.io","male","Rose Silver",0,80,"Occasional","Walk-in customer for grooming and beard shaping."
"Meera Kapoor","+91 98205 99887","meera.kapoor@lifestyle.net","female","Black Diamond VIP",25000,1400,"VIP High Spender","Celebrity client. Book private VIP styling suite BOM-01."
"Aditi Rao","+91 98450 11223","aditi.rao@gmail.com","female","Gold Elite",4500,320,"Regular Loyalist","Booked monthly nail art and cellular gold facials."`;

export const SAMPLE_INVENTORY_CSV = `SKU,Product Name,Brand,Category,Unit,Cost Price (INR),Retail Price (INR),Current Stock,Reorder Level,Supplier
"SKU-OLP-001","Olaplex No. 3 Hair Perfector 250ml","Olaplex Paris","Hair Care","bottles",1800,2950,45,10,"Olaplex India Official"
"SKU-KER-002","Kerastase Chronologiste Masque 200ml","Kerastase Paris","Hair Care","tubes",2200,3600,28,8,"L'Oreal Luxe Distribution"
"SKU-DY-003","L'Oreal Majirel Cool Inforced 7.1","L'Oreal Professionnel","Colorants","tubes",420,680,85,20,"L'Oreal Salon Direct"
"SKU-SK-004","Forest Essentials Soundarya 24K Serum","Forest Essentials","Skin Care","bottles",2400,4200,18,5,"Forest Essentials B2B"
"SKU-NL-005","OPI Infinite Shine Gel Effects Top Coat","OPI Nails USA","Nail Polish","bottles",650,1150,52,15,"OPI Beauty Imports"
"SKU-SPA-006","Kama Ayurveda Pure Cedarwood Essential Oil","Kama Ayurveda","Spa Oils","bottles",780,1450,30,8,"Kama Ayurveda Wholesale"
"SKU-TL-007","Dyson Supersonic Professional Dryer Nozzle","Dyson Pro","Styling Tools","units",3200,5500,12,3,"Dyson Commercial India"`;

// Pre-packaged demo data for 1-click test dump across 12 Master Categories
export const DEMO_DUMP_SERVICES = [
  {
    name: "Architectural Precision Haircut & Blowdry",
    categoryName: "Hair",
    categoryId: "cat_hair",
    subcategory: "Haircut",
    basePrice: 900,
    memberPrice: 720,
    durationMinutes: 45,
    gender: ["women", "men", "kids", "unisex"] as any,
    shortDesc: "Custom consultation, clarifying wash, bespoke geometry cut, and blowout finishing.",
    image: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "French Dimensional Sun-Kissed Balayage",
    categoryName: "Hair",
    categoryId: "cat_hair",
    subcategory: "Balayage",
    basePrice: 6500,
    memberPrice: 5200,
    durationMinutes: 150,
    gender: ["women", "unisex"] as any,
    shortDesc: "Hand-swept gradient color illumination with seamless root blending and gloss seal.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Haute Russian Structured BIAB Manicure",
    categoryName: "Nails",
    categoryId: "cat_nails",
    subcategory: "Manicure",
    basePrice: 1800,
    memberPrice: 1440,
    durationMinutes: 60,
    gender: ["women", "men", "unisex"] as any,
    shortDesc: "Flawless dry e-file precision cuticle detailing with durable BIAB rubber base overlay.",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400",
  },
  {
    name: "Balinese Deep Tissue & Aromatic Oil Therapy",
    categoryName: "Spa & Massage",
    categoryId: "cat_spa",
    subcategory: "Deep Tissue Massage",
    basePrice: 3200,
    memberPrice: 2560,
    durationMinutes: 60,
    gender: ["women", "men", "unisex"] as any,
    shortDesc: "Acupressure thumb-walking, muscle knot release, and warm organic almond herbal elixir.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400",
  },
  {
    name: "HD Glam Party & Cocktail Makeover",
    categoryName: "Makeup",
    categoryId: "cat_makeup",
    subcategory: "Party Makeup",
    basePrice: 3800,
    memberPrice: 3040,
    durationMinutes: 75,
    gender: ["women"] as any,
    shortDesc: "Skin prep, flawless HD contouring, smokey / shimmer eye glam, and mink lashes.",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400",
  },
  {
    name: "Royal Heritage Signature Bridal Makeover",
    categoryName: "Bridal",
    categoryId: "cat_bridal",
    subcategory: "Bridal Makeup",
    basePrice: 15000,
    memberPrice: 12000,
    durationMinutes: 180,
    gender: ["women"] as any,
    shortDesc: "Luxury HD bridal makeup, bespoke floral hairstyling, dupatta draping, and jewelry setting.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400",
  },
];
