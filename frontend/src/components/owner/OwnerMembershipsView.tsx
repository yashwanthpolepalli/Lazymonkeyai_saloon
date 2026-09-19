"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  Crown,
  Plus,
  CheckCircle2,
  Tag,
  DollarSign,
  Gift,
  Users,
  Edit2,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export function OwnerMembershipsView() {
  const { addToast } = useSalon();
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);

  const [planName, setPlanName] = useState("");
  const [price, setPrice] = useState("9999");
  const [duration, setDuration] = useState("6 Months");
  const [discountPercent, setDiscountPercent] = useState("20");

  const plans = [
    {
      id: "plan_silver",
      name: "Silver Prestige",
      price: 4999,
      duration: "3 Months",
      discountServices: 10,
      discountRetail: 5,
      activeMembersCount: 42,
      perks: [
        "1 Free Hair Spa per month",
        "10% OFF all hair & nail services",
        "Weekend priority slot reservation",
      ],
      badge: "Starter Tier",
      color: "border-slate-300 bg-slate-50/50",
    },
    {
      id: "plan_gold",
      name: "Gold Royalty Club",
      price: 12999,
      duration: "6 Months",
      discountServices: 20,
      discountRetail: 15,
      activeMembersCount: 88,
      perks: [
        "2 Free Signature Blow-Drys & Scalp Massages monthly",
        "20% OFF all salon services & 15% retail",
        "Free upgrade to Senior or Master Stylist tier",
      ],
      badge: "Most Popular",
      color: "border-amber-400 bg-amber-50/30",
    },
    {
      id: "plan_platinum",
      name: "Diamond Royal VIP",
      price: 24999,
      duration: "12 Months",
      discountServices: 30,
      discountRetail: 20,
      activeMembersCount: 29,
      perks: [
        "Unlimited Complimentary Express Blow-Drys",
        "30% OFF all services & 20% retail",
        "Dedicated Director Stylist & VIP Suite Access",
      ],
      badge: "Flagship Luxury",
      color: "border-violet-300 bg-violet-50/30",
    },
  ];

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;

    addToast("success", "Plan Created!", `${planName} (₹${price}) published to customer portal.`);
    setPlanName("");
    setIsAddPlanModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
              VIP Tier Architecture & Loyalty
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Membership Plans Management
          </h1>
          <p className="text-xs text-slate-500">
            Configure VIP tier benefits, discounts, validity durations, and complimentary treatment quotas.
          </p>
        </div>

        <button
          onClick={() => setIsAddPlanModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Membership Tier</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`bg-white rounded-3xl border p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-6 ${p.color}`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 shadow-xs">
                  {p.badge}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>{p.activeMembersCount} Active Members</span>
                </span>
              </div>

              <div>
                <h3 className="font-bold text-xl text-slate-900">{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-900">
                    ₹{p.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500">/ {p.duration}</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-emerald-700">
                  <span>Service Discount:</span>
                  <span>{p.discountServices}% OFF</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Retail Discount:</span>
                  <span>{p.discountRetail}% OFF</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Included Privileges
                </span>
                <ul className="space-y-2 text-xs text-slate-600">
                  {p.perks.map((perk, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">ID: {p.id}</span>
              <button
                onClick={() => addToast("info", "Edit Plan", `Editing ${p.name}`)}
                className="font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
              >
                Configure Plan &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Plan Modal */}
      {isAddPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Create Membership Plan</h3>
                  <p className="text-[11px] text-slate-400">Configure VIP pricing, duration & perks</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddPlanModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tier Name *</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. Royal Emerald VIP"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="1 Month">1 Month</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="12 Months">12 Months (Annual)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Service Discount (%)</label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Retail Discount (%)</label>
                  <input
                    type="number"
                    defaultValue="15"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPlanModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold cursor-pointer shadow-sm"
                >
                  Publish Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
