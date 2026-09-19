"use client";

import React, { useState, useMemo } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  Scissors,
  Sparkles,
  Clock,
  Tag,
  Star,
  Search,
  Filter,
  ShoppingBag,
  Plus,
  Check,
  ChevronRight,
  Crown,
  Upload,
  Download,
  Building2,
  Users,
  Info,
  Layers,
  X,
  Heart,
  Eye,
  Flame,
  Palette,
  CheckCircle2,
} from "lucide-react";
import { Service, GenderType, AddOn, ServiceOptionGroup, BookingSelectedOption } from "@/types";
import { downloadCsvFile, SAMPLE_SERVICES_CSV } from "@/lib/csvHelper";
import { DataImportModal } from "@/components/common/DataImportModal";

export function CustomerServicesView() {
  const {
    services,
    categories,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    addToCart,
    cart,
    addToast,
    setActiveSubTab,
  } = useSalon();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<GenderType | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [customizingService, setCustomizingService] = useState<Service | null>(null);

  // Selected variant per service card: { [serviceId]: 'men' | 'women' | 'kids' | 'unisex' }
  const [cardSelectedAudience, setCardSelectedAudience] = useState<Record<string, GenderType>>({});

  // Customizer Modal State
  const [modalAudience, setModalAudience] = useState<GenderType>("women");
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState<Record<string, string>>({});

  // Active branch details
  const currentBranch = useMemo(() => {
    return branches.find((b) => b.id === selectedBranchId) || branches[0];
  }, [branches, selectedBranchId]);

  // Categories visible for the active gender
  const availableCategories = useMemo(() => {
    if (genderFilter === "all") return categories;
    return categories.filter((cat) => {
      if (genderFilter === "men") {
        return (
          cat.gender.includes("men") ||
          cat.gender.includes("unisex") ||
          cat.id === "cat_beard" ||
          cat.id === "cat_hair"
        );
      }
      if (genderFilter === "women") {
        return (
          cat.gender.includes("women") ||
          cat.gender.includes("unisex") ||
          cat.id !== "cat_beard"
        );
      }
      if (genderFilter === "kids") {
        return cat.gender.includes("kids") || cat.id === "cat_hair" || cat.id === "cat_spa";
      }
      return true;
    });
  }, [categories, genderFilter]);

  // Subcategories available for active category
  const availableSubcategories = useMemo(() => {
    if (selectedCategory === "all") return [];
    const cat = categories.find((c) => c.id === selectedCategory);
    return cat?.subcategories || [];
  }, [categories, selectedCategory]);

  // Dynamic pricing and duration calculator per branch & audience
  const getComputedServicePricing = (service: Service, audience?: GenderType) => {
    const targetAudience =
      audience ||
      cardSelectedAudience[service.id] ||
      (genderFilter !== "all" ? genderFilter : service.gender[0] || "women");

    // Check if variant exists for this audience
    const variant = service.variants?.find((v) => v.audience === targetAudience && v.isActive);
    
    // Check branch pricing override
    const branchOverride = service.branchPricing?.[selectedBranchId];

    let basePrice = service.basePrice;
    let memberPrice = service.memberPrice || Math.round(service.basePrice * 0.8);
    let duration = service.durationMinutes;

    if (variant) {
      basePrice = variant.price;
      memberPrice = variant.memberPrice || Math.round(variant.price * 0.8);
      duration = variant.durationMinutes;
    }

    if (branchOverride && branchOverride.isActive) {
      basePrice = branchOverride.price;
      memberPrice = branchOverride.memberPrice || Math.round(branchOverride.price * 0.8);
      if (branchOverride.durationMinutes) {
        duration = branchOverride.durationMinutes;
      }
    }

    return {
      price: basePrice,
      memberPrice,
      durationMinutes: duration,
      audience: targetAudience,
      savings: basePrice - memberPrice,
    };
  };

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      // 1. Branch availability filter
      const isAvailableInBranch =
        s.branchIds.includes(selectedBranchId) ||
        s.branchIds.includes("all") ||
        s.branchIds.length === 0;
      if (!isAvailableInBranch) return false;

      // 2. Category filter
      if (selectedCategory !== "all" && s.categoryId !== selectedCategory) return false;

      // 3. Subcategory filter
      if (selectedSubcategory !== "all" && s.subcategory !== selectedSubcategory) return false;

      // 4. Gender / Audience filter
      if (genderFilter !== "all") {
        const matchesGenderArray = s.gender.includes(genderFilter) || s.gender.includes("unisex");
        const matchesVariant = s.variants?.some((v) => v.audience === genderFilter && v.isActive);
        if (!matchesGenderArray && !matchesVariant) return false;
      }

      // 5. Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchDesc = s.shortDesc.toLowerCase().includes(q) || s.fullDesc.toLowerCase().includes(q);
        const matchCat = s.categoryName.toLowerCase().includes(q);
        const matchSub = s.subcategory?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat && !matchSub) return false;
      }

      return true;
    });
  }, [services, selectedBranchId, selectedCategory, selectedSubcategory, genderFilter, searchQuery]);

  // Handle Quick Add
  const handleQuickAdd = (service: Service) => {
    const computed = getComputedServicePricing(service);
    addToCart({
      id: `cart_${Date.now()}_${service.id}`,
      type: "service",
      serviceId: service.id,
      name: `${service.name} (${computed.audience.toUpperCase()})`,
      price: computed.price,
      basePrice: computed.price,
      quantity: 1,
      durationMinutes: computed.durationMinutes,
      stylistId: "st_1",
      stylistName: "Senior Styling Specialist",
      selectedOptions: [],
      selectedAddOns: [],
      finalPrice: computed.price,
    });
    addToast(
      "success",
      "Added to Booking Cart",
      `${service.name} (${computed.audience}) for ₹${computed.price} added.`
    );
  };

  // Open Customizer Modal
  const openCustomizer = (service: Service) => {
    const defaultAud =
      cardSelectedAudience[service.id] ||
      (genderFilter !== "all" ? genderFilter : service.gender[0] || "women");
    setCustomizingService(service);
    setModalAudience(defaultAud);
    setSelectedAddOnIds([]);
    
    // Set default options if any
    const defaultOpts: Record<string, string> = {};
    if (service.optionGroups) {
      service.optionGroups.forEach((grp) => {
        if (grp.options.length > 0) {
          defaultOpts[grp.id] = grp.options[0].id;
        }
      });
    }
    setSelectedOptionIds(defaultOpts);
  };

  // Calculate modal total
  const modalCalculatedTotal = useMemo(() => {
    if (!customizingService) return { price: 0, duration: 0 };
    const base = getComputedServicePricing(customizingService, modalAudience);
    let totalPrice = base.price;
    let totalDuration = base.durationMinutes;

    // Add selected add-ons
    if (customizingService.addOns) {
      customizingService.addOns.forEach((addon) => {
        if (selectedAddOnIds.includes(addon.id)) {
          totalPrice += addon.price;
          totalDuration += addon.durationMinutes;
        }
      });
    }

    // Add option group price deltas
    if (customizingService.optionGroups) {
      customizingService.optionGroups.forEach((grp) => {
        const optId = selectedOptionIds[grp.id];
        const opt = grp.options.find((o) => o.id === optId);
        if (opt) {
          totalPrice += opt.priceDelta;
          totalDuration += opt.durationDeltaMinutes;
        }
      });
    }

    return { price: totalPrice, duration: totalDuration };
  }, [customizingService, modalAudience, selectedAddOnIds, selectedOptionIds]);

  // Add from Customizer Modal
  const handleModalAddToCart = () => {
    if (!customizingService) return;
    const base = getComputedServicePricing(customizingService, modalAudience);

    const chosenAddOns = (customizingService.addOns || []).filter((a) =>
      selectedAddOnIds.includes(a.id)
    );

    const chosenOptions: BookingSelectedOption[] = [];
    if (customizingService.optionGroups) {
      customizingService.optionGroups.forEach((grp) => {
        const optId = selectedOptionIds[grp.id];
        const opt = grp.options.find((o) => o.id === optId);
        if (opt) {
          chosenOptions.push({
            groupId: grp.id,
            groupName: grp.name,
            optionId: opt.id,
            optionLabel: opt.label,
            priceDelta: opt.priceDelta,
          });
        }
      });
    }

    addToCart({
      id: `cart_${Date.now()}_${customizingService.id}`,
      type: "service",
      serviceId: customizingService.id,
      name: `${customizingService.name} (${modalAudience.toUpperCase()})`,
      price: modalCalculatedTotal.price,
      basePrice: base.price,
      quantity: 1,
      durationMinutes: modalCalculatedTotal.duration,
      stylistId: "st_1",
      stylistName: "Senior Styling Specialist",
      selectedOptions: chosenOptions,
      selectedAddOns: chosenAddOns,
      finalPrice: modalCalculatedTotal.price,
    });

    addToast(
      "success",
      "Custom Treatment Added",
      `${customizingService.name} customized and added for ₹${modalCalculatedTotal.price}.`
    );
    setCustomizingService(null);
  };

  // Download Sample Master CSV
  const handleDownloadSample = () => {
    downloadCsvFile("lazymonkey_master_salon_services_sample.csv", SAMPLE_SERVICES_CSV);
    addToast(
      "success",
      "Sample CSV Saved",
      "Universal 12-category salon services template downloaded to your device."
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 font-sans">
      {/* 1. Header Banner & Action Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-violet-800/40">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Crown className="w-64 h-64 text-yellow-300" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold uppercase tracking-wider text-amber-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Universal Salon Master Catalog</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Dynamic Services Matrix & Haute Treatments
            </h1>
            <p className="text-violet-200/90 text-xs sm:text-sm font-normal leading-relaxed">
              Every salon branch features customized pricing, multi-gender duration variants, and
              curated master treatments tailored for Men, Women & Kids.
            </p>
          </div>

          {/* Import / Export Action Tools */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition-all backdrop-blur-md hover:scale-[1.02] shadow-sm cursor-pointer"
              title="Download sample CSV template with 12 master categories"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Sample CSV</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold transition-all hover:scale-[1.02] shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-950" />
              <span>Import Services CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Control Hub: Branch Selector, Gender Switcher, Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Branch / Salon Switcher */}
          <div className="md:col-span-4 relative">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-violet-600" />
              <span>Active Salon Branch:</span>
            </label>
            <div className="relative">
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city}) • {b.branchType || "Studio"}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>
          </div>

          {/* Gender Filter Tabs (Men, Women, Kids, All) */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-pink-600" />
              <span>Audience / Gender:</span>
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70">
              {[
                { id: "all", label: "✨ All", color: "text-slate-900" },
                { id: "women", label: "👩 Women", color: "text-pink-700" },
                { id: "men", label: "👨 Men", color: "text-blue-700" },
                { id: "kids", label: "🧒 Kids", color: "text-amber-700" },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setGenderFilter(g.id as any);
                    setSelectedSubcategory("all");
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                    genderFilter === g.id
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-950/5"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-amber-600" />
              <span>Search Catalog:</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search haircuts, facials, waxing, bridal..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. 12 Master Categories Navigation Bar */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-violet-600" />
              <span>12 Master Service Categories</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Showing {filteredServices.length} treatments at {currentBranch.name}
            </span>
          </div>

          {/* Horizontal Category Slider Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedSubcategory("all");
              }}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                selectedCategory === "all"
                  ? "bg-slate-900 text-white shadow-md shadow-slate-950/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>✨ All Categories</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">
                {services.length}
              </span>
            </button>

            {availableCategories.map((cat) => {
              const count = services.filter(
                (s) =>
                  s.categoryId === cat.id &&
                  (s.branchIds.includes(selectedBranchId) || s.branchIds.includes("all"))
              ).length;

              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubcategory("all");
                  }}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-600/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{cat.name}</span>
                  {count > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                        isSelected ? "bg-white/25 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Subcategory Pills (when a specific category is active) */}
          {selectedCategory !== "all" && availableSubcategories.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-2 animate-in fade-in duration-200">
              <span className="text-[11px] font-bold text-slate-600 mr-1">Subcategory:</span>
              <button
                onClick={() => setSelectedSubcategory("all")}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedSubcategory === "all"
                    ? "bg-violet-100 text-violet-800 ring-1 ring-violet-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Subcategories
              </button>
              {availableSubcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedSubcategory === sub
                      ? "bg-violet-100 text-violet-800 ring-1 ring-violet-300"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Active Filter Notice Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs px-2 text-slate-500">
        <div className="flex items-center gap-2">
          <span>Branch:</span>
          <span className="font-bold text-slate-900">{currentBranch.name}</span>
          <span>•</span>
          <span>Target Audience:</span>
          <span className="font-bold text-slate-900 uppercase">
            {genderFilter === "all" ? "All Genders" : genderFilter}
          </span>
          {selectedCategory !== "all" && (
            <>
              <span>•</span>
              <span>Category:</span>
              <span className="font-bold text-violet-700">
                {categories.find((c) => c.id === selectedCategory)?.name}
              </span>
            </>
          )}
          {selectedSubcategory !== "all" && (
            <>
              <span>•</span>
              <span>Subcategory:</span>
              <span className="font-bold text-violet-700">{selectedSubcategory}</span>
            </>
          )}
        </div>

        {(selectedCategory !== "all" ||
          selectedSubcategory !== "all" ||
          genderFilter !== "all" ||
          searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedSubcategory("all");
              setGenderFilter("all");
              setSearchQuery("");
            }}
            className="text-violet-600 font-bold hover:underline cursor-pointer"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* 5. Services Card Grid */}
      {filteredServices.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto text-2xl font-bold">
            <Scissors className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Services Found</h3>
          <p className="text-xs text-slate-500">
            No treatments matched your criteria for {currentBranch.name}. Try changing your category,
            switching gender filter, or import new services.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedSubcategory("all");
                setGenderFilter("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-all cursor-pointer"
            >
              Import Services CSV
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map((service) => {
            const computed = getComputedServicePricing(service);
            const isInCart = cart.some(
              (item) => item.type === "service" && item.serviceId === service.id
            );

            return (
              <div
                key={service.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
              >
                {/* Image Header with Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                      {service.categoryName}
                    </span>
                    {service.subcategory && (
                      <span className="px-2 py-0.5 rounded-full bg-violet-600/80 backdrop-blur-md text-[9px] font-bold text-white">
                        {service.subcategory}
                      </span>
                    )}
                  </div>

                  {service.isPopular && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-slate-950" />
                      <span>BESTSELLER</span>
                    </div>
                  )}

                  {/* Bottom Duration & Branch Badge */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold">
                    <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-amber-300" />
                      <span>{computed.durationMinutes} mins</span>
                    </span>
                    <span className="text-[10px] text-violet-200 truncate max-w-[130px]">
                      {currentBranch.city} Atelier
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-violet-700 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {service.shortDesc}
                    </p>

                    {/* Audience Variant Pills Selector */}
                    {service.variants && service.variants.length > 1 && (
                      <div className="pt-2">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Audience / Variant:
                        </span>
                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                          {service.variants.map((v) => {
                            const isAudienceSelected = computed.audience === v.audience;
                            return (
                              <button
                                key={v.audience}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCardSelectedAudience((prev) => ({
                                    ...prev,
                                    [service.id]: v.audience,
                                  }));
                                }}
                                className={`flex-1 py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                                  isAudienceSelected
                                    ? "bg-violet-600 text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                {v.audience} • ₹{v.price}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing & Cart Action Block */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Regular Rate
                        </span>
                        <span className="text-lg font-black text-slate-900">
                          ₹{computed.price.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* VIP Member Price highlight */}
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-amber-600 uppercase flex items-center gap-1 justify-end">
                          <Crown className="w-3 h-3 text-amber-500" />
                          <span>VIP Member</span>
                        </span>
                        <span className="text-sm font-bold text-violet-700">
                          ₹{computed.memberPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="block text-[9px] font-bold text-emerald-600">
                          Save ₹{computed.savings}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openCustomizer(service)}
                        className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5 text-slate-500" />
                        <span>Customize</span>
                      </button>

                      <button
                        onClick={() => handleQuickAdd(service)}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isInCart
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                            : "bg-slate-900 hover:bg-violet-700 text-white shadow-md"
                        }`}
                      >
                        {isInCart ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>In Cart</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Quick Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Sticky Quick Cart Drawer Bar (if items in cart) */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl bg-slate-950 text-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-violet-500/30 backdrop-blur-xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-300">
                {cart.length} {cart.length === 1 ? "Treatment" : "Treatments"} in Booking Basket
              </div>
              <div className="text-base font-black text-white">
                ₹
                {cart
                  .reduce((sum, item) => sum + item.finalPrice * item.quantity, 0)
                  .toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab("booking")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Review & Book Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 7. Service Customizer Drawer / Modal */}
      {customizingService && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl space-y-6 p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider bg-violet-50 px-2.5 py-0.5 rounded-full">
                  {customizingService.categoryName} • {customizingService.subcategory || "Treatment"}
                </span>
                <h2 className="text-xl font-bold text-slate-900">{customizingService.name}</h2>
              </div>
              <button
                onClick={() => setCustomizingService(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed">{customizingService.fullDesc}</p>

            {/* Audience / Variant Selection */}
            {customizingService.variants && customizingService.variants.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                  1. Select Target Audience:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {customizingService.variants.map((v) => (
                    <button
                      key={v.audience}
                      onClick={() => setModalAudience(v.audience)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        modalAudience === v.audience
                          ? "border-violet-600 bg-violet-50/50 ring-2 ring-violet-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="text-xs font-bold capitalize text-slate-900">
                        {v.audience === "women"
                          ? "👩 Women"
                          : v.audience === "men"
                          ? "👨 Men"
                          : "🧒 Kids"}
                      </div>
                      <div className="text-xs font-black text-violet-700 mt-1">₹{v.price}</div>
                      <div className="text-[10px] text-slate-400">{v.durationMinutes} mins</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Option Groups (e.g. Hair Length, Skin Type) */}
            {customizingService.optionGroups && customizingService.optionGroups.length > 0 && (
              <div className="space-y-4">
                {customizingService.optionGroups.map((grp) => (
                  <div key={grp.id} className="space-y-2">
                    <label className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                      {grp.name}:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {grp.options.map((opt) => {
                        const isSelected = selectedOptionIds[grp.id] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() =>
                              setSelectedOptionIds((prev) => ({ ...prev, [grp.id]: opt.id }))
                            }
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "border-violet-600 bg-violet-50 text-violet-950 font-bold"
                                : "border-slate-200 hover:border-slate-300 text-slate-700"
                            }`}
                          >
                            <span className="text-xs">{opt.label}</span>
                            <span className="text-xs font-semibold text-slate-500">
                              {opt.priceDelta > 0 ? `+₹${opt.priceDelta}` : "Included"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add-Ons */}
            {customizingService.addOns && customizingService.addOns.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                  Recommended Add-On Treatments:
                </label>
                <div className="space-y-2">
                  {customizingService.addOns.map((addon) => {
                    const isChecked = selectedAddOnIds.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() =>
                          setSelectedAddOnIds((prev) =>
                            isChecked ? prev.filter((id) => id !== addon.id) : [...prev, addon.id]
                          )
                        }
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isChecked
                            ? "border-violet-600 bg-violet-50/60"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            {isChecked ? (
                              <CheckCircle2 className="w-4 h-4 text-violet-600" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-300" />
                            )}
                            <span>{addon.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 pl-5.5">{addon.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-slate-900">+₹{addon.price}</span>
                          <span className="block text-[10px] text-slate-400">
                            +{addon.durationMinutes} mins
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modal Bottom Summary & CTA */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Total Investment ({modalCalculatedTotal.duration} mins)
                </span>
                <span className="text-2xl font-black text-slate-900">
                  ₹{modalCalculatedTotal.price.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCustomizingService(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalAddToCart}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Booking</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Data Import Modal for Bulk CSV / Excel Dump */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        dataType="services"
      />
    </div>
  );
}
