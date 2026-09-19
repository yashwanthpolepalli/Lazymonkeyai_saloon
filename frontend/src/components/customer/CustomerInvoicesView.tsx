"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  ShieldCheck,
  Building,
  Eye,
  X,
  Sparkles,
} from "lucide-react";
import { Invoice } from "@/types";

export function CustomerInvoicesView() {
  const { currentCustomer, selectedBranch, addToast } = useSalon();
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const invoices = [
    {
      id: "INV-2026-8941",
      date: "Sep 04, 2026",
      branchName: "Atelier Mumbai Flagship",
      services: [
        { name: "Balayage & Olaplex Bond Repair Spa", qty: 1, price: 5500 },
        { name: "Moroccanoil Botanical Scalp Therapy", qty: 1, price: 1800 },
      ],
      subtotal: 7300,
      discount: 1460, // 20% Gold
      tax: 1051,
      total: 6891,
      status: "paid",
      paymentMethod: "Salon Cash Wallet",
      stylist: "Aria Sharma (Master Stylist)",
    },
    {
      id: "INV-2026-7812",
      date: "Aug 22, 2026",
      branchName: "Atelier Mumbai Flagship",
      services: [
        { name: "24K Gold Illuminating Facial Ritual", qty: 1, price: 3800 },
        { name: "Luxury French Gel Manicure & Pedicure", qty: 1, price: 2400 },
      ],
      subtotal: 6200,
      discount: 1240,
      tax: 892,
      total: 5852,
      status: "paid",
      paymentMethod: "UPI / PhonePe",
      stylist: "Rahul Mehta (Senior Stylist)",
    },
    {
      id: "INV-2026-6510",
      date: "Jul 18, 2026",
      branchName: "Atelier Mumbai Flagship",
      services: [
        { name: "Gold Royalty Club Membership (6 Months)", qty: 1, price: 12999 },
      ],
      subtotal: 12999,
      discount: 0,
      tax: 2339,
      total: 15338,
      status: "paid",
      paymentMethod: "Credit Card (Visa **8821)",
      stylist: "Concierge Desk",
    },
    {
      id: "INV-2026-5120",
      date: "Jun 05, 2026",
      branchName: "Atelier Mumbai Flagship",
      services: [
        { name: "Keratin Smooth & Deep Conditioning", qty: 1, price: 6500 },
      ],
      subtotal: 6500,
      discount: 650,
      tax: 1053,
      total: 6903,
      status: "paid",
      paymentMethod: "Salon Cash Wallet",
      stylist: "Zara Chen (Director)",
    },
  ];

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.services.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDownloadPDF = (id: string) => {
    addToast("info", "Downloading Receipt", `Generating official Tax Invoice PDF for ${id}...`);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-teal-200" />
            <span>Digital Receipts & Tax Filing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Invoices & Service Receipts</h1>
          <p className="text-teal-100 text-xs sm:text-sm">
            Access itemized GST receipts, treatments history, and payment statements.
          </p>
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice number or service..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
          <span className="text-xs text-slate-500">
            Total Invoices: <span className="font-bold text-slate-900">{filteredInvoices.length}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Services / Treatments</th>
                <th className="py-3 px-4">Stylist</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{inv.id}</td>
                  <td className="py-3.5 px-4 text-slate-500">{inv.date}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs truncate">
                    {inv.services.map((s) => s.name).join(", ")}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{inv.stylist}</td>
                  <td className="py-3.5 px-4 text-slate-600">{inv.paymentMethod}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                    ₹{inv.total.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      PAID
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(inv.id)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                    LM
                  </div>
                  <span className="font-bold text-lg text-slate-900">
                    LAZYMONKEY<span className="text-amber-500 font-sans text-xs">AI</span> SALON
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Official GST Tax Invoice &bull; GSTIN: 27AABCL8891C1Z4
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bill Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block">Invoice Number</span>
                <span className="font-bold font-mono text-slate-900">{selectedInvoice.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Date of Service</span>
                <span className="font-bold text-slate-900">{selectedInvoice.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Client Name</span>
                <span className="font-bold text-slate-900">{currentCustomer.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Lead Stylist</span>
                <span className="font-bold text-slate-900">{selectedInvoice.stylist}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Services Delivered</div>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400">
                    <th className="py-2">Item</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.services.map((s: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2 font-medium text-slate-800">{s.name}</td>
                      <td className="py-2 text-center">{s.qty}</td>
                      <td className="py-2 text-right font-mono">₹{s.price.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Math */}
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">₹{selectedInvoice.subtotal.toLocaleString()}</span>
              </div>
              {selectedInvoice.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>VIP Member Discount:</span>
                  <span className="font-mono">-₹{selectedInvoice.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span className="font-mono">₹{selectedInvoice.tax.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                <span>Grand Total Paid:</span>
                <span className="text-emerald-700 font-mono">₹{selectedInvoice.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => handleDownloadPDF(selectedInvoice.id)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
