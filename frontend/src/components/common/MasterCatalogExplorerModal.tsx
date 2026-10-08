"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Search,
  Sparkles,
  Scissors,
  Palette,
  Smile,
  Hand,
  Eye,
  Crown,
  Heart,
  Feather,
  Baby,
  Package,
  Plus,
  HelpCircle,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  ArrowRight,
  Layers,
  ChevronDown,
  Edit2,
  RefreshCw,
} from "lucide-react";
import { MasterCategory, MasterService } from "@/types";
import { MasterCatalogService, SalonCatalogService } from "@/services/apiClient";
import { useSalon } from "@/context/SalonContext";
import confetti from "canvas-confetti";

interface MasterCatalogExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServicesAdopted?: () => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  Scissors: <Scissors className="w-4 h-4" />,
  Palette: <Palette className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Smile: <Smile className="w-4 h-4" />,
  HandMetal: <Hand className="w-4 h-4" />,
  Eye: <Eye className="w-4 h-4" />,
  Crown: <Crown className="w-4 h-4" />,
  Heart: <Heart className="w-4 h-4" />,
  Feather: <Feather className="w-4 h-4" />,
  Baby: <Baby className="w-4 h-4" />,
  Package: <Package className="w-4 h-4" />,
  Plus: <Plus className="w-4 h-4" />,
  HelpCircle: <HelpCircle className="w-4 h-4" />,
};

