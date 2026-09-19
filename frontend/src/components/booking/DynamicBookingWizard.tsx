"use client";

import React, { useState, useMemo } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  GenderType,
  Service,
  Stylist,
  BookingSelectedOption,
  AddOn,
  CustomerMembership,
} from "@/types";
import { calculateDynamicPricing } from "@/services/pricingEngine";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Scissors,
  Sparkles,
  User,
  Calendar,
  Clock,
  Crown,
  Wallet,
  Coins,
  Tag,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Star,
  MapPin,
  Check,
  ShieldCheck,
  ArrowRight,
  Flame,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

export function DynamicBookingWizard({ onComplete }: { onComplete?: () => void }) {
  const {
    branches,
    selectedBranchId,
    setSelectedBranchId,
    selectedBranch,
    categories,
    filteredServices,
    filteredStylists,
    currentCustomer,
    coupons,
    addAppointment,
  } = useSalon();

  // Wizard Step (1 through 8)
  const [step, setStep] = useState<number>(1);

  // Selected State
  const [selectedGender, setSelectedGender] = useState<GenderType>("women");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("cat_hair");
  const [selectedService, setSelectedService] = useState<Service | null>(filteredServices[0] || null);
  const [selectedOptions, setSelectedOptions] = useState<BookingSelectedOption[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(filteredStylists[0] || null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("11:30");

  // Benefits & checkout toggles
  const [useMembership, setUseMembership] = useState<boolean>(true);
  const [usePackageCredit, setUsePackageCredit] = useState<boolean>(false);
  const [walletToApply, setWalletToApply] = useState<number>(0);
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState<number>(0);
  const [couponCodeInput, setCouponCodeInput] = useState<string>("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>("");

  // Customer Contact Info for guest or logged in
  const [clientName, setClientName] = useState<string>(currentCustomer.name);
  const [clientPhone, setClientPhone] = useState<string>(currentCustomer.phone);
  const [clientEmail, setClientEmail] = useState<string>(currentCustomer.email);
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string>("");

  // Dynamic filter for services by category and gender
  const availableServices = useMemo(() => {
    return filteredServices.filter(
      (s) =>
        s.categoryId === selectedCategoryId &&
        (s.gender.includes(selectedGender) || s.gender.includes("unisex"))
    );
  }, [filteredServices, selectedCategoryId, selectedGender]);

  // Applied Coupon object
  const activeCoupon = useMemo(() => {
    return coupons.find((c) => c.code.toUpperCase() === appliedCouponCode.toUpperCase());
  }, [coupons, appliedCouponCode]);

  // Current customer membership if active
  const activeMembership: CustomerMembership | undefined = useMemo(() => {
    if (useMembership && currentCustomer.membership && currentCustomer.membership.active) {
      return currentCustomer.membership;
    }
    return undefined;
  }, [useMembership, currentCustomer]);

  // Dynamic Pricing Breakdown
  const pricing = useMemo(() => {
    if (!selectedService || !selectedStylist) {
      return null;
    }
    return calculateDynamicPricing({
      service: selectedService,
      selectedOptions,
      selectedAddOns,
      stylistTier: selectedStylist.tier,
      branch: selectedBranch,
      membership: activeMembership,
      usePackageCredit,
      walletToUse: walletToApply,
      loyaltyPointsToRedeem,
      coupon: activeCoupon,
    });
  }, [
    selectedService,
    selectedStylist,
    selectedOptions,
    selectedAddOns,
    selectedBranch,
    activeMembership,
    usePackageCredit,
    walletToApply,
    loyaltyPointsToRedeem,
    activeCoupon,
  ]);

  // Available Time Slots for selected date
  const availableTimeSlots = [
    "10:00 AM",
    "11:00 AM",
    "11:30 AM",
    "01:00 PM",
    "02:30 PM",
    "03:45 PM",
    "05:00 PM",
    "06:30 PM",
    "07:45 PM",
  ];

  // Option selection handler
  const handleSelectOption = (
    groupId: string,
    groupName: string,
    optionId: string,
    optionLabel: string,
    priceDelta: number
  ) => {
    setSelectedOptions((prev) => {
      const filtered = prev.filter((o) => o.groupId !== groupId);
      return [...filtered, { groupId, groupName, optionId, optionLabel, priceDelta }];
    });
  };

  // AddOn toggle handler
  const handleToggleAddOn = (addon: AddOn) => {
    setSelectedAddOns((prev) => {
      const exists = prev.find((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  // Confirm booking
  const handleConfirmBooking = () => {
    if (!selectedService || !selectedStylist || !pricing) return;

    const newApt = addAppointment({
      customerId: currentCustomer.id,
      customerName: clientName || currentCustomer.name,
      customerPhone: clientPhone || currentCustomer.phone,
      customerEmail: clientEmail || currentCustomer.email,
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      categoryName: selectedService.categoryName,
      stylistId: selectedStylist.id,
      stylistName: selectedStylist.name,
      stylistTier: selectedStylist.tier,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      durationMinutes: selectedService.durationMinutes,
      selectedOptions,
      selectedAddOns,
      status: "confirmed",
      basePrice: pricing.basePrice,
      optionsPrice: pricing.optionsPrice,
      addOnsPrice: pricing.addOnsPrice,
      stylistTierMarkup: pricing.stylistMarkup,
      subtotal: pricing.subtotal,
      membershipDiscount: pricing.membershipDiscount,
      packageCreditUsed: pricing.packageCreditApplied,
      walletUsed: pricing.walletUsed,
      loyaltyDiscount: pricing.loyaltyDiscount,
      couponDiscount: pricing.couponDiscount,
      couponCode: activeCoupon?.code,
      taxAmount: pricing.taxAmount,
      finalTotal: pricing.finalTotal,
      paymentStatus: pricing.amountPayableAtCounter === 0 ? "paid" : "unpaid",
    });

    setConfirmedBookingRef(newApt.bookingRef);
    setStep(8); // Confirmation step

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#C5A059", "#DFCA95", "#FAF8F5", "#121110"],
      });
    } catch {
      // safe fallback
    }

    if (onComplete) onComplete();
  };

  const stepsList = [
    "Salon & Branch",
    "Gender & Category",
    "Select Service",
    "Custom Options",
    "Artisan Stylist",
    "Date & Schedule",
    "VIP Privileges & Pay",
    "Confirmation",
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header & Stepper */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Haute Couture Bespoke Experience</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium text-stone-900 mt-1">
              Reserve Your Salon Ritual
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Active Destination: <span className="font-semibold text-stone-800">{selectedBranch.name}</span> ({selectedBranch.city})
            </p>
          </div>

          {/* Mini Step Counter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-500">Step {step} of 8</span>
            <div className="w-24 sm:w-36 h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
                style={{ width: `${(step / 8) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Tabs */}
        <div className="hidden lg:flex items-center justify-between mt-4 overflow-x-auto no-scrollbar gap-1 py-1">
          {stepsList.map((label, idx) => {
            const stepNum = idx + 1;
            const isDone = stepNum < step;
            const isCurrent = stepNum === step;
            return (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors",
                  isCurrent
                    ? "bg-amber-500/10 text-amber-900 font-semibold border border-amber-500/30"
                    : isDone
                    ? "text-emerald-700 font-medium"
                    : "text-stone-400"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                    isCurrent
                      ? "bg-amber-600 text-white"
                      : isDone
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-200 text-stone-600"
                  )}
                >
                  {isDone ? <Check className="w-3 h-3" /> : stepNum}
                </div>
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Wizard Step Panel */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Step 1: Branch Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium text-stone-900">
                  Select Your Sanctuary Atelier
                </h3>
                <p className="text-xs text-stone-500">
                  Select the flagship destination where you wish to receive your appointment.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {branches.map((b) => (
                    <Card
                      key={b.id}
                      hoverable
                      onClick={() => setSelectedBranchId(b.id)}
                      className={cn(
                        "p-4 cursor-pointer transition-all border",
                        b.id === selectedBranchId
                          ? "border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20 shadow-md"
                          : "hover:border-stone-400"
                      )}
                    >
                      <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3 bg-stone-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={b.image}
                          alt={b.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="slate" size="sm">
                            {b.code}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-stone-900">{b.name}</h4>
                          <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            {b.city}, {b.country}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-amber-700 flex items-center gap-0.5">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {b.rating}
                          </span>
                          <span className="text-[10px] text-stone-400">{b.totalReviews} reviews</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-2 line-clamp-1">{b.address}</p>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <Button variant="gold" onClick={() => setStep(2)}>
                    <span>Continue to Gender & Categories</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Gender & Category */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-medium text-stone-900">
                    Who Is This Appointment For?
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Our service rituals and specialized artisans adjust dynamically according to your selection.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    {[
                      { id: "women", label: "Women Couture", icon: "👑" },
                      { id: "men", label: "Men's Executive", icon: "🎩" },
                      { id: "unisex", label: "Unisex & Spa", icon: "✨" },
                      { id: "kids", label: "Junior Royals", icon: "🧸" },
                    ].map((g) => {
                      const isSelected = selectedGender === g.id;
                      return (
                        <button
                          key={g.id}
                          onClick={() => setSelectedGender(g.id as GenderType)}
                          className={cn(
                            "p-3 rounded-xl border text-center transition-all cursor-pointer",
                            isSelected
                              ? "bg-stone-900 text-amber-300 border-stone-900 shadow-md font-semibold"
                              : "bg-white border-stone-200 text-stone-700 hover:border-amber-400"
                          )}
                        >
                          <span className="text-xl block mb-1">{g.icon}</span>
                          <span className="text-xs">{g.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-stone-900">
                    Select Beauty Ritual Category
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {categories.map((cat) => {
                      const isSelected = cat.id === selectedCategoryId;
                      return (
                        <Card
                          key={cat.id}
                          hoverable
                          onClick={() => {
                            setSelectedCategoryId(cat.id);
                            // Auto select first available service in category
                            const match = filteredServices.find(
                              (s) => s.categoryId === cat.id && (s.gender.includes(selectedGender) || s.gender.includes("unisex"))
                            );
                            if (match) setSelectedService(match);
                          }}
                          className={cn(
                            "p-3.5 cursor-pointer flex items-center gap-3.5 transition-all border",
                            isSelected
                              ? "border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20 shadow-sm"
                              : "hover:border-stone-300"
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-14 h-14 rounded-xl object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-stone-900 truncate">
                              {cat.name}
                            </h4>
                            <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                              {cat.description}
                            </p>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span>Back</span>
                  </Button>
                  <Button variant="gold" onClick={() => setStep(3)}>
                    <span>Explore Services</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Service Selection */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-stone-900">
                      Select Your Service Ritual
                    </h3>
                    <p className="text-xs text-stone-500">
                      Showing services tailored for {selectedGender} at {selectedBranch.name}
                    </p>
                  </div>
                  <Badge variant="gold" size="sm">
                    {availableServices.length} Rituals Available
                  </Badge>
                </div>

                <div className="space-y-3 pt-2">
                  {availableServices.map((service) => {
                    const isSelected = selectedService?.id === service.id;
                    return (
                      <Card
                        key={service.id}
                        hoverable
                        onClick={() => {
                          setSelectedService(service);
                          setSelectedOptions([]);
                          setSelectedAddOns([]);
                        }}
                        className={cn(
                          "p-4 cursor-pointer transition-all border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
                          isSelected
                            ? "border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20 shadow-md"
                            : "hover:border-stone-300"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={service.image}
                            alt={service.name}
                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm sm:text-base font-semibold text-stone-900">
                                {service.name}
                              </h4>
                              {service.featured && (
                                <Badge variant="gold" size="sm">
                                  Signature
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-stone-500 mt-1 max-w-md line-clamp-2">
                              {service.shortDesc}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" />
                                {service.durationMinutes} mins
                              </span>
                              <span>•</span>
                              <span>{service.optionGroups?.length || 0} Customizable Options</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-stone-400 uppercase font-mono block">From</span>
                            <span className="text-lg font-bold text-stone-900">
                              {formatCurrency(service.basePrice, selectedBranch.currency)}
                            </span>
                          </div>
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center mt-2 border",
                              isSelected
                                ? "bg-amber-600 text-white border-amber-600"
                                : "border-stone-300 text-transparent"
                            )}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span>Back</span>
                  </Button>
                  <Button
                    variant="gold"
                    disabled={!selectedService}
                    onClick={() => setStep(4)}
                  >
                    <span>Configure Options</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Dynamic Service Options & Add-ons */}
            {step === 4 && selectedService && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-medium text-stone-900">
                    Customize Ritual: {selectedService.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Select precise hair length, skin type, or finish attributes for accurate duration and pricing.
                  </p>
                </div>

                {/* Option Groups */}
                {selectedService.optionGroups && selectedService.optionGroups.length > 0 ? (
                  selectedService.optionGroups.map((group) => (
                    <div key={group.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-stone-900">
                          {group.name} {group.required && <span className="text-amber-600">*</span>}
                        </label>
                        <span className="text-[11px] text-stone-400">
                          {group.required ? "Required selection" : "Optional"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {group.options.map((opt) => {
                          const isSelected = selectedOptions.some(
                            (o) => o.groupId === group.id && o.optionId === opt.id
                          );
                          return (
                            <button
                              key={opt.id}
                              onClick={() =>
                                handleSelectOption(group.id, group.name, opt.id, opt.label, opt.priceDelta)
                              }
                              className={cn(
                                "p-3 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer",
                                isSelected
                                  ? "bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
                                  : "bg-white border-stone-200 hover:border-stone-300"
                              )}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={cn(
                                    "w-4 h-4 rounded-full border flex items-center justify-center",
                                    isSelected
                                      ? "border-amber-600 bg-amber-600 text-white"
                                      : "border-stone-300"
                                  )}
                                >
                                  {isSelected && <Check className="w-2.5 h-2.5" />}
                                </div>
                                <span className="text-xs font-medium text-stone-900">{opt.label}</span>
                              </div>
                              <span className="text-xs font-mono font-semibold text-amber-700">
                                {opt.priceDelta > 0
                                  ? `+${formatCurrency(opt.priceDelta, selectedBranch.currency)}`
                                  : opt.priceDelta < 0
                                  ? `-${formatCurrency(Math.abs(opt.priceDelta), selectedBranch.currency)}`
                                  : "Included"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-500 italic">No extra custom attributes needed for this service.</p>
                )}

                {/* Add-ons */}
                {selectedService.addOns && selectedService.addOns.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Recommended Luxury Add-ons & Bond Multipliers</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedService.addOns.map((addon) => {
                        const isAdded = selectedAddOns.some((a) => a.id === addon.id);
                        return (
                          <div
                            key={addon.id}
                            onClick={() => handleToggleAddOn(addon)}
                            className={cn(
                              "p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3",
                              isAdded
                                ? "bg-amber-50/20 border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
                                : "bg-white border-stone-200 hover:border-stone-300"
                            )}
                          >
                            <div>
                              <div className="font-semibold text-xs text-stone-900">{addon.name}</div>
                              <p className="text-[11px] text-stone-500 mt-0.5">{addon.description}</p>
                              <span className="text-[10px] text-stone-400 mt-1 inline-block">
                                +{addon.durationMinutes} mins
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-stone-900 font-mono block">
                                +{formatCurrency(addon.price, selectedBranch.currency)}
                              </span>
                              <Badge variant={isAdded ? "gold" : "outline"} size="sm" className="mt-1">
                                {isAdded ? "Added" : "+ Add"}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span>Back</span>
                  </Button>
                  <Button variant="gold" onClick={() => setStep(5)}>
                    <span>Select Artisan Stylist</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Artisan Stylist Selection */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-medium text-stone-900">
                    Choose Your Master Artisan
                  </h3>
                  <p className="text-xs text-stone-500">
                    Our master artisans hold international credentials from Paris, London, Milan, and Beverly Hills.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {filteredStylists.map((stylist) => {
                    const isSelected = selectedStylist?.id === stylist.id;
                    const tierMarkupLabel =
                      stylist.tier === "director"
                        ? "Director (+50%)"
                        : stylist.tier === "master"
                        ? "Master (+25%)"
                        : stylist.tier === "senior"
                        ? "Senior (+15%)"
                        : "Executive (Standard)";

                    return (
                      <Card
                        key={stylist.id}
                        hoverable
                        onClick={() => setSelectedStylist(stylist)}
                        className={cn(
                          "p-4 cursor-pointer transition-all border",
                          isSelected
                            ? "border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20 shadow-md"
                            : "hover:border-stone-300"
                        )}
                      >
                        <div className="flex items-center gap-3.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={stylist.avatar}
                            alt={stylist.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-amber-400/40 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-stone-900 truncate">
                                {stylist.name}
                              </h4>
                              <span className="text-xs font-bold text-amber-700 flex items-center gap-0.5">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                {stylist.rating}
                              </span>
                            </div>
                            <Badge variant={stylist.tier === "director" ? "gold" : "slate"} size="sm" className="mt-1">
                              {tierMarkupLabel}
                            </Badge>
                            <p className="text-[11px] text-stone-500 mt-1.5 line-clamp-2">
                              {stylist.bio}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap gap-1">
                          {stylist.specialties.map((spec) => (
                            <span
                              key={spec}
                              className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-600"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <Button variant="outline" onClick={() => setStep(4)}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span>Back</span>
                  </Button>
                  <Button
                    variant="gold"
                    disabled={!selectedStylist}
                    onClick={() => setStep(6)}
                  >
                    <span>Choose Date & Time</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 6: Date & Time Slot */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-medium text-stone-900">
                    Select Appointment Date & Time
                  </h3>
                  <p className="text-xs text-stone-500">
                    Artisan: <span className="font-semibold text-stone-800">{selectedStylist?.name}</span> at {selectedBranch.name}
                  </p>
                </div>

                {/* Date Picker row */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                    Date of Appointment
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[0, 1, 2, 3].map((dayOffset) => {
                      const d = new Date(Date.now() + dayOffset * 86400000);
                      const dateString = d.toISOString().split("T")[0];
                      const isSelected = selectedDate === dateString;
                      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
                      const dayNumber = d.getDate();
                      const monthName = d.toLocaleDateString("en-US", { month: "short" });

                      return (
                        <button
                          key={dateString}
                          onClick={() => setSelectedDate(dateString)}
                          className={cn(
                            "p-3 rounded-xl border text-center transition-all cursor-pointer",
                            isSelected
                              ? "bg-stone-900 text-amber-300 border-stone-900 shadow-md"
                              : "bg-white border-stone-200 text-stone-800 hover:border-amber-400"
                          )}
                        >
                          <span className="text-[11px] uppercase font-mono block opacity-80">{dayName}</span>
                          <span className="text-xl font-bold block my-0.5">{dayNumber}</span>
                          <span className="text-[11px] block opacity-80">{monthName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                    Available Time Slots
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {availableTimeSlots.map((slot) => {
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={cn(
                            "py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5",
                            isSelected
                              ? "bg-amber-600 text-white border-amber-600 font-semibold shadow-xs"
                              : "bg-white border-stone-200 text-stone-700 hover:border-stone-400"
                          )}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{slot}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Client Contact Info Input */}
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                  <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                    Guest Details for Instant Confirmation
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                        placeholder="Guest Name"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">Mobile (for WhatsApp QR)</label>
                      <input
                        type="text"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                        placeholder="+91 98200 00000"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                        placeholder="guest@domain.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <Button variant="outline" onClick={() => setStep(5)}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span>Back</span>
                  </Button>
                  <Button variant="gold" onClick={() => setStep(7)}>
                    <span>Privileges & Final Checkout</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 7: VIP Privileges, Wallet, Loyalty, Coupons & Checkout */}
            {step === 7 && pricing && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-medium text-stone-900">
                    Apply VIP Benefits & Loyalty Privileges
                  </h3>
                  <p className="text-xs text-stone-500">
                    Enjoy exclusive deductions with your membership, package pass credits, or wallet balance.
                  </p>
                </div>

                {/* Membership Privileges Card */}
                {currentCustomer.membership && (
                  <Card className="p-4 bg-gradient-to-r from-stone-900 to-amber-950/80 text-stone-100 border-amber-500/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                          <Crown className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-300 uppercase tracking-widest font-mono">
                            Active VIP Privilege Tier
                          </span>
                          <h4 className="text-sm font-semibold text-stone-100">
                            {currentCustomer.membership.tierName}
                          </h4>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useMembership}
                          onChange={(e) => setUseMembership(e.target.checked)}
                          className="w-4 h-4 accent-amber-500"
                        />
                        <span className="text-xs text-amber-200 font-medium">Apply Discount</span>
                      </label>
                    </div>
                  </Card>
                )}

                {/* Package Credits & Wallet & Loyalty Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Service Package Credit */}
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                    <div className="flex items-center gap-2 text-stone-800 font-medium text-xs">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Package Passes</span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      {currentCustomer.packages.length > 0
                        ? `${currentCustomer.packages[0].remainingCredits} credits available`
                        : "No package active"}
                    </p>
                    {currentCustomer.packages.length > 0 && (
                      <button
                        onClick={() => setUsePackageCredit(!usePackageCredit)}
                        className={cn(
                          "w-full py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer",
                          usePackageCredit
                            ? "bg-amber-600 text-white border-amber-600"
                            : "bg-white text-stone-700 border-stone-300"
                        )}
                      >
                        {usePackageCredit ? "Package Applied" : "Redeem 1 Credit"}
                      </button>
                    )}
                  </div>

                  {/* Wallet Balance */}
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-stone-800">
                      <div className="flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        <span>Wallet Cash</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatCurrency(currentCustomer.walletBalance, selectedBranch.currency)}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setWalletToApply(walletToApply > 0 ? 0 : Math.min(currentCustomer.walletBalance, pricing.finalTotal))
                      }
                      className={cn(
                        "w-full py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer",
                        walletToApply > 0
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-stone-700 border-stone-300"
                      )}
                    >
                      {walletToApply > 0 ? `Deducting ${formatCurrency(walletToApply, selectedBranch.currency)}` : "Use Wallet"}
                    </button>
                  </div>

                  {/* Loyalty Points */}
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-stone-800">
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-purple-600" />
                        <span>Loyalty Points</span>
                      </div>
                      <span className="font-mono font-bold text-purple-700">
                        {currentCustomer.loyaltyPoints} pts
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setLoyaltyPointsToRedeem(loyaltyPointsToRedeem > 0 ? 0 : Math.min(currentCustomer.loyaltyPoints, 2000))
                      }
                      className={cn(
                        "w-full py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer",
                        loyaltyPointsToRedeem > 0
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-stone-700 border-stone-300"
                      )}
                    >
                      {loyaltyPointsToRedeem > 0 ? `Redeemed ${loyaltyPointsToRedeem} pts` : "Redeem Points"}
                    </button>
                  </div>
                </div>

                {/* Coupon Box */}
                <div className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 bg-white">
                  <Tag className="w-4 h-4 text-amber-600 shrink-0" />
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    placeholder="Enter Coupon Code (e.g. AUTUMNROYAL20)"
                    className="flex-1 text-xs uppercase font-mono bg-transparent focus:outline-none"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAppliedCouponCode(couponCodeInput.trim());
                    }}
                  >
                    Apply
                  </Button>
                </div>

                {activeCoupon && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <span>Coupon <strong>{activeCoupon.code}</strong> applied successfully!</span>
                    <button
                      onClick={() => {
                        setAppliedCouponCode("");
                        setCouponCodeInput("");
                      }}
                      className="text-xs text-rose-600 underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <Button variant="outline" onClick={() => setStep(6)}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span>Back</span>
                  </Button>
                  <Button variant="gold" size="lg" onClick={handleConfirmBooking}>
                    <span>Confirm & Book Appointment</span>
                    <CheckCircle2 className="w-5 h-5 ml-1.5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 8: Confirmation Screen */}
            {step === 8 && (
              <motion.div
                key="step8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-5"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-300">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <Badge variant="gold" size="md">
                    Reservation Confirmed
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-medium text-stone-900 mt-2">
                    We Look Forward to Welcoming You
                  </h2>
                  <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                    An instant VIP pass has been issued and linked to your phone number for priority suite check-in.
                  </p>
                </div>

                {/* VIP Pass Card */}
                <div className="max-w-md mx-auto p-5 rounded-2xl bg-neutral-950 text-stone-100 border border-amber-500/40 shadow-2xl text-left relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div>
                      <span className="text-[10px] text-amber-400 font-mono tracking-widest uppercase">
                        LAZYMONKEYAI SALON PASS
                      </span>
                      <h4 className="text-base font-semibold text-stone-100">
                        {selectedBranch.name}
                      </h4>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-300 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30">
                      {confirmedBookingRef || "LM-BOM-8821"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 my-4 text-xs">
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase">Client Name</span>
                      <div className="font-semibold text-stone-100">{clientName}</div>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase">Service Ritual</span>
                      <div className="font-semibold text-stone-100">{selectedService?.name}</div>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase">Date & Time</span>
                      <div className="font-semibold text-amber-200">
                        {selectedDate} at {selectedTimeSlot}
                      </div>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase">Master Stylist</span>
                      <div className="font-semibold text-stone-100">{selectedStylist?.name}</div>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-neutral-800 pt-3 flex items-center justify-between text-xs">
                    <span className="text-stone-400">Amount at Counter:</span>
                    <span className="font-bold text-amber-300 text-sm">
                      {pricing ? formatCurrency(pricing.amountPayableAtCounter, selectedBranch.currency) : "Paid"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep(1);
                      setSelectedService(filteredServices[0] || null);
                    }}
                  >
                    Book Another Ritual
                  </Button>
                  <Button
                    variant="gold"
                    onClick={() => {
                      if (onComplete) onComplete();
                    }}
                  >
                    Go to Customer Portal
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Dynamic Pricing & Summary Sidebar (Steps 1-7) */}
        {step < 8 && selectedService && selectedStylist && pricing && (
          <div className="lg:col-span-1 sticky top-24">
            <Card variant="luxury" className="p-5 space-y-4 border-amber-900/15">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
                <h4 className="text-sm font-semibold text-stone-900">
                  Ritual Summary & Live Breakdown
                </h4>
                <Badge variant="gold" size="sm">
                  Live Estimate
                </Badge>
              </div>

              {/* Service & Stylist overview */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <span className="text-stone-600">{selectedService.name}</span>
                  <span className="font-semibold text-stone-900 font-mono">
                    {formatCurrency(pricing.basePrice, selectedBranch.currency)}
                  </span>
                </div>

                {pricing.optionsPrice !== 0 && (
                  <div className="flex items-start justify-between text-stone-500">
                    <span>Options ({selectedOptions.map((o) => o.optionLabel).join(", ")})</span>
                    <span className="font-mono">
                      +{formatCurrency(pricing.optionsPrice, selectedBranch.currency)}
                    </span>
                  </div>
                )}

                {pricing.addOnsPrice > 0 && (
                  <div className="flex items-start justify-between text-stone-500">
                    <span>Add-ons ({selectedAddOns.length})</span>
                    <span className="font-mono">
                      +{formatCurrency(pricing.addOnsPrice, selectedBranch.currency)}
                    </span>
                  </div>
                )}

                {pricing.stylistMarkup > 0 && (
                  <div className="flex items-start justify-between text-amber-800">
                    <span>{selectedStylist.name} ({selectedStylist.tier} markup)</span>
                    <span className="font-mono">
                      +{formatCurrency(pricing.stylistMarkup, selectedBranch.currency)}
                    </span>
                  </div>
                )}
              </div>

              {/* Subtotal & Deductions */}
              <div className="border-t border-stone-200/80 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600 font-medium">
                  <span>Gross Subtotal</span>
                  <span className="font-mono">{formatCurrency(pricing.subtotal, selectedBranch.currency)}</span>
                </div>

                {pricing.packageCreditApplied && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>Package Pass Applied</span>
                    <span className="font-mono">-{formatCurrency(pricing.packageSavings, selectedBranch.currency)}</span>
                  </div>
                )}

                {pricing.membershipDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>VIP Member Privilege</span>
                    <span className="font-mono">-{formatCurrency(pricing.membershipDiscount, selectedBranch.currency)}</span>
                  </div>
                )}

                {pricing.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Promo</span>
                    <span className="font-mono">-{formatCurrency(pricing.couponDiscount, selectedBranch.currency)}</span>
                  </div>
                )}

                {pricing.loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-purple-700 font-medium">
                    <span>Loyalty Points Discount</span>
                    <span className="font-mono">-{formatCurrency(pricing.loyaltyDiscount, selectedBranch.currency)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-500">
                  <span>Tax & GST ({Math.round(selectedBranch.taxRate * 100)}%)</span>
                  <span className="font-mono">+{formatCurrency(pricing.taxAmount, selectedBranch.currency)}</span>
                </div>
              </div>

              {/* Final Payable */}
              <div className="border-t-2 border-stone-900/10 pt-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs uppercase font-mono font-semibold text-stone-500 block">
                      Payable at Counter
                    </span>
                    {pricing.walletUsed > 0 && (
                      <span className="text-[11px] text-emerald-700 font-medium">
                        (After {formatCurrency(pricing.walletUsed, selectedBranch.currency)} wallet deduction)
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-stone-900">
                    {formatCurrency(pricing.amountPayableAtCounter, selectedBranch.currency)}
                  </div>
                </div>
              </div>

              {/* Security & Guarantee Note */}
              <div className="p-2.5 rounded-lg bg-stone-100/60 border border-stone-200/60 text-[11px] text-stone-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Zero cancellation fee up to 2 hours prior to reservation.</span>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
