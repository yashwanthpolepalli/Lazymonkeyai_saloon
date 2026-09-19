"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  Calendar,
  Clock,
  Scissors,
  Sparkles,
  User,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Tag,
  Star,
  ShieldCheck,
  CreditCard,
  Plus,
  Check,
  Lock,
  Filter,
} from "lucide-react";
import confetti from "canvas-confetti";
import { GenderType } from "@/types";

export function CustomerBookingView() {
  const {
    services,
    categories,
    stylists,
    selectedBranch,
    branches,
    setSelectedBranchId,
    currentCustomer,
    bookAppointment,
    addToast,
    setActiveSubTab,
    timeSlots,
    appointments,
  } = useSalon();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedAudience, setSelectedAudience] = useState<GenderType | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedStylistId, setSelectedStylistId] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [bookingTime, setBookingTime] = useState<string>("11:00 AM");
  const [notes, setNotes] = useState<string>("");

  // Helper to check if a specific time slot is available for the chosen date, branch, stylist, gender & services
  const checkSlotStatus = (timeStr: string) => {
    const configuredSlot = timeSlots.find((s) => s.time === timeStr);

    // 1. Check if the slot is blocked in master slot config
    if (configuredSlot && !configuredSlot.isAvailable) {
      return {
        isAvailable: false,
        reason: configuredSlot.blockedReason || "Slot Blocked by Salon Management",
        isBlocked: true,
        badgeText: configuredSlot.blockedReason || "Blocked",
      };
    }

    // 2. Check Audience / Gender matching
    if (configuredSlot && configuredSlot.allowedGenders && configuredSlot.allowedGenders.length > 0) {
      const allowed = configuredSlot.allowedGenders;
      // If user filtered by specific gender, verify slot accepts it
      if (
        selectedAudience !== "all" &&
        !allowed.includes(selectedAudience as GenderType) &&
        !allowed.includes("unisex")
      ) {
        const labels: Record<string, string> = { women: "Women Only 👩", men: "Men Only 👨", kids: "Kids Only 🧒" };
        const labelStr = allowed.map((g) => labels[g] || g).join(" & ");
        return {
          isAvailable: false,
          reason: `Slot reserved for ${labelStr} salon hours`,
          isBlocked: true,
          badgeText: labelStr,
        };
      }
    }

    // 3. Check Category / Service matching
    if (
      configuredSlot &&
      configuredSlot.allowedCategories &&
      configuredSlot.allowedCategories.length > 0 &&
      !configuredSlot.allowedCategories.includes("all")
    ) {
      const hasMismatch = selectedServices.some(
        (s) => !configuredSlot.allowedCategories!.includes(s.categoryId) && !configuredSlot.allowedCategories!.includes("all")
      );
      if (hasMismatch) {
        return {
          isAvailable: false,
          reason: `Reserved for ${configuredSlot.slotType === "bridal_suite" ? "Bridal & VIP Suites" : "Exclusive Categories"}`,
          isBlocked: true,
          badgeText: "Category Lock",
        };
      }
    }

    // 4. Check if an active appointment already occupies this slot
    const conflict = appointments.find(
      (apt) =>
        apt.date === bookingDate &&
        apt.timeSlot === timeStr &&
        apt.branchId === selectedBranch.id &&
        apt.status !== "cancelled" &&
        (selectedStylistId ? apt.stylistId === selectedStylistId : false)
    );

    if (conflict) {
      return {
        isAvailable: false,
        reason: `Reserved (${conflict.stylistName.split(" ")[0]})`,
        isBooked: true,
        badgeText: "Booked",
      };
    }

    // Compute audience badge text for open slot
    let slotAudienceLabel = "All Guests";
    if (configuredSlot?.slotType === "women_exclusive" || (configuredSlot?.allowedGenders?.length === 1 && configuredSlot.allowedGenders[0] === "women")) {
      slotAudienceLabel = "Women 👩";
    } else if (configuredSlot?.slotType === "men_grooming" || (configuredSlot?.allowedGenders?.length === 1 && configuredSlot.allowedGenders[0] === "men")) {
      slotAudienceLabel = "Men 👨";
    } else if (configuredSlot?.slotType === "kids_special" || configuredSlot?.allowedGenders?.includes("kids")) {
      slotAudienceLabel = "Kids 🧒";
    } else if (configuredSlot?.slotType === "bridal_suite") {
      slotAudienceLabel = "Bridal 👰";
    }

    return {
      isAvailable: true,
      badgeText: slotAudienceLabel,
    };
  };

  const filteredServices = services.filter((s) => {
    if (selectedCategory === "all") return true;
    return s.categoryId === selectedCategory;
  });

  const selectedServices = services.filter((s) =>
    selectedServiceIds.includes(s.id)
  );

  const selectedStylist = stylists.find((st) => st.id === selectedStylistId);

  const subtotal = selectedServices.reduce((sum, s) => sum + s.basePrice, 0);
  const discountRate = currentCustomer.membershipTier === "gold" ? 0.2 : currentCustomer.membershipTier === "platinum" ? 0.3 : 0.1;
  const discountAmount = Math.round(subtotal * discountRate);
  const taxAmount = Math.round((subtotal - discountAmount) * (selectedBranch.taxRate || 0.18));
  const finalTotal = subtotal - discountAmount + taxAmount;
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  const toggleService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      setSelectedServiceIds(selectedServiceIds.filter((sId) => sId !== id));
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const handleConfirmBooking = () => {
    if (selectedServices.length === 0) {
      addToast("warning", "Select Service", "Please select at least one service to proceed.");
      return;
    }
    const defaultStylist = selectedStylist || stylists[0];
    
    bookAppointment({
      branchId: selectedBranch.id,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone,
      stylistId: defaultStylist.id,
      stylistName: defaultStylist.name,
      date: bookingDate,
      time: bookingTime,
      services: selectedServices.map((s) => ({
        serviceId: s.id,
        serviceName: s.name,
        price: s.basePrice,
        durationMinutes: s.durationMinutes,
      })),
      totalAmount: finalTotal,
      notes: notes,
    });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    addToast(
      "success",
      "Appointment Confirmed!",
      `Reserved with ${defaultStylist.name} on ${bookingDate} at ${bookingTime}.`
    );

    setStep(4);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Wizard Progress Stepper */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 1 ? "bg-amber-500 text-white shadow-sm" : "bg-slate-100 text-slate-400"
              }`}
            >
              1
            </div>
            <span className="text-xs font-semibold text-slate-900 hidden sm:inline">Select Services</span>
          </div>
          <div className="h-0.5 w-12 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 2 ? "bg-amber-500 text-white shadow-sm" : "bg-slate-100 text-slate-400"
              }`}
            >
              2
            </div>
            <span className="text-xs font-semibold text-slate-900 hidden sm:inline">Stylist & Time</span>
          </div>
          <div className="h-0.5 w-12 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 3 ? "bg-amber-500 text-white shadow-sm" : "bg-slate-100 text-slate-400"
              }`}
            >
              3
            </div>
            <span className="text-xs font-semibold text-slate-900 hidden sm:inline">Review & Confirm</span>
          </div>
        </div>
      </div>

      {/* Step 1: Services Selection */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
                }`}
              >
                All Services ({services.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map((service) => {
                const isSelected = selectedServiceIds.includes(service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer ${
                      isSelected
                        ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md bg-amber-50/20"
                        : "border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                          {service.categoryName}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 mt-1">{service.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{service.shortDesc}</p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-amber-500 text-white" : "border border-slate-300 text-transparent"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{service.durationMinutes} mins</span>
                      </div>
                      <div className="font-bold text-sm text-slate-900">
                        ₹{service.basePrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm h-fit space-y-5">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-500" />
              <span>Selected Services ({selectedServices.length})</span>
            </h3>

            {selectedServices.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Click on any service card to add it to your appointment.
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-slate-100">
                {selectedServices.map((s) => (
                  <div key={s.id} className="pt-2 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{s.name}</div>
                      <div className="text-slate-400 text-[11px]">{s.durationMinutes} mins</div>
                    </div>
                    <div className="font-bold text-slate-900">₹{s.basePrice.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Estimated Duration:</span>
                <span className="font-semibold">{totalDuration} mins</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>VIP Member Discount:</span>
                  <span className="font-semibold">-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-100">
                <span>Total:</span>
                <span className="text-amber-600">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              disabled={selectedServices.length === 0}
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              <span>Next: Pick Stylist & Date</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Pick Stylist & Time */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Pick Stylist */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                <span>Choose Preferred Haute Stylist</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div
                  onClick={() => setSelectedStylistId("")}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedStylistId === ""
                      ? "border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm mb-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">Any Available Stylist</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Fastest assignment</div>
                </div>

                {stylists.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStylistId(st.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedStylistId === st.id
                        ? "border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatar}
                        alt={st.name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="text-left overflow-hidden">
                        <div className="font-bold text-xs text-slate-900 truncate">{st.name}</div>
                        <div className="text-[10px] uppercase font-semibold text-amber-700">{st.tier}</div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{st.rating} ({st.experienceYears}y exp)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pick Date & Time Slot */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-500" />
                <span>Select Appointment Date & Time Slot</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Branch Location</label>
                  <select
                    value={selectedBranch.id}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Audience / Gender Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-amber-500" />
                    <span>Filter Slots by Guest Audience / Gender</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Dedicated salon hours for Women, Men & Kids
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: "all", label: "All Audiences" },
                    { id: "women", label: "Women's Hours 👩" },
                    { id: "men", label: "Men's Hours 👨" },
                    { id: "kids", label: "Kids Friendly 🧒" },
                  ].map((aud) => (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setSelectedAudience(aud.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        selectedAudience === aud.id
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {aud.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">Available Haute Time Slots</label>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> Selected
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-400" /> Reserved / Restricted
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {timeSlots.map((slot) => {
                    const status = checkSlotStatus(slot.time);
                    const isSelected = bookingTime === slot.time;
                    const isDisabled = !status.isAvailable;

                    return (
                      <button
                        key={slot.id || slot.time}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          if (!isDisabled) setBookingTime(slot.time);
                        }}
                        title={status.reason || `Available slot (${status.badgeText})`}
                        className={`group relative py-2.5 px-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5 ${
                          isDisabled
                            ? "bg-slate-100/80 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                            : isSelected
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 scale-[1.02]"
                            : "bg-white hover:bg-amber-50/50 hover:border-amber-300 text-slate-800 border border-slate-200/90 shadow-2xs cursor-pointer"
                        }`}
                      >
                        <span className="font-mono text-xs">{slot.time}</span>
                        {isDisabled && (
                          <span className="text-[9px] font-normal truncate max-w-[95%] text-rose-500 font-sans">
                            {status.badgeText}
                          </span>
                        )}
                        {!isDisabled && !isSelected && (
                          <span
                            className={`text-[9px] font-normal truncate max-w-[95%] ${
                              slot.slotType === "women_exclusive"
                                ? "text-pink-600 font-semibold"
                                : slot.slotType === "men_grooming"
                                ? "text-sky-600 font-semibold"
                                : slot.slotType === "kids_special"
                                ? "text-amber-600 font-semibold"
                                : slot.slotType === "bridal_suite"
                                ? "text-purple-600 font-semibold"
                                : "text-emerald-600"
                            }`}
                          >
                            {status.badgeText}
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[9px] font-normal text-amber-100">
                            Selected
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Special Notes / Requests</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sensitive scalp, prefer quiet session, bridal trial..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>
          </div>

          {/* Review Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm h-fit space-y-5">
            <h3 className="font-bold text-base text-slate-900">Summary</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Branch:</span>
                <span className="font-semibold text-slate-900">{selectedBranch.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span className="font-semibold text-slate-900">{bookingDate} &bull; {bookingTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Stylist:</span>
                <span className="font-semibold text-slate-900">
                  {selectedStylist ? selectedStylist.name : "Any Available"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Services ({selectedServices.length}):</span>
                <span className="font-semibold text-slate-900">{totalDuration} mins</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Payable Total:</span>
                <span className="text-amber-600">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
              >
                <span>Review & Confirm</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review & Final Confirmation */}
      {step === 3 && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lg space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Review Your Booking Details</h2>
            <p className="text-xs text-slate-500">
              Please double-check your appointment slot and client details before confirming.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Client Name:</span>
              <span className="font-bold text-slate-900">{currentCustomer.name} ({currentCustomer.phone})</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Location:</span>
              <span className="font-bold text-slate-900">{selectedBranch.name}, {selectedBranch.city}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Date & Slot:</span>
              <span className="font-bold text-slate-900">{bookingDate} at {bookingTime}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Stylist Assigned:</span>
              <span className="font-bold text-amber-700">{selectedStylist ? selectedStylist.name : "First Available Stylist"}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Services Booked:</span>
              <ul className="space-y-1">
                {selectedServices.map((s) => (
                  <li key={s.id} className="flex justify-between text-slate-700">
                    <span>&bull; {s.name} ({s.durationMinutes}m)</span>
                    <span className="font-medium">₹{s.basePrice.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
              <span>Final Total (incl. Taxes & VIP Perk):</span>
              <span className="text-emerald-700">₹{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(2)}
              className="py-3.5 px-5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleConfirmBooking}
              className="flex-1 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Reserve Appointment</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success Screen */}
      {step === 4 && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Appointment Booked Successfully!</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your appointment has been confirmed at <b>{selectedBranch.name}</b> for{" "}
            <b>{bookingDate} at {bookingTime}</b>. We have sent a confirmation SMS & calendar invite.
          </p>

          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs text-amber-900 flex items-center justify-between">
            <span>VIP Reward Points Earned:</span>
            <span className="font-bold text-amber-700">+150 Points</span>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveSubTab("invoices")}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              View Invoices & Receipts
            </button>
            <button
              onClick={() => {
                setSelectedServiceIds([]);
                setStep(1);
              }}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-sm"
            >
              Book Another Service
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