export const MasterCatalogExplorerModal: React.FC<MasterCatalogExplorerModalProps> = ({
  isOpen,
  onClose,
  onServicesAdopted,
}) => {
  const { currentOrganization, selectedBranch, addToast, setServices: setContextServices } = useSalon();

  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [services, setServices] = useState<MasterService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [adopting, setAdopting] = useState<boolean>(false);

  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selected services for adoption: serviceId -> custom overrides
  const [selectedServices, setSelectedServices] = useState<
    Record<
      string,
      {
        selected: boolean;
        customPrice?: number;
        customDuration?: number;
        customName?: string;
      }
    >
  >({});

  // Load Categories & Services from Backend DB
  useEffect(() => {
    if (!isOpen) return;

    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const [cats, svcs] = await Promise.all([
          MasterCatalogService.getCategories(),
          MasterCatalogService.getServices(),
        ]);
        setCategories(cats || []);
        setServices(svcs || []);
      } catch (err) {
        console.error("Failed to load master catalog:", err);
        addToast("error", "Catalog Error", "Could not load master catalog from database.");
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [isOpen]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      // Category filter
      if (selectedCategorySlug !== "all") {
        const cat = categories.find((c) => c.slug === selectedCategorySlug);
        if (cat && svc.category_id !== cat.id) return false;
      }

      // Gender filter
      if (selectedGender !== "all") {
        const matchesGender =
          svc.gender?.includes(selectedGender) ||
          svc.gender?.includes("unisex") ||
          svc.audience === selectedGender ||
          svc.audience === "unisex";
        if (!matchesGender) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = svc.name.toLowerCase().includes(q);
        const matchesCat = svc.category_name.toLowerCase().includes(q);
        const matchesSub = svc.subcategory?.toLowerCase().includes(q);
        const matchesDesc = svc.short_desc?.toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesSub && !matchesDesc) return false;
      }

      return true;
    });
  }, [services, categories, selectedCategorySlug, selectedGender, searchQuery]);

  // Selected Count
  const selectedCount = useMemo(() => {
    return Object.values(selectedServices).filter((s) => s.selected).length;
  }, [selectedServices]);

  // Toggle single service
  const toggleService = (svc: MasterService) => {
    setSelectedServices((prev) => {
      const current = prev[svc.id];
      const isSelected = current?.selected ?? false;
      return {
        ...prev,
        [svc.id]: {
          selected: !isSelected,
          customPrice: current?.customPrice ?? svc.default_price,
          customDuration: current?.customDuration ?? svc.default_duration,
          customName: current?.customName ?? svc.name,
        },
      };
    });
  };

  // Select all in current filtered view
  const selectAllFiltered = () => {
    setSelectedServices((prev) => {
      const next = { ...prev };
      filteredServices.forEach((svc) => {
        next[svc.id] = {
          selected: true,
          customPrice: prev[svc.id]?.customPrice ?? svc.default_price,
          customDuration: prev[svc.id]?.customDuration ?? svc.default_duration,
          customName: prev[svc.id]?.customName ?? svc.name,
        };
      });
      return next;
    });
  };

  // Clear all selections
  const clearAllSelected = () => {
    setSelectedServices({});
  };

  // Adopt handler
  const handleAdoptSelected = async () => {
    const toAdopt = Object.entries(selectedServices)
      .filter(([_, v]) => v.selected)
      .map(([id, v]) => ({
        master_service_id: id,
        custom_name: v.customName,
        custom_price: v.customPrice,
        custom_duration: v.customDuration,
        branch_ids: selectedBranch?.id ? [selectedBranch.id] : [],
      }));

    if (toAdopt.length === 0) {
      addToast("warning", "No Services Selected", "Please check at least one service to adopt.");
      return;
    }

    setAdopting(true);
    try {
      const res = await MasterCatalogService.adoptServices({
        organization_id: currentOrganization?.id,
        branch_ids: selectedBranch?.id ? [selectedBranch.id] : [],
        services: toAdopt,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      addToast("success", "Catalog Adopted!", res.message || `Added ${toAdopt.length} services to your salon.`);

      try {
        const latestServices = await SalonCatalogService.getServices();
        if (latestServices && latestServices.length > 0) {
          setContextServices(latestServices);
        }
      } catch (err) {
        console.warn("Could not refetch services:", err);
      }

      if (onServicesAdopted) {
        onServicesAdopted();
      }

      onClose();
    } catch (err: any) {
      console.error("Adoption error:", err);
      addToast("error", "Adoption Failed", err.message || "Failed to adopt master services.");
    } finally {
      setAdopting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-bold">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>Master Service Catalog</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                  Global Standard Library
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Browse 15 curated categories. Select services to adopt into your salon and customize your pricing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services, skills, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-amber-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Audience:</span>
            {["all", "women", "men", "unisex", "kids"].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGender(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer shrink-0 ${
                  selectedGender === g
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {g}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <button
              onClick={selectAllFiltered}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition cursor-pointer shrink-0"
            >
              Select All ({filteredServices.length})
            </button>
            {selectedCount > 0 && (
              <button
                onClick={clearAllSelected}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer shrink-0"
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>

        {/* Modal Body: Left Category Tabs & Right Services Grid */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Left Category Sidebar */}
          <div className="md:col-span-1 p-3 overflow-y-auto max-h-48 md:max-h-full space-y-1 bg-slate-50/50">
            <button
              onClick={() => setSelectedCategorySlug("all")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedCategorySlug === "all"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200 font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>All Categories</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-mono">
                {services.length}
              </span>
            </button>

            {categories.map((cat) => {
              const isActive = selectedCategorySlug === cat.slug;
              const icon = CATEGORY_ICON_MAP[cat.icon_name] || <Sparkles className="w-4 h-4" />;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategorySlug(cat.slug)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200 font-bold"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? "text-amber-600" : "text-slate-400"}>{icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-mono shrink-0">
                    {cat.service_count || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Services Grid */}
          <div className="md:col-span-3 p-4 sm:p-6 overflow-y-auto max-h-[50vh] md:max-h-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                <span className="text-xs font-semibold">Loading Master Service Catalog...</span>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <Search className="w-8 h-8 mx-auto text-slate-300" />
                <div className="text-sm font-bold text-slate-700">No Services Found</div>
                <div className="text-xs">Try adjusting your filters or search keywords.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                {filteredServices.map((svc) => {
                  const state = selectedServices[svc.id] || { selected: false };
                  const isChecked = state.selected;

                  return (
                    <div
                      key={svc.id}
                      onClick={() => toggleService(svc)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 select-none ${
                        isChecked
                          ? "bg-amber-50/50 border-amber-400/80 ring-2 ring-amber-400/20 shadow-xs"
                          : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/40"
                      }`}
                    >
                      {/* Top row: Checkbox, Name, Subcategory */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                            isChecked
                              ? "bg-amber-500 border-amber-600 text-slate-950 font-bold"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-bold text-slate-900 leading-tight">
                              {svc.name}
                            </span>
                            {svc.subcategory && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                                {svc.subcategory}
                              </span>
                            )}
                            {svc.is_popular && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {svc.short_desc}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Info: Price range & Duration */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 text-slate-500">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{svc.default_duration} min</span>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="capitalize font-medium text-slate-600">
                            {svc.audience}
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-slate-900">
                            ₹{svc.default_price.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Suggested: ₹{svc.suggested_price_min} - ₹{svc.suggested_price_max}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer: Action Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Target Salon: <strong className="text-slate-900">{selectedBranch?.name || "All Branches"}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Selected: <strong className="text-amber-600 font-bold">{selectedCount}</strong> services
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              disabled={selectedCount === 0 || adopting}
              onClick={handleAdoptSelected}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                selectedCount > 0 && !adopting
                  ? "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {adopting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Adopting Services...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Adopt {selectedCount} Services to Salon Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
