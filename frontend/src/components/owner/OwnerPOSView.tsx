"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import { GenderType } from "@/types";
import {
  CreditCard,
  ShoppingBag,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  DollarSign,
  User,
  Scissors,
  Tag,
  Search,
  Receipt,
  QrCode,
  Sparkles,
  Building,
} from "lucide-react";
import confetti from "canvas-confetti";

export function OwnerPOSView() {
  const {
    services,
    categories,
    inventory,
    customers,
    stylists,
    selectedBranch,
    currentCustomer,
    setCurrentCustomer,
    gstSettings,
    addToast,
  } = useSalon();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers[0]?.id || ""
  );
  const [selectedStylistId, setSelectedStylistId] = useState<string>(
    stylists[0]?.id || ""
  );
  const [cartItems, setCartItems] = useState<
    { id: string; name: string; price: number; type: "service" | "product"; duration?: number; qty: number; audience?: string }[]
  >([]);

  const [paymentMode, setPaymentMode] = useState<"cash" | "card" | "upi" | "wallet">("card");
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [searchService, setSearchService] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAudienceFilter, setSelectedAudienceFilter] = useState<GenderType | "all">("all");
  const [cardQtys, setCardQtys] = useState<Record<string, number>>({});
  const [selectedServiceVariant, setSelectedServiceVariant] = useState<Record<string, string>>({});
  const [lastGeneratedInvoice, setLastGeneratedInvoice] = useState<any | null>(null);

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
  const totalItemCount = cartItems.reduce((sum, item) => sum + (item.qty || 1), 0);
  
  const effectiveDiscountPercent = gstSettings.isDiscountEnabled ? discountPercent : 0;
  const discountAmount = Math.round((subtotal * effectiveDiscountPercent) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  
  const isSgstActive = gstSettings.isGstEnabled && (gstSettings.isSgstEnabled ?? true);
  const isCgstActive = gstSettings.isGstEnabled && (gstSettings.isCgstEnabled ?? true);
  const isIgstActive = gstSettings.isGstEnabled && (gstSettings.isIgstEnabled ?? false);

  const sgstAmount = isSgstActive
    ? Math.round((taxableAmount * (gstSettings.sgstRatePct || 0)) / 100)
    : 0;
  const cgstAmount = isCgstActive
    ? Math.round((taxableAmount * (gstSettings.cgstRatePct || 0)) / 100)
    : 0;
  const igstAmount = isIgstActive
    ? Math.round((taxableAmount * (gstSettings.igstRatePct || 0)) / 100)
    : 0;

  const taxAmount = sgstAmount + cgstAmount + igstAmount;
  const finalTotal = taxableAmount + taxAmount;

  const addItemToBill = (
    item: { id: string; name: string; price: number; type: "service" | "product"; duration?: number; audience?: string },
    qtyToAdd: number = 1
  ) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === item.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].qty = (copy[existingIdx].qty || 1) + qtyToAdd;
        return copy;
      }
      return [...prev, { ...item, qty: qtyToAdd }];
    });
    addToast("info", "Item Added", `Added ${qtyToAdd}x ${item.name} to bill.`);
  };

  const removeItem = (idx: number) => {
    setCartItems(cartItems.filter((_, i) => i !== idx));
  };

  const handleCheckoutAndPrint = () => {
    if (cartItems.length === 0) {
      addToast("warning", "Empty Bill", "Please add at least one service or retail product.");
      return;
    }

    const inv = {
      id: `INV-POS-${Math.floor(10000 + Math.random() * 90000)}`,
      customer: activeCustomer,
      items: cartItems,
      subtotal,
      discountAmount,
      taxAmount,
      finalTotal,
      paymentMode,
      date: new Date().toLocaleString(),
    };

    setLastGeneratedInvoice(inv);

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });

    addToast(
      "success",
      "Invoice Generated & Settled!",
      `Bill ${inv.id} for ₹${finalTotal.toLocaleString()} settled via ${paymentMode.toUpperCase()}.`
    );
  };

  const getComputedPricing = (s: any) => {
    const isMember = activeCustomer?.membershipTier && activeCustomer.membershipTier !== "Regular";
    const chosenAudience =
      selectedServiceVariant[s.id] ||
      (selectedAudienceFilter !== "all" ? selectedAudienceFilter : null) ||
      (activeCustomer?.gender && s.variants?.some((v: any) => v.audience === activeCustomer.gender)
        ? activeCustomer.gender
        : s.variants?.[0]?.audience || s.gender?.[0] || "women");

    const variant = s.variants?.find((v: any) => v.audience === chosenAudience && v.isActive !== false);

    let price = s.basePrice;
    let duration = s.durationMinutes;

    if (variant) {
      price = isMember && variant.memberPrice ? variant.memberPrice : variant.price;
      duration = variant.durationMinutes || s.durationMinutes;
    } else {
      price = isMember && s.memberPrice ? s.memberPrice : s.basePrice;
    }

    return {
      price,
      duration,
      audience: chosenAudience,
      hasMultipleVariants: (s.variants?.length || 0) > 1,
      variants: s.variants || [],
      isMemberPrice: isMember && ((variant && !!variant.memberPrice) || !!s.memberPrice),
    };
  };

  const filteredServices = services.filter((s) => {
    // 1. Search Query
    const matchSearch =
      searchService.trim() === "" ||
      s.name.toLowerCase().includes(searchService.toLowerCase()) ||
      s.categoryName.toLowerCase().includes(searchService.toLowerCase());
    if (!matchSearch) return false;

    // 2. Category Filter
    if (selectedCategory !== "all" && s.categoryId !== selectedCategory) return false;

    // 3. Audience Filter
    if (selectedAudienceFilter !== "all") {
      const matchGender = s.gender?.includes(selectedAudienceFilter) || s.gender?.includes("unisex");
      const matchVariant = s.variants?.some((v: any) => v.audience === selectedAudienceFilter && v.isActive !== false);
      if (!matchGender && !matchVariant) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Point of Sale & Billing Terminal
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Salon POS & Billings
          </h1>
          <p className="text-xs text-slate-500">
            Quick itemized billing, multi-payment split, GST calculation, and instant thermal receipt printing.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Terminal Register</span>
          <span className="font-mono font-bold text-sm text-slate-800">POS-01 (ACTIVE)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Service & Product Quick-Add Catalog */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer & Stylist Selector Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - {c.membershipTier || "Regular"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Serving Stylist</label>
              <select
                value={selectedStylistId}
                onChange={(e) => setSelectedStylistId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 capitalize"
              >
                {stylists.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.tier})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick-Add Item Grid */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h3 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
                <span>Click to Add Service or Product to Bill</span>
              </h3>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Gender / Audience Dropdown */}
                <div className="relative">
                  <select
                    value={selectedAudienceFilter}
                    onChange={(e) => setSelectedAudienceFilter(e.target.value as any)}
                    className="pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer shadow-2xs"
                  >
                    <option value="all">✨ All Genders</option>
                    <option value="men">👨 Men</option>
                    <option value="women">👩 Women</option>
                    <option value="kids">🧒 Kids</option>
                  </select>
                </div>

                {/* Quick Search */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchService}
                    onChange={(e) => setSearchService(e.target.value)}
                    placeholder="Quick search..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
            </div>

            {/* Interactive Gender Quick Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
              {[
                { id: "all", label: "✨ All Genders" },
                { id: "men", label: "👨 Men" },
                { id: "women", label: "👩 Women" },
                { id: "kids", label: "🧒 Kids" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedAudienceFilter(tab.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedAudienceFilter === tab.id
                      ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-900/5"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dynamic Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto no-scrollbar pr-1">
              {filteredServices.map((s) => {
                const qty = cardQtys[s.id] || 1;
                const computed = getComputedPricing(s);

                return (
                  <div
                    key={s.id}
                    onClick={() =>
                      addItemToBill(
                        {
                          id: `${s.id}_${computed.audience}`,
                          name: computed.hasMultipleVariants
                            ? `${s.name} (${computed.audience.toUpperCase()})`
                            : s.name,
                          price: computed.price,
                          type: "service",
                          duration: computed.duration,
                          audience: computed.audience,
                        },
                        qty
                      )
                    }
                    className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          {s.categoryName}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {computed.duration}m
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-1 line-clamp-1 group-hover:text-emerald-800">
                        {s.name}
                      </h4>
                    </div>

                    {/* Dynamic Variant Selector Pills if service has multiple audience variants */}
                    {computed.hasMultipleVariants && (
                      <div
                        className="flex items-center gap-1 flex-wrap pt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {computed.variants.map((v: any) => {
                          const isSelected = computed.audience === v.audience;
                          return (
                            <button
                              key={v.audience}
                              type="button"
                              onClick={() =>
                                setSelectedServiceVariant((prev) => ({
                                  ...prev,
                                  [s.id]: v.audience,
                                }))
                              }
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-slate-900 text-white shadow-2xs"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {v.audience} (₹{v.price})
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100 text-xs">
                      {/* Qty Stepper to Add */}
                      <div
                        className="flex items-center bg-slate-100 border border-slate-200 rounded-lg overflow-hidden shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setCardQtys((prev) => ({
                              ...prev,
                              [s.id]: Math.max(1, (prev[s.id] || 1) - 1),
                            }))
                          }
                          className="px-2 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Decrease Qty"
                        >
                          -
                        </button>
                        <span className="px-1.5 py-1 text-xs font-mono font-bold text-slate-800 min-w-[18px] text-center select-none">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setCardQtys((prev) => ({
                              ...prev,
                              [s.id]: (prev[s.id] || 1) + 1,
                            }))
                          }
                          className="px-2 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Increase Qty"
                        >
                          +
                        </button>
                      </div>

                      {/* Gender Dropdown in between Qty and Price */}
                      <div
                        className="flex-1 min-w-[90px] max-w-[125px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={computed.audience}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSelectedServiceVariant((prev) => ({
                              ...prev,
                              [s.id]: e.target.value,
                            }));
                          }}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 hover:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer capitalize truncate"
                          title="Select Gender / Audience"
                        >
                          {computed.hasMultipleVariants ? (
                            computed.variants.map((v: any) => (
                              <option key={v.audience} value={v.audience}>
                                {v.audience === "men"
                                  ? "👨 Men"
                                  : v.audience === "women"
                                  ? "👩 Women"
                                  : v.audience === "kids"
                                  ? "🧒 Kids"
                                  : "✨ Unisex"}
                              </option>
                            ))
                          ) : (
                            <option value={computed.audience}>
                              {computed.audience === "men"
                                ? "👨 Men"
                                : computed.audience === "women"
                                ? "👩 Women"
                                : computed.audience === "kids"
                                ? "🧒 Kids"
                                : "✨ Unisex"}
                            </option>
                          )}
                        </select>
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        <span className="font-bold font-mono text-slate-900 text-xs sm:text-sm">
                          ₹{computed.price.toLocaleString()}
                        </span>
                        {computed.isMemberPrice && (
                          <span className="block text-[9px] font-semibold text-emerald-600">VIP Rate</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live Receipt & Settlement */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 tracking-tight">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  <span>Current Bill</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Guest: <span className="font-semibold text-slate-800">{activeCustomer.name}</span>
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                {totalItemCount} Items
              </span>
            </div>

            {/* Cart Table without Quantity Steppers */}
            <div className="space-y-2 divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No items on bill. Click service cards to add.
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex-1 pr-2">
                      <div className="font-semibold text-slate-900 truncate">{item.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.qty > 1 && <span className="font-bold text-slate-700 mr-1.5">{item.qty} &times;</span>}
                        <span>{item.duration ? `${item.duration} mins` : "Retail item"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold font-mono text-slate-900 min-w-[64px] text-right">
                        ₹{(item.price * (item.qty || 1)).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-slate-300 hover:text-rose-500 cursor-pointer p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Discount & Taxes Math */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-900">₹{subtotal.toLocaleString()}</span>
              </div>

              {/* Discount Section */}
              {gstSettings.isDiscountEnabled ? (
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700 font-semibold">Special / VIP Discount (%):</span>
                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    {(gstSettings.defaultDiscountPresets || [0, 5, 10, 15, 20]).map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setDiscountPercent(pct)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-all ${
                          discountPercent === pct
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Discount:</span>
                  <span>Disabled in Settings</span>
                </div>
              )}

              {discountAmount > 0 && gstSettings.isDiscountEnabled && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({effectiveDiscountPercent}%):</span>
                  <span className="font-mono">-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}

              {/* Tax / GST Section */}
              {gstSettings.isGstEnabled && taxAmount > 0 ? (
                <div className="space-y-1 pt-1">
                  {isCgstActive && cgstAmount > 0 && (
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>CGST ({gstSettings.cgstRatePct}%):</span>
                      <span className="font-mono text-slate-700">₹{cgstAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {isSgstActive && sgstAmount > 0 && (
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>SGST ({gstSettings.sgstRatePct}%):</span>
                      <span className="font-mono text-slate-700">₹{sgstAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {isIgstActive && igstAmount > 0 && (
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>IGST ({gstSettings.igstRatePct}%):</span>
                      <span className="font-mono text-slate-700">₹{igstAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>Total Tax:</span>
                    <span className="font-mono text-slate-900 font-bold">₹{taxAmount.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                  <span>GST Tax:</span>
                  <span>₹0 ({!gstSettings.isGstEnabled ? "Tax Disabled" : "All Slabs Off"})</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                <span>Grand Total:</span>
                <span className="text-emerald-700 text-lg font-mono">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Tender Payment Mode</label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[
                  { id: "card", label: "Card Swipe" },
                  { id: "upi", label: "UPI / QR" },
                  { id: "cash", label: "Cash" },
                  { id: "wallet", label: "Wallet" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setPaymentMode(mode.id as any)}
                    className={`py-2 rounded-xl font-semibold capitalize transition-all cursor-pointer ${
                      paymentMode === mode.id
                        ? "bg-sky-500 text-white shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleCheckoutAndPrint}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
            >
              <Printer className="w-4 h-4" />
              <span>Settle & Print Invoice (₹{finalTotal.toLocaleString()})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
