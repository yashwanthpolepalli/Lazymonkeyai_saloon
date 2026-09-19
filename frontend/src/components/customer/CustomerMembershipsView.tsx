"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import confetti from "canvas-confetti";

export function CustomerMembershipsView() {
  const { currentCustomer, addToast } = useSalon();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);

  const membershipTiers = [
    {
      id: "silver",
      name: "Silver Prestige",
      tagline: "Essential luxury grooming & care",
      price: 4999,
      duration: "3 Months",
      discountServices: "10% OFF all Hair & Skin Services",
      discountRetail: "5% OFF all Retail Beauty Products",
      perks: [
        "1 Complimentary Hair Spa & Deep Conditioning per month",
        "Priority slot booking during weekends",
        "Complimentary beverage & consultation on every visit",
        "500 Bonus Welcome Reward Points",
      ],
      color: "from-slate-700 to-slate-900",
      accentBg: "bg-slate-100 text-slate-700 border-slate-300",
      badge: "Popular Starter",
      isCurrent: currentCustomer.membershipTier === "silver",
    },
    {
      id: "gold",
      name: "Gold Royalty Club",
      tagline: "Signature haute coiffure & wellness privilege",
      price: 12999,
      duration: "6 Months",
      discountServices: "20% OFF all Salon Services",
      discountRetail: "15% OFF all Retail Luxury Products",
      perks: [
        "2 Complimentary Signature Blow-Drys & Scalp Massages monthly",
        "Free upgrade to Senior or Master Stylist tier",
        "Exclusive Invitation to Masterclass Hair & Styling Nights",
        "Free Eyebrow Threading & Express Manicure with any service",
        "1,500 Bonus Reward Points",
      ],
      color: "from-amber-500 to-yellow-600",
      accentBg: "bg-amber-100 text-amber-800 border-amber-300",
      badge: "Most Recommended",
      isCurrent: currentCustomer.membershipTier === "gold" || !currentCustomer.membershipTier,
    },
    {
      id: "platinum",
      name: "Diamond Royal VIP",
      tagline: "The pinnacle of bespoke beauty & concierge care",
      price: 24999,
      duration: "12 Months",
      discountServices: "30% OFF all Services & Rituals",
      discountRetail: "20% OFF all Retail Beauty Brands",
      perks: [
        "Unlimited Complimentary Express Blow-Drys & Styling",
        "Dedicated Director Stylist & Private VIP Suite Access",
        "Free Luxury Spa Pedicure on Birthday Month + 1 Guest Pass",
        "Zero cancellation / rescheduling fees anytime",
        "3,000 Bonus Reward Points + Priority Product Pre-Orders",
      ],
      color: "from-violet-600 to-indigo-700",
      accentBg: "bg-violet-100 text-violet-800 border-violet-300",
      badge: "Ultimate Luxury",
      isCurrent: currentCustomer.membershipTier === "platinum",
    },
  ];

  const handleRenewUpgrade = (tierName: string, price: number) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    addToast(
      "success",
      "Membership Activated!",
      `Successfully enrolled in ${tierName} plan. ₹${price.toLocaleString()} charged to saved method.`
    );
    setIsRenewModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Active Membership Validity Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-yellow-200" />
              <span>Active Privilege Member</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {currentCustomer.name} &bull; Gold Royalty Tier
            </h1>
            <p className="text-amber-100 text-sm">
              Membership ID: <span className="font-mono font-semibold text-white">LM-GOLD-88219</span> &bull; 
              Enrolled at Atelier Flagship Mumbai
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[140px]">
              <div className="text-xs text-amber-200 font-medium">Validity Remaining</div>
              <div className="text-2xl font-bold mt-0.5">184 Days</div>
              <div className="text-[11px] text-amber-100">Valid till Dec 31, 2026</div>
            </div>

            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[140px]">
              <div className="text-xs text-amber-200 font-medium">Free Perks Left</div>
              <div className="text-2xl font-bold mt-0.5">4 / 6</div>
              <div className="text-[11px] text-amber-100">Blow-drys & Spas</div>
            </div>

            <button
              onClick={() => setIsRenewModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-white text-amber-900 font-semibold text-sm hover:bg-amber-50 shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <RefreshCw className="w-4 h-4 text-amber-600" />
              <span>Renew / Upgrade Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Benefits Tracker Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Your Active Membership Privileges</span>
          </h2>
          <span className="text-xs text-slate-500">Auto-applies at checkout & booking</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <Tag className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Service Discount</div>
            <div className="text-xl font-bold text-slate-900 mt-1">20% Flat OFF</div>
            <p className="text-xs text-slate-500 mt-1">Applicable across all hair, facial, spa, and nail services.</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-3">
              <Gift className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-violet-700 uppercase tracking-wider">Monthly Vouchers</div>
            <div className="text-xl font-bold text-slate-900 mt-1">2 Free Blow-Drys</div>
            <p className="text-xs text-slate-500 mt-1">Use anytime during booking or walk-in service.</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Star className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Stylist Tier Upgrade</div>
            <div className="text-xl font-bold text-slate-900 mt-1">Complimentary</div>
            <p className="text-xs text-slate-500 mt-1">Book Master Stylist at the price of Senior Stylist.</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-sky-700 uppercase tracking-wider">Priority Concierge</div>
            <div className="text-xl font-bold text-slate-900 mt-1">VIP Fast-Track</div>
            <p className="text-xs text-slate-500 mt-1">Zero wait time & guaranteed weekend evening slots.</p>
          </div>
        </div>
      </div>

      {/* Available Plans Catalog */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Explore All Salon Membership Tiers</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Enjoy exclusive discounts, priority booking, complimentary treatments, and luxury perks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          {membershipTiers.map((tier) => (
            <div
              key={tier.id}
              className={`bg-white rounded-3xl border ${
                tier.isCurrent
                  ? "border-amber-400 ring-2 ring-amber-400/20 shadow-lg"
                  : "border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
              } p-6 sm:p-7 flex flex-col justify-between transition-all`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${tier.accentBg}`}>
                    {tier.badge}
                  </span>
                  {tier.isCurrent && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <CheckCircle2 className="w-3 h-3 text-amber-600" />
                      Active Plan
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{tier.tagline}</p>

                <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-bold text-slate-900">₹{tier.price.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 ml-1">/ {tier.duration}</span>
                  </div>
                  <div className="text-right text-[11px] text-emerald-700 font-semibold">
                    {tier.discountServices}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Included Privileges</div>
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    {tier.perks.map((perk, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleRenewUpgrade(tier.name, tier.price)}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    tier.isCurrent
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg"
                      : "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  <span>{tier.isCurrent ? "Renew Membership" : `Upgrade to ${tier.name}`}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
