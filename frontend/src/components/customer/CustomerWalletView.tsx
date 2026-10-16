"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Loader2,
  RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { CRMService } from "@/services/apiClient";

export interface WalletPack {
  id: string;
  name: string;
  amount: number;
  bonus: number;
  badge?: string;
  is_popular?: boolean;
  display_order?: number;
}

export interface WalletTransaction {
  id: string;
  date: string;
  desc: string;
  type: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  mode: string;
}

export function CustomerWalletView() {
  const { currentCustomer, setCurrentCustomer, setCustomers, addToast } = useSalon();
  const [customAmount, setCustomAmount] = useState<string>("");
  const [packs, setPacks] = useState<WalletPack[]>([]);
  const [isLoadingPacks, setIsLoadingPacks] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState<boolean>(true);
  const [isProcessingTopUp, setIsProcessingTopUp] = useState<boolean>(false);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);

  // Fetch live wallet top-up packs from PostgreSQL DB
  const fetchPacks = useCallback(async () => {
    setIsLoadingPacks(true);
    try {
      const data = await CRMService.getWalletPacks();
      if (Array.isArray(data)) {
        setPacks(data);
      }
    } catch (err) {
      console.error("Failed to load wallet packs from DB:", err);
      addToast("error", "Failed to Load Packs", "Could not fetch dynamic wallet packs from server.");
    } finally {
      setIsLoadingPacks(false);
    }
  }, [addToast]);

  // Fetch real customer wallet balance and transaction ledger from PostgreSQL DB
  const fetchWalletData = useCallback(async () => {
    if (!currentCustomer?.id) {
      setTransactions([]);
      setIsLoadingTx(false);
      return;
    }
    setIsLoadingTx(true);
    try {
      const data = await CRMService.getWalletBalance(currentCustomer.id);
      if (data) {
        if (typeof data.balance === "number" && currentCustomer) {
          if (currentCustomer.walletBalance !== data.balance) {
            setCurrentCustomer({ ...currentCustomer, walletBalance: data.balance });
            setCustomers((prev) =>
              prev.map((c) => (c.id === currentCustomer.id ? { ...c, walletBalance: data.balance } : c))
            );
          }
        }

        if (Array.isArray(data.history)) {
          const mappedTxs: WalletTransaction[] = data.history.map((tx: any) => {
            const isTopUp = tx.type === "topup" || tx.type === "credit";
            const bonus = Number(tx.bonus_amount || 0);
            const amt = Number(tx.amount || 0);
            return {
              id: tx.id || `tx_${Math.random()}`,
              date: tx.date || "Recent",
              desc:
                tx.notes ||
                (isTopUp
                  ? bonus > 0
                    ? `Wallet Top-up (+₹${bonus.toLocaleString()} Bonus Cash)`
                    : "Wallet Reload (Top-up)"
                  : "Service Bill Payment"),
              type: tx.type === "debit" ? "debit" : "credit",
              amount: isTopUp ? amt + bonus : amt,
              balanceAfter: Number(tx.balance_after || 0),
              mode: tx.payment_method || "UPI / NetBanking",
            };
          });
          setTransactions(mappedTxs);
        }
      }
    } catch (err) {
      console.error("Failed to load live wallet transactions:", err);
    } finally {
      setIsLoadingTx(false);
    }
  }, [currentCustomer, setCurrentCustomer, setCustomers]);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleProcessTopUp = async (amount: number, bonus: number, packId?: string) => {
    if (!currentCustomer?.id) {
      addToast("warning", "No Customer Selected", "Please select a valid customer before topping up.");
      return;
    }

    if (amount <= 0) {
      addToast("warning", "Invalid Amount", "Please enter a valid amount greater than ₹0.");
      return;
    }

    setIsProcessingTopUp(true);
    if (packId) setSelectedPackId(packId);

    try {
      const res = await CRMService.topUpWallet(currentCustomer.id, amount, bonus, "UPI / NetBanking");

      if (res && typeof res.newBalance === "number") {
        const newBalance = res.newBalance;
        if (currentCustomer) {
          setCurrentCustomer({
            ...currentCustomer,
            walletBalance: newBalance,
          });
          setCustomers((prev) =>
            prev.map((c) => (c.id === currentCustomer.id ? { ...c, walletBalance: newBalance } : c))
          );
        }

        // Refresh transaction ledger from backend DB
        await fetchWalletData();

        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });

        addToast(
          "success",
          "Wallet Reloaded Successfully!",
          `₹${amount.toLocaleString()}${bonus > 0 ? ` + ₹${bonus.toLocaleString()} bonus` : ""} added to your Salon Cash Wallet.`
        );
        setCustomAmount("");
      }
    } catch (err) {
      console.error("Top-up request failed:", err);
      addToast("error", "Top-Up Failed", "Unable to complete transaction on backend. Please try again.");
    } finally {
      setIsProcessingTopUp(false);
      setSelectedPackId(null);
    }
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
                ₹{(currentCustomer?.walletBalance ?? 0).toLocaleString()}
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
                <span className="font-semibold text-white">{currentCustomer?.name || "No Customer Selected"}</span>
              </div>
              <div>
                <span className="text-emerald-200 block text-[10px] uppercase">Linked Mobile</span>
                <span className="font-semibold font-mono text-white">{currentCustomer?.phone || "—"}</span>
              </div>
              <div>
                <span className="text-emerald-200 block text-[10px] uppercase">Reward Points</span>
                <span className="font-semibold text-amber-300">
                  {currentCustomer?.loyaltyPoints ?? 0} Pts (= ₹{(((currentCustomer?.loyaltyPoints ?? 0) * 0.5)).toFixed(0)})
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
              Select a promotional pack to instantly receive additional salon service credit from live database offers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchPacks()}
              disabled={isLoadingPacks}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
              title="Refresh Packs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPacks ? "animate-spin" : ""}`} />
            </button>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Instant Credit Activation
            </span>
          </div>
        </div>

        {isLoadingPacks ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-5 border border-slate-200/80 bg-slate-50/50 animate-pulse space-y-4"
              >
                <div className="h-5 w-20 bg-slate-200 rounded-md" />
                <div className="h-8 w-28 bg-slate-200 rounded-lg" />
                <div className="h-4 w-36 bg-slate-200 rounded" />
                <div className="h-9 w-full bg-slate-200 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : packs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600 text-xs">No Promotional Packs Active</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Use the custom reload option below or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {packs.map((pack) => {
              const isSelected = isProcessingTopUp && selectedPackId === pack.id;
              const isPopular = Boolean(pack.is_popular);
              return (
                <div
                  key={pack.id}
                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isPopular
                      ? "border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20 shadow-md"
                      : "border-slate-200/80 hover:border-emerald-300 shadow-xs hover:shadow-sm"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {pack.badge || `+${Math.round((pack.bonus / pack.amount) * 100)}% Bonus`}
                      </span>
                      {isPopular && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                          Best Value
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      ₹{Number(pack.amount).toLocaleString()}
                    </div>
                    <div className="text-xs font-semibold text-emerald-700">
                      + ₹{Number(pack.bonus).toLocaleString()} Extra Bonus
                    </div>
                    <p className="text-[11px] text-slate-500">{pack.name}</p>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessingTopUp}
                    onClick={() => handleProcessTopUp(pack.amount, pack.bonus, pack.id)}
                    className={`w-full mt-4 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                      isPopular
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Pay ₹{Number(pack.amount).toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Custom Amount Reload Option */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Custom Reload:</span> Enter any custom amount to add to your salon wallet.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-52">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
              <input
                type="number"
                min="100"
                step="100"
                disabled={isProcessingTopUp}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="e.g. 3000"
                className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-50"
              />
            </div>
            <button
              type="button"
              disabled={isProcessingTopUp}
              onClick={() => {
                const val = parseFloat(customAmount);
                if (!val || val <= 0) {
                  addToast("warning", "Amount Required", "Please enter a valid amount greater than ₹0.");
                  return;
                }
                handleProcessTopUp(val, 0);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isProcessingTopUp && !selectedPackId ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Pay & Reload</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-slate-900">Recent Wallet Transactions</h3>
            <button
              type="button"
              onClick={() => fetchWalletData()}
              disabled={isLoadingTx}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
              title="Refresh Transactions"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTx ? "animate-spin" : ""}`} />
            </button>
          </div>
          <span className="text-xs text-slate-500">
            {isLoadingTx
              ? "Updating..."
              : transactions.length === 0
              ? "No records"
              : `${transactions.length} entries (PostgreSQL)`}
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <Wallet className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
            <p className="font-semibold text-slate-600 text-xs">No Wallet Transactions Yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Top up your wallet above or pay for services to see your ledger here.</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
