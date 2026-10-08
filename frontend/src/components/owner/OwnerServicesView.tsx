"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  Scissors,
  Plus,
  Search,
  Clock,
  Tag,
  DollarSign,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckSquare,
  Square,
} from "lucide-react";
import { Service, GenderType } from "@/types";
import { DataImportModal } from "@/components/common/DataImportModal";
import { downloadCsvFile, downloadJsonlFile, SAMPLE_SERVICES_CSV, SAMPLE_SERVICES_JSONL } from "@/lib/csvHelper";
import { SalonCatalogService } from "@/services/apiClient";

export function OwnerServicesView() {
  const { services, setServices, categories, addService, addToast } = useSalon();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Form State
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "cat_hair");
  const [basePrice, setBasePrice] = useState("2500");
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [shortDesc, setShortDesc] = useState("");
  const [gender, setGender] = useState<"women" | "men" | "unisex">("unisex");

  const filteredServices = services.filter((s) => {
    if (selectedCat !== "all" && s.categoryId !== selectedCat) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.categoryName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const isAllFilteredSelected =
    filteredServices.length > 0 &&
    filteredServices.every((s) => selectedIds.includes(s.id));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allFilteredIds = filteredServices.map((s) => s.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...allFilteredIds])));
    } else {
      const filteredIdSet = new Set(filteredServices.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGenderChange = async (serviceId: string, newGender: GenderType) => {
    const updatedGenderList = newGender === "unisex" ? ["women", "men", "unisex"] as GenderType[] : [newGender];
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, gender: updatedGenderList } : s))
    );
    if (typeof window !== "undefined") {
      const updated = services.map((s) => (s.id === serviceId ? { ...s, gender: updatedGenderList } : s));
      localStorage.setItem("salon_services", JSON.stringify(updated));
    }
    try {
      await SalonCatalogService.updateService(serviceId, { gender: newGender });
    } catch {
      // offline fallback
    }
    addToast("success", "Gender Updated", `Service gender updated to ${newGender.toUpperCase()}.`);
  };

  const handleDeleteSingleService = async (service: Service) => {
    if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      setSelectedIds((prev) => prev.filter((id) => id !== service.id));

      if (typeof window !== "undefined") {
        const updated = services.filter((s) => s.id !== service.id);
        localStorage.setItem("salon_services", JSON.stringify(updated));
      }

      try {
        await SalonCatalogService.deleteService(service.id);
      } catch {
        // offline fallback
      }

      addToast("info", "Service Deleted", `"${service.name}" has been removed from the menu.`);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (window.confirm(`Are you sure you want to delete ${count} selected service${count > 1 ? "s" : ""}?`)) {
      const selectedSet = new Set(selectedIds);
      setServices((prev) => prev.filter((s) => !selectedSet.has(s.id)));

      if (typeof window !== "undefined") {
        const updated = services.filter((s) => !selectedSet.has(s.id));
        localStorage.setItem("salon_services", JSON.stringify(updated));
      }

      for (const id of selectedIds) {
        try {
          await SalonCatalogService.deleteService(id);
        } catch {
          // offline fallback
        }
      }

      setSelectedIds([]);
      addToast("success", "Services Deleted", `Successfully removed ${count} service${count > 1 ? "s" : ""}.`);
    }
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addService({
      name: name.trim(),
      categoryId,
      categoryName: categories.find((c) => c.id === categoryId)?.name || "Hair Couture & Styling",
      basePrice: parseFloat(basePrice) || 2500,
      durationMinutes: parseInt(durationMinutes) || 45,
      shortDesc: shortDesc.trim() || "Luxury bespoke salon treatment.",
      fullDesc: shortDesc.trim() || "Luxury bespoke salon treatment.",
      gender: gender === "unisex" ? ["women", "men", "unisex"] : [gender],
    });

    setName("");
    setShortDesc("");
    setIsAddModalOpen(false);
  };

  const handleDownloadSampleTemplate = () => {
    downloadCsvFile("Sample_Salon_Services_Catalog.csv", SAMPLE_SERVICES_CSV);
    addToast("success", "Sample CSV Downloaded", "Sample salon services template saved with columns & dummy data.");
  };

  const handleDownloadSampleJsonl = () => {
    downloadJsonlFile("Sample_Salon_Services.jsonl", SAMPLE_SERVICES_JSONL);
    addToast("success", "Sample JSONL Downloaded", "Sample JSON Lines format (.jsonl) file saved.");
  };

  const handleClearAllServices = async () => {
    if (window.confirm(`Are you sure you want to remove all ${services.length} services from the menu & database?`)) {
      setServices([]);
      setSelectedIds([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem("salon_services");
      }
      try {
        await SalonCatalogService.clearAllServices();
      } catch (err) {
        console.warn("Backend clear services failed:", err);
      }
      addToast("info", "Menu Cleared", "All services have been deleted from the catalog and database.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-700 bg-pink-100 px-2 py-0.5 rounded-md">
              Menu & Pricing Architecture
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Salon Services & Treatments
          </h1>
          <p className="text-xs text-slate-500">
            Manage salon service catalog, durations, base pricing, gender specifications, and category assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Clear All Data Button */}
          {services.length > 0 && (
            <button
              onClick={handleClearAllServices}
              title="Remove all services from the menu"
              className="px-3 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all hover:scale-[1.01]"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Clear Menu ({services.length})</span>
            </button>
          )}

          {/* Sample CSV Download Button */}
          <button
            onClick={handleDownloadSampleTemplate}
            title="Download formatted sample CSV template"
            className="px-3 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all hover:scale-[1.01]"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sample CSV</span>
          </button>

          {/* Sample JSONL Download Button */}
          <button
            onClick={handleDownloadSampleJsonl}
            title="Download formatted sample JSONL template"
            className="px-3 py-2.5 rounded-xl border border-violet-300 bg-violet-50 hover:bg-violet-100 text-violet-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all hover:scale-[1.01]"
          >
            <Download className="w-3.5 h-3.5 text-violet-600" />
            <span>Sample JSONL</span>
          </button>

          {/* Import CSV / JSONL Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-[1.01]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Import CSV / JSONL</span>
          </button>

          {/* Add New Service Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Service</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (when rows are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-pink-50/90 border border-pink-200/90 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-600 text-white text-xs font-bold shadow-xs">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold text-pink-950">
              {selectedIds.length} service{selectedIds.length > 1 ? "s" : ""} selected for bulk action
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-xl border border-pink-200 bg-white hover:bg-pink-100 text-pink-800 text-xs font-semibold cursor-pointer transition-colors"
            >
              Deselect All
            </button>
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors hover:scale-[1.01]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search treatments, prices..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          <button
            onClick={() => setSelectedCat("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCat === "all"
                ? "bg-sky-500 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({services.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCat === c.id
                  ? "bg-pink-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    onChange={handleSelectAll}
                    title="Select All"
                    className="w-4 h-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500 cursor-pointer accent-pink-600"
                  />
                </th>
                <th className="py-3 px-4">Service Name & Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No services found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredServices.map((s) => {
                  const isSelected = selectedIds.includes(s.id);
                  const currentGender = Array.isArray(s.gender)
                    ? s.gender.includes("unisex") || (s.gender.includes("women") && s.gender.includes("men"))
                      ? "unisex"
                      : s.gender[0] || "unisex"
                    : (s.gender as string) || "unisex";

                  return (
                    <tr
                      key={s.id}
                      className={`transition-colors ${
                        isSelected ? "bg-pink-50/40" : "hover:bg-slate-50/70"
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(s.id)}
                          className="w-4 h-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500 cursor-pointer accent-pink-600"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.image || "/images/placeholder-service.jpg"}
                            alt={s.name}
                            onError={(e) => {
                              // fallback on broken image
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=120&q=80";
                            }}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{s.name}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 max-w-sm">{s.shortDesc}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold uppercase text-pink-700 bg-pink-100 px-2 py-0.5 rounded-md">
                          {s.categoryName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {s.durationMinutes} mins
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                        ₹{(s.basePrice ?? 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={currentGender}
                          onChange={(e) => handleGenderChange(s.id, e.target.value as GenderType)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500/30 cursor-pointer transition-all capitalize"
                        >
                          <option value="unisex">Unisex</option>
                          <option value="women">Women</option>
                          <option value="men">Men</option>
                          <option value="kids">Kids</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => addToast("info", "Edit Service", `Editing ${s.name}`)}
                          title="Edit Service"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer inline-flex items-center transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSingleService(s)}
                          title="Delete Service"
                          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-700 cursor-pointer inline-flex items-center transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Service Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Add New Service</h3>
                  <p className="text-[11px] text-slate-400">Add to menu catalog with pricing & duration</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Keratin Nano-Plastia Hair Transformation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/30 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/30 font-medium"
                  >
                    <option value="unisex">Unisex</option>
                    <option value="women">Women Only</option>
                    <option value="men">Men Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Base Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/30 font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Duration (Minutes) *</label>
                  <input
                    type="number"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/30 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="e.g. Deep molecular treatment restoring cortex elasticity..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold cursor-pointer shadow-sm"
                >
                  Save Service
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
        dataType="services"
      />
    </div>
  );
}
