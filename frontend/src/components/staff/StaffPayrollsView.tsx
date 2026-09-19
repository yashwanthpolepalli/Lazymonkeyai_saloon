"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  DollarSign,
  Download,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Percent,
  Receipt,
  FileText,
  ShieldCheck,
  Building,
} from "lucide-react";

export function StaffPayrollsView() {
  const { addToast } = useSalon();
  const [selectedMonth, setSelectedMonth] = useState("August 2026");

  const payslips = [
    {
      month: "August 2026",
      baseSalary: 45000,
      serviceCommission: 28400, // 15% on ₹1.89L service revenue
      retailCommission: 4800,   // 10% on ₹48k product sales
      tipsBonus: 6500,
      overtime: 3200,
      pfDeduction: 1800,
      taxDeduction: 3100,
      netSalary: 83000,
      status: "paid",
      payoutDate: "Sep 01, 2026",
      txRef: "SAL-NEFT-889021",
    },
    {
      month: "July 2026",
      baseSalary: 45000,
      serviceCommission: 24900,
      retailCommission: 3900,
      tipsBonus: 5800,
      overtime: 1600,
      pfDeduction: 1800,
      taxDeduction: 2800,
      netSalary: 76600,
      status: "paid",
      payoutDate: "Aug 01, 2026",
      txRef: "SAL-NEFT-774910",
    },
    {
      month: "June 2026",
      baseSalary: 45000,
      serviceCommission: 31200,
      retailCommission: 5400,
      tipsBonus: 7100,
      overtime: 4800,
      pfDeduction: 1800,
      taxDeduction: 3500,
      netSalary: 88200,
      status: "paid",
      payoutDate: "Jul 01, 2026",
      txRef: "SAL-NEFT-662319",
    },
  ];

  const activeSlip = payslips.find((p) => p.month === selectedMonth) || payslips[0];

  const handleDownloadSlip = () => {
    addToast("info", "Generating Payslip", `Downloading official salary slip PDF for ${selectedMonth}...`);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Earnings, Commission & Payslips
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Stylist Payrolls & Salary Slips
          </h1>
          <p className="text-xs text-slate-500">
            Detailed breakdown of Base Salary, Service Commission, Retail Incentives, and Deductions.
          </p>
        </div>

        <button
          onClick={handleDownloadSlip}
          className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Download Payslip PDF</span>
        </button>
      </div>

      {/* Salary Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                Salary Statement &bull; {activeSlip.month}
              </h3>
              <p className="text-xs text-slate-400">
                Processed via Direct NEFT &bull; Ref: <span className="font-mono">{activeSlip.txRef}</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              DISBURSED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Earnings Col */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 pb-1 border-b border-emerald-100">
                Earnings (+)
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Base Master Pay:</span>
                  <span className="font-mono font-semibold text-slate-900">₹{activeSlip.baseSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Service Commission (15%):</span>
                  <span className="font-mono font-semibold text-emerald-700">+₹{activeSlip.serviceCommission.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Retail Product Sales (10%):</span>
                  <span className="font-mono font-semibold text-emerald-700">+₹{activeSlip.retailCommission.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Client Tips Collected:</span>
                  <span className="font-mono font-semibold text-rose-600">+₹{activeSlip.tipsBonus.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Overtime Hours (8h):</span>
                  <span className="font-mono font-semibold text-slate-900">+₹{activeSlip.overtime.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions Col */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-700 pb-1 border-b border-rose-100">
                Deductions (-)
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Provident Fund (PF):</span>
                  <span className="font-mono font-semibold text-slate-900">-₹{activeSlip.pfDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Professional Tax & TDS:</span>
                  <span className="font-mono font-semibold text-slate-900">-₹{activeSlip.taxDeduction.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <div>
              <span className="text-xs text-slate-500 block">Total Net Disbursed Payout</span>
              <span className="text-2xl font-bold text-emerald-800">
                ₹{activeSlip.netSalary.toLocaleString()}
              </span>
            </div>
            <span className="text-xs text-slate-500">Paid on {activeSlip.payoutDate}</span>
          </div>
        </div>

        {/* Previous Months History */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900">Payslip History</h3>
          <div className="space-y-2">
            {payslips.map((slip) => (
              <div
                key={slip.month}
                onClick={() => setSelectedMonth(slip.month)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                  selectedMonth === slip.month
                    ? "border-emerald-500 bg-emerald-50/20 shadow-xs"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900">{slip.month}</div>
                  <div className="text-slate-400 text-[11px]">{slip.payoutDate}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold font-mono text-emerald-700">₹{slip.netSalary.toLocaleString()}</div>
                  <span className="text-[10px] text-slate-400 uppercase">View &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
