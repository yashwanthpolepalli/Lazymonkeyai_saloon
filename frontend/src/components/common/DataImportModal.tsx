"use client";

import React, { useState, useRef } from "react";
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Sparkles,
  ArrowRight,
  Database,
  RefreshCw,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useSalon } from "@/context/SalonContext";
import {
  downloadCsvFile,
  parseCsvText,
  SAMPLE_SERVICES_CSV,
  SAMPLE_CUSTOMERS_CSV,
  SAMPLE_INVENTORY_CSV,
  DEMO_DUMP_SERVICES,
} from "@/lib/csvHelper";
import { Service, Customer, InventoryProduct } from "@/types";
import { generateId } from "@/lib/utils";

export type ImportDataType = "services" | "customers" | "inventory";

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataType: ImportDataType;
  onImportComplete?: () => void;
}

export function DataImportModal({
  isOpen,
  onClose,
  dataType,
  onImportComplete,
}: DataImportModalProps) {
  const {
    services,
    setServices,
    customers,
    setCustomers,
    inventory,
    setInventory,
    categories,
    selectedBranchId,
    addToast,
  } = useSalon();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>("");
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [isProcessing, setIsProcessing] = useState(false);

  // Configuration per data type
  const config = {
    services: {
      title: "Import Services & Treatments",
      subtitle: "Bulk import salon services catalog from CSV or Excel file",
      sampleFilename: "Sample_Salon_Services_Catalog.csv",
      sampleCsv: SAMPLE_SERVICES_CSV,
      badgeColor: "bg-pink-100 text-pink-700 border-pink-200",
      iconColor: "text-pink-600",
    },
    customers: {
      title: "Import Customer & Client Records",
      subtitle: "Bulk import client contact book, VIP tiers, and balances",
      sampleFilename: "Sample_Salon_Customers_Directory.csv",
      sampleCsv: SAMPLE_CUSTOMERS_CSV,
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      iconColor: "text-purple-600",
    },
    inventory: {
      title: "Import Inventory & Stock Catalog",
      subtitle: "Bulk import retail products, salon consumables, and stock levels",
      sampleFilename: "Sample_Salon_Inventory_Stock.csv",
      sampleCsv: SAMPLE_INVENTORY_CSV,
      badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
      iconColor: "text-amber-600",
    },
  }[dataType];

  const handleDownloadSample = () => {
    downloadCsvFile(config.sampleFilename, config.sampleCsv);
    addToast(
      "success",
      "Sample File Downloaded",
      `Saved ${config.sampleFilename} with formatted columns and dummy records.`
    );
  };

  const handleLoadDemoDump = () => {
    setFileName("Demo_Luxury_Catalog_Dump.csv");
    setFileSize("1.8 KB");
    setRawText(config.sampleCsv);
    const parsed = parseCsvText(config.sampleCsv);
    setParsedHeaders(parsed.headers);
    setParsedRows(parsed.rows);
    addToast("info", "Sample Dump Loaded", `${parsed.rows.length} demo records loaded into preview.`);
  };

  const processFileContent = (text: string, name: string, size: number) => {
    setFileName(name);
    setFileSize(`${(size / 1024).toFixed(1)} KB`);
    setRawText(text);

    const parsed = parseCsvText(text);
    if (parsed.errors.length > 0) {
      addToast("error", "CSV Parse Warning", parsed.errors.join(", "));
    }
    setParsedHeaders(parsed.headers);
    setParsedRows(parsed.rows);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processFileContent(content, file.name, file.size);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        processFileContent(content, file.name, file.size);
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    setFileName(null);
    setFileSize(null);
    setRawText("");
    setParsedHeaders([]);
    setParsedRows([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCommitImport = () => {
    if (parsedRows.length === 0) {
      addToast("warning", "No Data", "Please select a valid CSV file or load sample data.");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      try {
        if (dataType === "services") {
          const newServices: Service[] = parsedRows.map((row, idx) => {
            const name =
              row["Service Name"] ||
              row["Name"] ||
              row["service_name"] ||
              row["name"] ||
              `Custom Service ${idx + 1}`;
            const categoryName =
              row["Category"] ||
              row["category"] ||
              row["Category Name"] ||
              "Hair Couture & Styling";
            const basePrice =
              parseFloat(row["Base Price (INR)"] || row["Base Price"] || row["Price"] || row["price"] || "2000") ||
              2000;
            const durationMinutes =
              parseInt(
                row["Duration (Minutes)"] ||
                  row["Duration (Mins)"] ||
                  row["Duration"] ||
                  row["duration"] ||
                  "45"
              ) || 45;
            const shortDesc =
              row["Short Description"] ||
              row["Description"] ||
              row["short_desc"] ||
              "Luxury salon care and personalized consultation.";
            const genderStr = (row["Gender"] || row["gender"] || "unisex").toLowerCase();
            const gender: any[] = genderStr.includes("women")
              ? genderStr.includes("men")
                ? ["women", "men", "unisex"]
                : ["women"]
              : genderStr.includes("men")
                ? ["men"]
                : ["unisex"];

            const matchedCat = categories.find(
              (c) => c.name.toLowerCase() === categoryName.toLowerCase()
            );

            return {
              id: generateId("srv"),
              name,
              categoryId: matchedCat?.id || "cat_hair",
              categoryName: matchedCat?.name || categoryName,
              basePrice,
              durationMinutes,
              shortDesc,
              fullDesc: shortDesc,
              gender,
              branchIds: ["br_mumbai", "br_delhi", "br_bengaluru", "br_dubai", "br_london"],
              image:
                "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400",
              requiredSkills: ["Styling"],
            };
          });

          if (importMode === "replace") {
            setServices(newServices);
          } else {
            setServices((prev) => [...newServices, ...prev]);
          }

          addToast(
            "success",
            "Services Imported Successfully!",
            `${newServices.length} treatments and services dumped into the salon menu.`
          );
        } else if (dataType === "customers") {
          const newCustomers: Customer[] = parsedRows.map((row, idx) => {
            const name =
              row["Full Name"] ||
              row["Name"] ||
              row["customer_name"] ||
              `Client ${idx + 1}`;
            const phone =
              row["Phone Number"] ||
              row["Phone"] ||
              row["phone"] ||
              `+91 98000 ${Math.floor(10000 + Math.random() * 90000)}`;
            const email =
              row["Email Address"] ||
              row["Email"] ||
              row["email"] ||
              `client${idx + 1}@example.com`;
            const gender = (
              row["Gender"] || row["gender"] || "female"
            ).toLowerCase() === "male"
              ? "male"
              : "female";
            const membershipTier =
              row["Membership Tier"] || row["Tier"] || "Rose Silver";
            const walletBalance =
              parseFloat(
                row["Wallet Balance (INR)"] || row["Wallet Balance"] || "0"
              ) || 0;
            const loyaltyPoints =
              parseInt(row["Loyalty Points"] || "100") || 100;
            const segment = (row["Segment"] as any) || "Regular Loyalist";
            const notes = row["Notes"] || "";

            return {
              id: generateId("cust"),
              name,
              phone,
              email,
              avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
              gender,
              joinedDate: new Date().toISOString().split("T")[0],
              preferredBranchId: selectedBranchId,
              walletBalance,
              loyaltyPoints,
              membershipTier,
              packages: [],
              beautyProfile: {
                hairType: "Normal",
                hairTexture: "Silky",
                scalpCondition: "Normal",
                skinType: "Hydrated",
                skinConcerns: [],
                allergies: [],
                preferredBeverage: "Cappuccino",
                preferredMusic: "Lounge Jazz",
                lastConsultationDate: new Date().toISOString().split("T")[0],
              },
              totalSpent: walletBalance * 2,
              totalSpend: walletBalance * 2,
              visitsCount: 2,
              totalVisits: 2,
              segment,
              tags: ["Imported", membershipTier],
              notes,
            };
          });

          if (importMode === "replace") {
            setCustomers(newCustomers);
          } else {
            setCustomers((prev) => [...newCustomers, ...prev]);
          }

          addToast(
            "success",
            "Customers Imported Successfully!",
            `${newCustomers.length} client records added to CRM database.`
          );
        } else if (dataType === "inventory") {
          const newInventory: InventoryProduct[] = parsedRows.map((row, idx) => {
            const sku = row["SKU"] || `SKU-IMP-00${idx + 1}`;
            const name =
              row["Product Name"] || row["Name"] || `Salon Product ${idx + 1}`;
            const brand = row["Brand"] || "Luxury Pro";
            const category = (row["Category"] as any) || "Hair Care";
            const unit = (row["Unit"] as any) || "bottles";
            const costPrice =
              parseFloat(
                row["Cost Price (INR)"] || row["Cost Price"] || "1000"
              ) || 1000;
            const retailPrice =
              parseFloat(
                row["Retail Price (INR)"] || row["Retail Price"] || "1800"
              ) || 1800;
            const currentStock =
              parseInt(row["Current Stock"] || row["Stock"] || "20") || 20;
            const reorderThreshold =
              parseInt(row["Reorder Level"] || "5") || 5;
            const supplier = row["Supplier"] || "Official Distributor";

            return {
              id: generateId("prod"),
              sku,
              name,
              brand,
              category,
              unit,
              costPrice,
              retailPrice,
              stocksByBranch: {
                br_mumbai: { current: currentStock, minThreshold: reorderThreshold, optimal: currentStock * 2 },
                br_delhi: { current: Math.floor(currentStock * 0.8), minThreshold: reorderThreshold, optimal: currentStock * 2 },
              },
              currentStock,
              reorderThreshold,
              supplier,
              lastRestocked: new Date().toISOString().split("T")[0],
              isRetail: true,
            };
          });

          if (importMode === "replace") {
            setInventory(newInventory);
          } else {
            setInventory((prev) => [...newInventory, ...prev]);
          }

          addToast(
            "success",
            "Inventory Stock Imported!",
            `${newInventory.length} product SKUs and stock levels updated.`
          );
        }

        setIsProcessing(false);
        handleReset();
        onClose();
        if (onImportComplete) onImportComplete();
      } catch (err: any) {
        setIsProcessing(false);
        addToast("error", "Import Error", err?.message || "Failed to parse data");
      }
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      className="p-0 max-h-[90vh] flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs text-slate-900">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{config.title}</h2>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${config.badgeColor}`}>
                CSV / Excel Importer
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{config.subtitle}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-6 overflow-y-auto space-y-6 flex-1">
        {/* Sample Template & Quick Dump Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Download Sample CSV Template</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Pre-formatted CSV with valid column headers & dummy data.
              </p>
            </div>
            <button
              onClick={handleDownloadSample}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs whitespace-nowrap shadow-xs cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get Sample CSV</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>1-Click Load Demo Dump</span>
              </div>
              <p className="text-[11px] text-indigo-700">
                Instant test: load 8 luxury catalog records into preview.
              </p>
            </div>
            <button
              onClick={handleLoadDemoDump}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs whitespace-nowrap shadow-xs cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Load Demo Data</span>
            </button>
          </div>
        </div>

        {/* File Dropzone */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt,.tsv"
          onChange={handleFileChange}
          className="hidden"
        />

        {!fileName ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              dragActive
                ? "border-emerald-500 bg-emerald-50/50 scale-[1.01]"
                : "border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"
            }`}
          >
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-700">
              <Upload className="w-6 h-6 text-slate-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">
                Click to upload or drag & drop your CSV file here
              </p>
              <p className="text-xs text-slate-400">
                Supports .CSV, .TXT (Comma-Separated, UTF-8 encoded). Max 10MB.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{fileName}</span>
                  <span className="text-xs font-normal text-slate-400">({fileSize})</span>
                </div>
                <p className="text-xs text-emerald-700 font-medium mt-0.5">
                  ✓ Successfully parsed {parsedRows.length} records with {parsedHeaders.length} columns
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
              >
                Change File
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Live Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Data Preview ({parsedRows.length} Rows)
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  Ready to Ingest
                </span>
              </div>

              {/* Import Mode Radio */}
              <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setImportMode("append")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    importMode === "append"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Append to Existing
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode("replace")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    importMode === "replace"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Replace All
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-56">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 sticky top-0 z-10 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 w-12 text-center text-slate-400">#</th>
                    {parsedHeaders.map((h, i) => (
                      <th key={i} className="py-2 px-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      {parsedHeaders.map((h, i) => (
                        <td key={i} className="py-2 px-3 max-w-[200px] truncate text-slate-800">
                          {row[h] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Footer */}
      <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-slate-400" />
          <span>
            {importMode === "replace"
              ? "⚠️ Warning: Replacing will overwrite all existing catalog items."
              : "Import will safely append new records to your active salon database."}
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold cursor-pointer transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={parsedRows.length === 0 || isProcessing}
            onClick={handleCommitImport}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.01] w-full sm:w-auto"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Importing Data...</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confirm & Ingest {parsedRows.length > 0 ? `(${parsedRows.length})` : ""}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
