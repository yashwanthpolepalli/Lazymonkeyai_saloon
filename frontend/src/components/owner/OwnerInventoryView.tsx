"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  Box,
  Plus,
  Search,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  RefreshCw,
  Edit2,
  DollarSign,
  Tag,
  Package,
  X,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { InventoryProduct } from "@/types";
import { DataImportModal } from "@/components/common/DataImportModal";
import { downloadCsvFile, SAMPLE_INVENTORY_CSV } from "@/lib/csvHelper";

export function OwnerInventoryView() {
  const { inventory, selectedBranch, addToast } = useSalon();
  const [activeTab, setActiveTab] = useState<"retail" | "backbar">("retail");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBackBarModalOpen, setIsBackBarModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Hair Care");
  const [stock, setStock] = useState("20");
  const [reorderLevel, setReorderLevel] = useState("5");
  const [costPrice, setCostPrice] = useState("800");
  const [retailPrice, setRetailPrice] = useState("1600");

  // Back-Bar Internal Usage State (Invoay / Zenoti)
  const [backbarItemName, setBackbarItemName] = useState(inventory[0]?.name || "L'Oréal Majirel 5.0");
  const [backbarQuantity, setBackbarQuantity] = useState("60");
  const [backbarUnit, setBackbarUnit] = useState("ml / grams");
  const [backbarServiceName, setBackbarServiceName] = useState("Global Balayage & Gloss");
  const [backbarStylist, setBackbarStylist] = useState("Elena Rostova");
  const [backbarCustomer, setBackbarCustomer] = useState("Aanya Sharma");
  const [backbarNotes, setBackbarNotes] = useState("Root retouch application.");

  const [consumptionLogs, setConsumptionLogs] = useState<any[]>([
    {
      id: "bb_01",
      product_name: "L'Oréal Majirel 5.0 (Brown)",
      quantity: 60,
      unit: "grams",
      service_name: "Balayage Highlights & Gloss",
      stylist_name: "Elena Rostova",
      customer_name: "Aanya Sharma",
      date: "2026-03-27 14:30",
      notes: "Roots touch-up (1:1.5 developer mix)",
    },
    {
      id: "bb_02",
      product_name: "Olaplex No. 1 Bond Multiplier",
      quantity: 15,
      unit: "ml",
      service_name: "Platinum Bleach & Tone",
      stylist_name: "Sarah Jenkins",
      customer_name: "Priya Nair",
      date: "2026-03-27 11:15",
      notes: "Added into lightener bowl directly",
    },
    {
      id: "bb_03",
      product_name: "Brazilian Keratin Treatment Complex",
      quantity: 80,
      unit: "ml",
      service_name: "Keratin Smooth Therapy",
      stylist_name: "Sarah Jenkins",
      customer_name: "Kavita Rao",
      date: "2026-03-26 16:00",
      notes: "Thick coarse hair volume treatment",
    },
  ]);

  const handleRecordBackBarUsage = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog = {
      id: `bb_${Date.now()}`,
      product_name: backbarItemName,
      quantity: Number(backbarQuantity),
      unit: backbarUnit,
      service_name: backbarServiceName,
      stylist_name: backbarStylist,
      customer_name: backbarCustomer,
      date: new Date().toLocaleString([], { hour12: false }),
      notes: backbarNotes,
    };
    setConsumptionLogs([newLog, ...consumptionLogs]);
    addToast("info", "Back-Bar Stock Adjusted", `Deducted ${backbarQuantity} ${backbarUnit} of ${backbarItemName} for service.`);
    setIsBackBarModalOpen(false);
  };

  const filteredInventory = inventory.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categoriesList = Array.from(new Set(inventory.map((i) => i.category)));

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addToast("success", "Product Stocked!", `${name} added to ${selectedBranch.name} inventory.`);
    setName("");
    setSku("");
    setIsAddProductOpen(false);
  };

  const handleRestock = (item: InventoryProduct) => {
    addToast("success", "Purchase Order Sent", `Reorder of 20 units for ${item.name} placed with ${item.supplier || "Kérastase Official"}.`);
  };

  const handleDownloadInventorySample = () => {
    downloadCsvFile("Sample_Salon_Inventory_Stock.csv", SAMPLE_INVENTORY_CSV);
    addToast("success", "Sample CSV Downloaded", "Inventory stock catalog template saved with columns & dummy data.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">
              Stock, Products & Back-Bar
            </span>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              Zenoti & Invoay Internal Consumption
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Salon Inventory & Back-Bar Engine
          </h1>
          <p className="text-xs text-slate-500">
            Retail shelf stock, back-bar gram/ml consumption tracking, and automatic purchase orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeTab === "retail" ? (
            <>
              <button
                onClick={handleDownloadInventorySample}
                title="Download formatted sample CSV template with demo inventory rows"
                className="px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all hover:scale-[1.01]"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sample CSV</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-[1.01]"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={() => setIsAddProductOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Product</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsBackBarModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
            >
              <Box className="w-4 h-4 text-orange-400" />
              <span>+ Record Back-Bar Usage</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("retail")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "retail"
              ? "bg-orange-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Retail & Shelf Stock ({inventory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("backbar")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "backbar"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Box className="w-3.5 h-3.5 text-orange-400" />
          <span>Back-Bar Internal Consumption ({consumptionLogs.length})</span>
        </button>
      </div>


      {/* TAB 1: RETAIL & SHELF INVENTORY */}
      {activeTab === "retail" && (
        <>
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SKU, product name, brand..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === "all"
                    ? "bg-sky-500 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Categories ({inventory.length})
              </button>
              {categoriesList.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    categoryFilter === c
                      ? "bg-orange-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Product & Brand</th>
                    <th className="py-3 px-4">SKU / Code</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Cost / Retail Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => {
                    const isLow = item.currentStock <= item.reorderThreshold;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{item.name}</div>
                              <div className="text-[11px] text-slate-400">{item.brand} &bull; {item.unit}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                          {item.sku}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-bold uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900">
                              {item.currentStock} {item.unit}
                            </div>
                            <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isLow ? "bg-rose-500" : "bg-emerald-500"
                                }`}
                                style={{
                                  width: `${Math.min(100, (item.currentStock / 30) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-900">
                          <span className="text-slate-400 text-[11px]">Cost: ₹{item.costPrice}</span>
                          <div className="font-bold text-slate-900">Retail: ₹{item.retailPrice}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              In Stock
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleRestock(item)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-orange-400 hover:bg-orange-50 text-orange-700 font-semibold text-[11px] cursor-pointer inline-flex items-center gap-1 transition-all"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Reorder</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: BACK-BAR CONSUMPTION LOG (Zenoti / Invoay) */}
      {activeTab === "backbar" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Back-Bar In-Service Product Consumption Log
              </h3>
              <p className="text-xs text-slate-400">
                Real-time deduction of dyes, bleaches, treatment serums, and developers used per appointment
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Consumed Product</th>
                  <th className="py-3 px-4">Quantity Used</th>
                  <th className="py-3 px-4">Service Performed</th>
                  <th className="py-3 px-4">Stylist & Client</th>
                  <th className="py-3 px-4">Application Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consumptionLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {log.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{log.product_name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                        {log.quantity} {log.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {log.service_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{log.stylist_name}</div>
                      <div className="text-[11px] text-slate-400">For: {log.customer_name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 italic">
                      &ldquo;{log.notes}&rdquo;
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Add Inventory Product</h3>
                  <p className="text-[11px] text-slate-400">Stock new retail or in-salon treatment product</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kérastase Chronologiste Masque"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SKU / Barcode</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="KER-CHRON-01"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 font-medium"
                  >
                    <option value="Hair Care">Hair Care</option>
                    <option value="Skin Care">Skin Care</option>
                    <option value="Color & Bleach">Color & Bleach</option>
                    <option value="Spa Oils">Spa Oils</option>
                    <option value="Tools & Scissors">Tools & Scissors</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cost Price (INR)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Retail Price (INR)</label>
                  <input
                    type="number"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Reorder Alert Level</label>
                  <input
                    type="number"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer shadow-sm"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Back-Bar Usage Modal (Zenoti / Invoay) */}
      {isBackBarModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-orange-400 flex items-center justify-center">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Record Back-Bar Internal Usage</h3>
                  <p className="text-[11px] text-slate-400">Deduct dyes, developers & serums used during services</p>
                </div>
              </div>
              <button
                onClick={() => setIsBackBarModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordBackBarUsage} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Back-Bar Product *</label>
                <select
                  value={backbarItemName}
                  onChange={(e) => setBackbarItemName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/30"
                >
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.name}>
                      {inv.name} ({inv.brand}) - Current Stock: {inv.currentStock} {inv.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity Consumed *</label>
                  <input
                    type="number"
                    required
                    value={backbarQuantity}
                    onChange={(e) => setBackbarQuantity(e.target.value)}
                    placeholder="e.g. 60"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/30"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit of Measure</label>
                  <select
                    value={backbarUnit}
                    onChange={(e) => setBackbarUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/30 font-medium"
                  >
                    <option value="grams">grams</option>
                    <option value="ml">ml</option>
                    <option value="tubes / bottles">tubes / bottles</option>
                    <option value="ampoules / units">ampoules / units</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Service Performed</label>
                  <input
                    type="text"
                    value={backbarServiceName}
                    onChange={(e) => setBackbarServiceName(e.target.value)}
                    placeholder="e.g. Balayage Highlights"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/30"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Serving Stylist</label>
                  <input
                    type="text"
                    value={backbarStylist}
                    onChange={(e) => setBackbarStylist(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Client Name / Reference</label>
                <input
                  type="text"
                  value={backbarCustomer}
                  onChange={(e) => setBackbarCustomer(e.target.value)}
                  placeholder="e.g. Aanya Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/30"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Usage Notes</label>
                <textarea
                  rows={2}
                  value={backbarNotes}
                  onChange={(e) => setBackbarNotes(e.target.value)}
                  placeholder="e.g. Mixed with 20 vol developer 1:1.5 ratio..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBackBarModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer shadow-sm"
                >
                  Confirm & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV / Excel Data Importer Modal */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        dataType="inventory"
      />
    </div>
  );
}

