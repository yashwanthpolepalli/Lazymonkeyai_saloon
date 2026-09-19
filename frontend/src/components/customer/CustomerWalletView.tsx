"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  Wallet,
  Sparkles,
  CreditCard,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Tag,
} from "lucide-react";
import confetti from "canvas-confetti";

export function CustomerWalletView() {
  const { currentCustomer, addToast } = useSalon();
  const [topUpAmount, setTopUpAmount] = useState<number>(5000);
  const [isCustomTopUp, setIsCustomTopUp] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<string>("");

  const quickTopUpPacks = [
    { amount: 2000, bonus: 200, label: "Starter Luxe Pack", badge: "+10% Free" },
    { amount: 5000, bonus: 750, label: "Prestige Beauty Pack", badge: "+15% Free", popular: true },
    { amount: 10000, bonus: 2000, label: "Royal VIP Sovereign Pack", badge: "+20% Free" },
    { amount: 25000, bonus: 6000, label: "Celebrity Master Atelier Pack", badge: "+24% Bonus Value" },
  ];

  const transactions = [
    {
      id: "tx_991",
      date: "Today, 10:45 AM",
      desc: "Cashback Reward - Hair Spa Treatment",
      type: "credit",
      amount: 450,
      balanceAfter: currentCustomer.walletBalance + 450,
      mode: "Loyalty Cash",
    },
    {
      id: "tx_990",
      date: "Aug 28, 2026",
      desc: "Service Bill - Balayage & Olaplex Ritual",
      type: "debit",
      amount: 4800,
      balanceAfter: currentCustomer.walletBalance,
      mode: "Wallet Pay",
    },
    {
      id: "tx_989",
      date: "Aug 15, 2026",
      desc: "Wallet Top-up (+₹1,000 Bonus Cash)",
      type: "credit",
      amount: 6000,
      balanceAfter: currentCustomer.walletBalance + 4800,
      mode: "UPI / GPay",
    },
    {
      id: "tx_988",
      date: "Aug 02, 2026",
      desc: "Referral Bonus - Invited Priya Shah",
      type: "credit",
      amount: 500,
      balanceAfter: currentCustomer.walletBalance - 1200,
      mode: "Referral Reward",
    },
  ];

  const handleProcessTopUp = (amount: number, bonus: number) => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });
    addToast(
      "success",
      "Wallet Reloaded Successfully!",
      `₹${amount.toLocaleString()} + ₹${bonus.toLocaleString()} bonus added to your Salon Cash Wallet.`
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Multi-color Glowing Wallet Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider">
                <Wallet className="w-3.5 h-3.5 text-emerald-200" />
                <span>Salon Luxe Digital Wallet</span>
              </div>
              <div className="text-xs font-mono bg-black/20 px-2.5 py-1 rounded-lg border border-white/20">
                ACTIVE
              </div>
            </div>

            <div>
              <div className="text-xs text-emerald-100 font-medium">Available Wallet Balance</div>
              <div className="text-3xl sm:text-4xl font-bold mt-1">
                ₹{(currentCustomer.walletBalance || 4250).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-100 mt-2">
                <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-semibold">
                  100% Usable on all Services & Retail
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-emerald-200 block text-[10px] uppercase">Account Holder</span>
                <span className="font-semibold text-white">{currentCustomer.name}</span>
              </div>
              <div>
                <span className="text-emerald-200 block text-[10px] uppercase">Linked Mobile</span>
                <span className="font-semibold font-mono text-white">{currentCustomer.phone}</span>
              </div>
              <div>
                <span className="text-emerald-200 block text-[10px] uppercase">Reward Points</span>
                <span className="font-semibold text-amber-300">
                  {currentCustomer.loyaltyPoints || 850} Pts (= ₹{((currentCustomer.loyaltyPoints || 850) * 0.5).toFixed(0)})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Perks Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Wallet Privileges</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Instant 1-Click checkout at salon billing counter</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Earn up to 24% free bonus cash on reloads</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Transfer balance to family members anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Zero expiry date on stored cash funds</span>
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
            <Gift className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block">Birthday Month Privilege</span>
              <span className="text-[11px] text-amber-800">Get 2X reward points on all wallet reloads this month!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top-up Selection Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>Reload Wallet with Bonus Value Packs</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a promotional pack to instantly receive additional salon service credit.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
            Instant Credit Activation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickTopUpPacks.map((pack) => (
            <div
              key={pack.amount}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                pack.popular
                  ? "border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20 shadow-md"
                  : "border-slate-200/80 hover:border-emerald-300 shadow-xs hover:shadow-sm"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {pack.badge}
                  </span>
                  {pack.popular && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      Best Value
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  ₹{pack.amount.toLocaleString()}
                </div>
                <div className="text-xs font-semibold text-emerald-700">
                  + ₹{pack.bonus.toLocaleString()} Extra Bonus
                </div>
                <p className="text-[11px] text-slate-500">{pack.label}</p>
              </div>

              <button
                onClick={() => handleProcessTopUp(pack.amount, pack.bonus)}
                className={`w-full mt-4 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  pack.popular
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Pay ₹{pack.amount.toLocaleString()}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900">Recent Wallet Transactions</h3>
          <span className="text-xs text-slate-500">Showing last 4 entries</span>
        </div>

        <div className="divide-y divide-slate-100">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === "credit"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {tx.type === "credit" ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{tx.desc}</div>
                  <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                    <span>{tx.date}</span>
                    <span>&bull;</span>
                    <span className="text-slate-600">{tx.mode}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`font-bold text-sm font-mono ${
                    tx.type === "credit" ? "text-emerald-700" : "text-slate-900"
                  }`}
                >
                  {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400">
                  Bal: ₹{tx.balanceAfter.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
