"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
  Trash2,
} from "lucide-react";
import { CRMService } from "@/services/apiClient";

export function OwnerMembershipsView() {
  const { addToast } = useSalon();
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [planName, setPlanName] = useState("");
  const [price, setPrice] = useState("9999");
  const [duration, setDuration] = useState("6 Months");
  const [discountPercent, setDiscountPercent] = useState("20");
  const [retailDiscountPercent, setRetailDiscountPercent] = useState("15");
  const [freeBlowouts, setFreeBlowouts] = useState("2");
  const [perksInput, setPerksInput] = useState(
    "Complimentary Signature Blow-Dry monthly, Free Senior Stylist upgrade, 1000 Welcome Bonus points"
  );

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const data = await CRMService.getMemberships();
      if (Array.isArray(data)) {
        setPlans(data);
      }
    } catch (err) {
      console.warn("Could not load membership tiers from backend:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;

    setIsSaving(true);
    try {
      const validityDays =
        duration === "1 Month"
          ? 30
          : duration === "3 Months"
          ? 90
          : duration === "12 Months"
          ? 365
          : 180;

      const perksList = perksInput
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        name: planName.trim(),
        price: Number(price) || 0,
        validity_days: validityDays,
        discount_percentage: Number(discountPercent) || 0,
        color:
          Number(price) >= 20000
            ? "from-violet-600 to-indigo-700"
            : Number(price) >= 10000
            ? "from-amber-500 to-yellow-600"
            : "from-slate-700 to-slate-900",
        bg_gradient:
          Number(price) >= 20000
            ? "border-violet-300 bg-violet-50/30"
            : Number(price) >= 10000
            ? "border-amber-400 bg-amber-50/30"
            : "border-slate-300 bg-slate-50/50",
        benefits:
          perksList.length > 0
            ? perksList
            : [`${discountPercent}% OFF all salon services`, "Priority slot reservation"],
        eligible_categories: ["Hair", "Skin", "Spa"],
        eligible_branches: [],
        free_monthly_blowouts: Number(freeBlowouts) || 0,
        priority_booking: true,
      };

      await CRMService.createMembership(payload);
      addToast(
        "success",
        "Plan Published!",
        `${planName} (₹${Number(price).toLocaleString()}) created in live database.`
      );
      setPlanName("");
      setPrice("9999");
      setIsAddPlanModalOpen(false);
      await loadPlans();
    } catch (err: any) {
      addToast("error", "Error Creating Plan", err.message || "Failed to create membership tier.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async (tierId: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;
    try {
      await CRMService.deleteMembership(tierId);
      addToast("info", "Plan Deactivated", `${name} removed from customer portal.`);
      await loadPlans();
    } catch (err: any) {
      addToast("error", "Error Deleting Plan", err.message || "Failed to delete tier.");
    }
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

        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <span className="text-xs font-medium text-slate-500">Loading live membership plans...</span>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No Membership Tiers Created Yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Create your first VIP tier to offer exclusive salon discounts, complimentary services, and priority slots to your clients.
              </p>
            </div>
            <button
              onClick={() => setIsAddPlanModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Tier</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((p) => {
            const durationLabel =
              p.validity_days >= 360
                ? "12 Months"
                : p.validity_days >= 170
                ? "6 Months"
                : p.validity_days >= 80
                ? "3 Months"
                : `${p.validity_days} Days`;

            const cardBorder =
              p.price >= 20000
                ? "border-violet-300 bg-violet-50/20"
                : p.price >= 10000
                ? "border-amber-400 bg-amber-50/20"
                : "border-slate-300 bg-slate-50/40";

            const badgeText =
              p.price >= 20000
                ? "Flagship Luxury"
                : p.price >= 10000
                ? "Most Popular"
                : "Starter Tier";

            return (
              <div
                key={p.id}
                className={`bg-white rounded-3xl border p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-6 ${cardBorder}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 shadow-xs">
                      {badgeText}
                    </span>
                    <button
                      type="button"
                      title="Deactivate Tier"
                      onClick={() => handleDeletePlan(p.id, p.name)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-xl text-slate-900">{p.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-slate-900">
                        ₹{Number(p.price).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500">/ {durationLabel}</span>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-emerald-700">
                      <span>Service Discount:</span>
                      <span>{p.discount_percentage}% OFF</span>
                    </div>
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Monthly Free Blowouts:</span>
                      <span>{p.free_monthly_blowouts || 0} Visits</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Included Privileges
                    </span>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {Array.isArray(p.benefits) && p.benefits.length > 0 ? (
                        p.benefits.map((perk: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{perk}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{p.discount_percentage}% discount on all salon services</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[10px] truncate max-w-[140px]">
                    ID: {p.id}
                  </span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    Live Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                type="button"
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
                  <label className="font-semibold text-slate-700 block mb-1">Free Monthly Blowouts</label>
                  <input
                    type="number"
                    value={freeBlowouts}
                    onChange={(e) => setFreeBlowouts(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Perks & Privileges (comma-separated)</label>
                <textarea
                  rows={2}
                  value={perksInput}
                  onChange={(e) => setPerksInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                />
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
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to DB...</span>
                    </>
                  ) : (
                    <span>Publish Plan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
