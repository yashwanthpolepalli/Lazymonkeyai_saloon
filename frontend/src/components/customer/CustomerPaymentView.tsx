"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  CreditCard,
  Wallet,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Tag,
  ArrowRight,
  Receipt,
  QrCode,
  Building,
  DollarSign,
  Heart,
  Scissors,
  ChevronRight,
  Trash2,
} from "lucide-react";
import confetti from "canvas-confetti";

export function CustomerPaymentView() {
  const {
    cart,
    clearCart,
    removeFromCart,
    currentCustomer,
    selectedBranch,
    addToast,
    setActiveSubTab,
  } = useSalon();

  const [paymentMethod, setPaymentMethod] = useState<
    "wallet" | "upi" | "card" | "salon_pay"
  >("wallet");
  const [tipPercent, setTipPercent] = useState<number>(10);
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [lastInvoiceId, setLastInvoiceId] = useState<string>("");

  // Default items if cart is empty so the user can test payment immediately
  const activeItems =
    cart.length > 0
      ? cart
      : [
          {
            id: "mock_c1",
            type: "service" as const,
            name: "Signature Balayage & Olaplex Hair Spa",
            basePrice: 5500,
            durationMinutes: 90,
            stylistName: "Aria Sharma (Master Stylist)",
            finalPrice: 5500,
          },
          {
            id: "mock_c2",
            type: "service" as const,
            name: "24K Gold Luxury Illuminating Facial",
            basePrice: 3800,
            durationMinutes: 60,
            stylistName: "Aria Sharma (Master Stylist)",
            finalPrice: 3800,
          },
        ];

  const subtotal = activeItems.reduce(
    (sum, item) => sum + (item.finalPrice || item.basePrice),
    0
  );

  const vipDiscountRate =
    currentCustomer.membershipTier === "gold"
      ? 0.2
      : currentCustomer.membershipTier === "platinum"
      ? 0.3
      : 0.1;
  const vipDiscountAmount = Math.round(subtotal * vipDiscountRate);
  const totalDiscount = vipDiscountAmount + appliedDiscount;
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);
  const taxAmount = Math.round(
    discountedSubtotal * (selectedBranch.taxRate || 0.18)
  );
  const tipAmount = Math.round((discountedSubtotal * tipPercent) / 100);
  const finalPayable = discountedSubtotal + taxAmount + tipAmount;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "LUXE500" || couponCode.toUpperCase() === "WELCOME") {
      setAppliedDiscount(500);
      addToast("success", "Coupon Applied!", "₹500 promotional discount applied to bill.");
    } else {
      addToast("error", "Invalid Coupon", "Try promo code LUXE500 or WELCOME");
    }
  };

  const handleProcessPayment = () => {
    const invId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setLastInvoiceId(invId);
    setIsPaid(true);

    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.55 },
    });

    addToast(
      "success",
      "Payment Successful!",
      `₹${finalPayable.toLocaleString()} charged via ${
        paymentMethod === "wallet"
          ? "Salon Cash Wallet"
          : paymentMethod === "upi"
          ? "Instant UPI / QR"
          : paymentMethod === "card"
          ? "Credit/Debit Card"
          : "Pay at Salon Desk"
      }. Invoice ${invId} generated.`
    );

    clearCart();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
            <span>256-Bit Encrypted Secure Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Checkout & Payment Gateway</h1>
          <p className="text-indigo-100 text-xs sm:text-sm">
            Pay seamlessly using Salon Wallet Cash, UPI, Credit Card, or Pay at Salon Desk.
          </p>
        </div>
      </div>

      {!isPaid ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Itemized Breakdown & Payment Method Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Services in Basket */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-indigo-500" />
                  <span>Itemized Salon Services & Retail ({activeItems.length})</span>
                </h3>
                <span className="text-xs text-slate-500">Atelier Mumbai Flagship</span>
              </div>

              <div className="divide-y divide-slate-100">
                {activeItems.map((item, idx) => (
                  <div key={item.id || idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.stylistName || "Lead Master Stylist"} &bull; {item.durationMinutes || 45} mins
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-slate-900">
                        ₹{(item.finalPrice || item.basePrice).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Select Payment Method</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Salon Wallet Option */}
                <div
                  onClick={() => setPaymentMethod("wallet")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    paymentMethod === "wallet"
                      ? "border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">Salon Cash Wallet</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        1-Click
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Bal: ₹{(currentCustomer.walletBalance || 4250).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Instant UPI / QR */}
                <div
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    paymentMethod === "upi"
                      ? "border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 mt-0.5">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-xs text-slate-900">Instant UPI & QR Code</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">GPay, PhonePe, Paytm, BHIM</p>
                  </div>
                </div>

                {/* Credit / Debit Card */}
                <div
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    paymentMethod === "card"
                      ? "border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-xs text-slate-900">Credit / Debit Card</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Visa, Mastercard, Amex, Diners</p>
                  </div>
                </div>

                {/* Pay at Counter */}
                <div
                  onClick={() => setPaymentMethod("salon_pay")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    paymentMethod === "salon_pay"
                      ? "border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-xs text-slate-900">Pay at Salon Counter</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Cash, POS card swipe after service</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stylist Tip Selector */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>Add Gratuity & Tip for Stylist</span>
                </h3>
                <span className="text-xs font-semibold text-rose-600">
                  {tipPercent > 0 ? `+₹${tipAmount.toLocaleString()} (${tipPercent}%)` : "No Tip"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {[0, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setTipPercent(pct)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      tipPercent === pct
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {pct === 0 ? "Custom/None" : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Bill Summary Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md h-fit space-y-6">
            <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-500" />
              <span>Payment Breakdown</span>
            </h3>

            {/* Promo Code Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Promo code (e.g. LUXE500)"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
              <button
                onClick={handleApplyCoupon}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                Apply
              </button>
            </div>

            {/* Line Items */}
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Services Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
              </div>

              {vipDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gold VIP Discount (20%):</span>
                  </span>
                  <span className="font-semibold">-₹{vipDiscountAmount.toLocaleString()}</span>
                </div>
              )}

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount:</span>
                  <span className="font-semibold">-₹{appliedDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>GST Tax (18%):</span>
                <span className="font-semibold text-slate-900">₹{taxAmount.toLocaleString()}</span>
              </div>

              {tipAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Stylist Gratuity:</span>
                  <span className="font-semibold">+₹{tipAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-bold text-slate-900">
                <span>Total Payable:</span>
                <span className="text-indigo-600 text-lg">₹{finalPayable.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleProcessPayment}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Pay ₹{finalPayable.toLocaleString()} Now</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Guaranteed safe payment & immediate tax invoice</span>
            </div>
          </div>
        </div>
      ) : (
        /* Payment Success Screen */
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Payment Successful!</h2>
            <p className="text-xs text-slate-500 mt-1">
              Transaction ID: <span className="font-mono font-bold text-slate-800">{lastInvoiceId}</span>
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-2 text-xs text-left">
            <div className="flex justify-between text-slate-600">
              <span>Paid Amount:</span>
              <span className="font-bold text-slate-900">₹{finalPayable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Payment Mode:</span>
              <span className="font-semibold text-slate-900 uppercase">{paymentMethod}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Date & Time:</span>
              <span className="font-semibold text-slate-900">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Salon Branch:</span>
              <span className="font-semibold text-slate-900">{selectedBranch.name}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveSubTab("invoices")}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              View & Print Tax Invoice
            </button>
            <button
              onClick={() => {
                setIsPaid(false);
                setActiveSubTab("services");
              }}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Explore More Services
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
