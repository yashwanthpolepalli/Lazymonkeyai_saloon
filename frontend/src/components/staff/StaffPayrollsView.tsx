"use client";

import React, { useState, useEffect } from "react";
import { useSalon } from "@/context/SalonContext";
import { HRMSService } from "@/services/apiClient";
import {
  Download,
  CheckCircle2,
  Receipt,
  FileText,
  Clock,
} from "lucide-react";

export function StaffPayrollsView() {
  const { addToast, currentStaff, selectedBranch } = useSalon();
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const currency = selectedBranch?.currency || "₹";

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const staffId = currentStaff?.id;
    HRMSService.getPayrollSlips(staffId)
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((d: any) => ({
            id: d.id,
            month: d.month || "Current Period",
            baseSalary: d.basic_salary || 0,
            serviceCommission: d.commission_amount || 0,
            retailCommission: 0,
            tipsBonus: 0,
            overtime: 0,
            pfDeduction: d.statutory_deductions || 0,
            taxDeduction: d.tax_deducted || 0,
            netSalary: d.net_salary || 0,
            status: d.payment_status || "generated",
            payoutDate: d.created_at
              ? new Date(d.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Disbursed",
            txRef: `PAY-${(d.id || "").slice(0, 8).toUpperCase()}`,
          }));
          setPayrolls(mapped);
          setSelectedMonth(mapped[0]?.month || "");
        } else {
          // If no recorded payslips in database yet, dynamically derive current period from employee record if salary exists
          const baseSalary = currentStaff?.basicSalary || currentStaff?.salaryBase || 0;
          const comm = currentStaff?.monthlyCommission || 0;
          const pf = currentStaff?.statutoryDed || 0;
          const net = currentStaff?.netTakeHome || (baseSalary + comm - pf);

          if (baseSalary > 0 || comm > 0) {
            const currentMonthName = new Date().toLocaleString("en-IN", {
              month: "long",
              year: "numeric",
            });
            const dynamicSlip = {
              id: "current",
              month: currentMonthName,
              baseSalary,
              serviceCommission: comm,
              retailCommission: 0,
              tipsBonus: 0,
              overtime: 0,
              pfDeduction: pf,
              taxDeduction: 0,
              netSalary: Math.max(0, net),
              status: "scheduled",
              payoutDate: "Cycle End",
              txRef: `REF-${currentStaff?.code || "LIVE"}`,
            };
            setPayrolls([dynamicSlip]);
            setSelectedMonth(currentMonthName);
          } else {
            setPayrolls([]);
            setSelectedMonth("");
          }
        }
      })
      .catch(() => {
        if (!isMounted) return;
        const baseSalary = currentStaff?.basicSalary || currentStaff?.salaryBase || 0;
        const comm = currentStaff?.monthlyCommission || 0;
        const pf = currentStaff?.statutoryDed || 0;
        const net = currentStaff?.netTakeHome || (baseSalary + comm - pf);

        if (baseSalary > 0 || comm > 0) {
          const currentMonthName = new Date().toLocaleString("en-IN", {
            month: "long",
            year: "numeric",
          });
          setPayrolls([
            {
              id: "current",
              month: currentMonthName,
              baseSalary,
              serviceCommission: comm,
              retailCommission: 0,
              tipsBonus: 0,
              overtime: 0,
              pfDeduction: pf,
              taxDeduction: 0,
              netSalary: Math.max(0, net),
              status: "scheduled",
              payoutDate: "Cycle End",
              txRef: `REF-${currentStaff?.code || "LIVE"}`,
            },
          ]);
          setSelectedMonth(currentMonthName);
        } else {
          setPayrolls([]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    currentStaff?.id,
    currentStaff?.salaryBase,
    currentStaff?.basicSalary,
    currentStaff?.monthlyCommission,
    currentStaff?.statutoryDed,
    currentStaff?.netTakeHome,
    currentStaff?.code,
  ]);

  const activeSlip = payrolls.find((p) => p.month === selectedMonth) || payrolls[0] || null;

  const handleDownloadSlip = () => {
    if (!activeSlip) return;
    addToast(
      "info",
      "Generating Payslip",
      `Preparing salary statement PDF for ${activeSlip.month}...`
    );
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
            {currentStaff?.name
              ? `Payroll statement and commission breakdown for ${currentStaff.name}.`
              : "Detailed breakdown of Base Salary, Service Commission, Retail Incentives, and Deductions."}
          </p>
        </div>

        {activeSlip && (
          <button
            onClick={handleDownloadSlip}
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download Payslip PDF</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-medium">Loading payroll records...</p>
        </div>
      ) : payrolls.length === 0 || !activeSlip ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-3">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Payslip Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {currentStaff?.name
              ? `No salary or commission disbursement slips are currently on file for ${currentStaff.name}. Once payroll is generated by management, itemized statements will appear here.`
              : "No salary slips are currently recorded. When monthly payroll is processed, statements will appear here."}
          </p>
        </div>
      ) : (
        /* Salary Overview Card */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  Salary Statement &bull; {activeSlip.month}
                </h3>
                <p className="text-xs text-slate-400">
                  Transaction Reference &bull; <span className="font-mono">{activeSlip.txRef}</span>
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full uppercase ${
                  activeSlip.status === "paid" || activeSlip.status === "disbursed"
                    ? "text-emerald-700 bg-emerald-100"
                    : "text-amber-700 bg-amber-100"
                }`}
              >
                {activeSlip.status === "paid" || activeSlip.status === "disbursed" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    DISBURSED
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    {activeSlip.status}
                  </>
                )}
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
                    <span className="text-slate-600">Base Salary:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {currency}{activeSlip.baseSalary.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Service Commission:</span>
                    <span className="font-mono font-semibold text-emerald-700">
                      +{currency}{activeSlip.serviceCommission.toLocaleString()}
                    </span>
                  </div>
                  {activeSlip.retailCommission > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Retail Product Sales:</span>
                      <span className="font-mono font-semibold text-emerald-700">
                        +{currency}{activeSlip.retailCommission.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {activeSlip.tipsBonus > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Client Tips Collected:</span>
                      <span className="font-mono font-semibold text-rose-600">
                        +{currency}{activeSlip.tipsBonus.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {activeSlip.overtime > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Overtime Pay:</span>
                      <span className="font-mono font-semibold text-slate-900">
                        +{currency}{activeSlip.overtime.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Deductions Col */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-700 pb-1 border-b border-rose-100">
                  Deductions (-)
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Provident Fund (PF / Statutory):</span>
                    <span className="font-mono font-semibold text-slate-900">
                      -{currency}{activeSlip.pfDeduction.toLocaleString()}
                    </span>
                  </div>
                  {activeSlip.taxDeduction > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Professional Tax & TDS:</span>
                      <span className="font-mono font-semibold text-slate-900">
                        -{currency}{activeSlip.taxDeduction.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <div>
                <span className="text-xs text-slate-500 block">Total Net Payout</span>
                <span className="text-2xl font-bold text-emerald-800">
                  {currency}{activeSlip.netSalary.toLocaleString()}
                </span>
              </div>
              <span className="text-xs text-slate-500">Date: {activeSlip.payoutDate}</span>
            </div>
          </div>

          {/* Previous Months History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">Payslip History</h3>
            <div className="space-y-2">
              {payrolls.map((slip) => (
                <div
                  key={slip.id}
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
                    <div className="font-bold font-mono text-emerald-700">
                      {currency}{slip.netSalary.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase">View &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
