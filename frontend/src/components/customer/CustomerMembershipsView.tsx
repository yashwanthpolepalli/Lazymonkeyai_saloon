"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  Crown,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Gift,
  Zap,
  Tag,
  Star,
  RefreshCw,
  CreditCard,
  ChevronRight,
  PlusCircle,
  Loader2,
  X,
  Wallet,
  QrCode,
} from "lucide-react";
import confetti from "canvas-confetti";
import { CRMService } from "@/services/apiClient";

export function CustomerMembershipsView() {
  const {
    currentCustomer,
    setCurrentCustomer,
    setCustomers,
    selectedBranch,
    addToast,
  } = useSalon();

  const [tiers, setTiers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTierForAction, setSelectedTierForAction] = useState<any | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "wallet">("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const plansSectionRef = useRef<HTMLDivElement>(null);

  const fetchTiers = async () => {
    setIsLoading(true);
    try {
      const data = await CRMService.getMemberships();
      if (Array.isArray(data) && data.length > 0) {
        setTiers(data);
      }
    } catch (err) {
      console.warn("Could not load membership tiers from backend:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  // Determine active membership status
  const hasActiveMembership =
    Boolean(currentCustomer?.membership?.active) ||
    (Boolean(currentCustomer?.membershipTier) &&
      currentCustomer.membershipTier !== "Standard" &&
      currentCustomer.membershipTier !== "Regular");

  const activeTierName =
    currentCustomer?.membership?.tierName ||
    (currentCustomer?.membershipTier &&
    currentCustomer.membershipTier !== "Standard" &&
    currentCustomer.membershipTier !== "Regular"
      ? currentCustomer.membershipTier
      : null);

  const matchedActiveTier = tiers.find(
    (t) =>
      (currentCustomer?.membership?.tierId && t.id === currentCustomer.membership.tierId) ||
      (activeTierName && t.name.toLowerCase() === activeTierName.toLowerCase())
  );

  const daysRemaining = currentCustomer?.membership?.expiresAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(currentCustomer.membership.expiresAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : matchedActiveTier?.validity_days || 365;

  const expiryFormatted = currentCustomer?.membership?.expiresAt
    ? new Date(currentCustomer.membership.expiresAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Valid for 1 Year";

  const freePerksRemaining =
    currentCustomer?.membership?.remainingBlowouts !== undefined
      ? currentCustomer.membership.remainingBlowouts
      : matchedActiveTier?.free_monthly_blowouts !== undefined
      ? matchedActiveTier.free_monthly_blowouts
      : 2;

  const freePerksTotal =
    matchedActiveTier?.free_monthly_blowouts !== undefined
      ? matchedActiveTier.free_monthly_blowouts
      : 2;

  const scrollToPlans = () => {
    plansSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpenActionModal = (tier: any) => {
    setSelectedTierForAction(tier);
    setIsEnrollModalOpen(true);
  };

  const handleConfirmEnroll = async () => {
    if (!selectedTierForAction) return;

    if (!currentCustomer?.id || currentCustomer.id === "walk_in") {
      addToast(
        "warning",
        "Sign In Required",
        "Please select a registered customer profile to activate membership."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await CRMService.enrollMembership({
        customer_id: currentCustomer.id,
        tier_id: selectedTierForAction.id,
        payment_method: paymentMethod,
      });

      if (res && res.membership) {
        const updatedCustomer = {
          ...currentCustomer,
          membershipTier: res.membership.tierName,
          membership: res.membership,
        };
        setCurrentCustomer(updatedCustomer);
        setCustomers((prev) =>
          prev.map((c) => (c.id === currentCustomer.id ? updatedCustomer : c))
        );
      }

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
      });

      addToast(
        "success",
        "Membership Activated!",
        `Successfully enrolled in ${selectedTierForAction.name}. ₹${selectedTierForAction.price.toLocaleString()} charged via ${paymentMethod.toUpperCase()}.`
      );
      setIsEnrollModalOpen(false);
      setSelectedTierForAction(null);
    } catch (err: any) {
      addToast("error", "Enrollment Failed", err.message || "Could not activate membership.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Dynamic Active Membership or Standard Onboarding Card */}
      {hasActiveMembership && activeTierName ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 text-yellow-200" />
                <span>Active Privilege Member</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {currentCustomer.name} &bull; {activeTierName}
              </h1>
              <p className="text-amber-100 text-sm">
                Membership ID:{" "}
                <span className="font-mono font-semibold text-white">
                  {currentCustomer.membership?.membershipId ||
                    `LM-${activeTierName.slice(0, 4).toUpperCase()}-${currentCustomer.id ? currentCustomer.id.slice(0, 5).toUpperCase() : "VIP"}`}
                </span>{" "}
                &bull; Enrolled at {selectedBranch?.name || "Main Flagship Studio"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[140px]">
                <div className="text-xs text-amber-200 font-medium">Validity Remaining</div>
                <div className="text-2xl font-bold mt-0.5">{daysRemaining} Days</div>
                <div className="text-[11px] text-amber-100">Valid till {expiryFormatted}</div>
              </div>

              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[140px]">
                <div className="text-xs text-amber-200 font-medium">Free Perks Left</div>
                <div className="text-2xl font-bold mt-0.5">
                  {freePerksRemaining} / {Math.max(freePerksTotal, freePerksRemaining)}
                </div>
                <div className="text-[11px] text-amber-100">Blow-drys & Spas</div>
              </div>

              <button
                onClick={scrollToPlans}
                className="px-5 py-3 rounded-xl bg-white text-amber-900 font-semibold text-sm hover:bg-amber-50 shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
              >
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <span>Renew / Upgrade Plan</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Standard Member &bull; Pay As You Go</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {currentCustomer?.name || "Guest Client"} &bull; Standard Tier
              </h1>
              <p className="text-slate-300 text-sm">
                Unlock up to 30% discount on all salon services, priority weekend slots, and complimentary monthly treatments by joining our VIP Clubs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[140px]">
                <div className="text-xs text-slate-400 font-medium">Status</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">Active Standard</div>
                <div className="text-[11px] text-slate-400">Regular Pricing</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[140px]">
                <div className="text-xs text-amber-300 font-medium">VIP Savings</div>
                <div className="text-lg font-bold text-white mt-0.5">Up to 30% OFF</div>
                <div className="text-[11px] text-slate-400">Services & Retail</div>
              </div>

              <button
                onClick={scrollToPlans}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
              >
                <Crown className="w-4 h-4 text-slate-950" />
                <span>+ Choose a VIP Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Benefits Tracker Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>
              {hasActiveMembership
                ? "Your Active Membership Privileges"
                : "Privileges Included in Membership Plans"}
            </span>
          </h2>
          <span className="text-xs text-slate-500">Auto-applies at checkout & booking</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <Tag className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Service Discount</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {matchedActiveTier?.discount_percentage
                ? `${matchedActiveTier.discount_percentage}% Flat OFF`
                : "Up to 30% OFF"}
            </div>
            <p className="text-xs text-slate-500 mt-1">Applicable across all hair, facial, spa, and nail services.</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-3">
              <Gift className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-violet-700 uppercase tracking-wider">Monthly Vouchers</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {hasActiveMembership
                ? `${freePerksRemaining} Free Treatments`
                : "Free Blow-Drys & Spas"}
            </div>
            <p className="text-xs text-slate-500 mt-1">Use anytime during booking or walk-in service.</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Star className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Stylist Tier Upgrade</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {matchedActiveTier?.priority_booking ? "Complimentary" : "Available in VIP"}
            </div>
            <p className="text-xs text-slate-500 mt-1">Book Master Stylist at the price of Senior Stylist.</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-sky-700 uppercase tracking-wider">Priority Concierge</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {matchedActiveTier?.priority_booking ? "VIP Fast-Track" : "Weekend Slots"}
            </div>
            <p className="text-xs text-slate-500 mt-1">Guaranteed weekend booking slots with zero queue waiting.</p>
          </div>
        </div>
      </div>

      {/* Available Plans Catalog (100% Dynamic from PostgreSQL) */}
      <div ref={plansSectionRef} className="space-y-4 pt-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Explore All Salon Membership Tiers</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Enjoy exclusive discounts, priority booking, complimentary treatments, and luxury perks.
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <span className="text-xs font-medium text-slate-500">Loading live membership tiers...</span>
          </div>
        ) : tiers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Crown className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Membership Tiers Published Yet</h3>
            <p className="text-xs text-slate-500">
              Membership plans have not been configured yet. Once published from the owner portal, VIP tiers and perks will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            {tiers.map((tier) => {
              const isCurrent = Boolean(
                activeTierName &&
                  (tier.name.toLowerCase() === activeTierName.toLowerCase() ||
                    tier.id === currentCustomer?.membership?.tierId)
              );

              const durationLabel =
                tier.validity_days >= 360
                  ? "12 Months"
                  : tier.validity_days >= 170
                  ? "6 Months"
                  : tier.validity_days >= 80
                  ? "3 Months"
                  : `${tier.validity_days} Days`;

              const badgeLabel = isCurrent
                ? "Active Plan"
                : tier.price >= 20000
                ? "Ultimate Luxury"
                : tier.price >= 10000
                ? "Most Recommended"
                : "Popular Starter";

              const accentBg = isCurrent
                ? "bg-amber-100 text-amber-800 border-amber-300"
                : tier.price >= 20000
                ? "bg-violet-100 text-violet-800 border-violet-300"
                : tier.price >= 10000
                ? "bg-amber-100 text-amber-800 border-amber-300"
                : "bg-slate-100 text-slate-700 border-slate-300";

              return (
                <div
                  key={tier.id}
                  className={`bg-white rounded-3xl border ${
                    isCurrent
                      ? "border-amber-400 ring-2 ring-amber-400/20 shadow-lg"
                      : "border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
                  } p-6 sm:p-7 flex flex-col justify-between transition-all`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${accentBg}`}>
                        {badgeLabel}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <CheckCircle2 className="w-3 h-3 text-amber-600" />
                          Active Plan
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {tier.name.includes("Silver")
                        ? "Essential luxury grooming & care"
                        : tier.name.includes("Gold")
                        ? "Signature haute coiffure & wellness privilege"
                        : "The pinnacle of bespoke beauty & concierge care"}
                    </p>

                    <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-baseline justify-between">
                      <div>
                        <span className="text-3xl font-bold text-slate-900">
                          ₹{Number(tier.price).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">/ {durationLabel}</span>
                      </div>
                      <div className="text-right text-[11px] text-emerald-700 font-semibold">
                        {tier.discount_percentage}% OFF Services
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Included Privileges
                      </div>
                      <ul className="space-y-2.5 text-xs text-slate-600">
                        {Array.isArray(tier.benefits) && tier.benefits.length > 0 ? (
                          tier.benefits.map((perk: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{perk}</span>
                            </li>
                          ))
                        ) : (
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{tier.discount_percentage}% discount on all salon services</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenActionModal(tier)}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg"
                          : "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                      }`}
                    >
                      <Crown className="w-4 h-4" />
                      <span>{isCurrent ? "Renew Membership" : `Upgrade to ${tier.name}`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation & Payment Mode Modal */}
      {isEnrollModalOpen && selectedTierForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {hasActiveMembership && activeTierName?.toLowerCase() === selectedTierForAction.name.toLowerCase()
                      ? "Renew Membership"
                      : "Upgrade Membership Plan"}
                  </h3>
                  <p className="text-xs text-slate-500">Live DB Activation & Privileges</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                <span>{selectedTierForAction.name}</span>
                <span className="text-amber-700">₹{Number(selectedTierForAction.price).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Validity Duration</span>
                <span className="font-medium text-slate-700">{selectedTierForAction.validity_days} Days</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Service Discount</span>
                <span className="font-semibold text-emerald-600">{selectedTierForAction.discount_percentage}% Flat OFF</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Client Name</span>
                <span className="font-medium text-slate-700">{currentCustomer.name}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Select Tender Mode</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                    paymentMethod === "card"
                      ? "border-amber-500 bg-amber-50 text-amber-900"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Card / POS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                    paymentMethod === "upi"
                      ? "border-amber-500 bg-amber-50 text-amber-900"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("wallet")}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                    paymentMethod === "wallet"
                      ? "border-amber-500 bg-amber-50 text-amber-900"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>Wallet</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmEnroll}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Activating in DB...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pay ₹{Number(selectedTierForAction.price).toLocaleString()} & Activate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
