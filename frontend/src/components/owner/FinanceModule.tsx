"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import { formatCurrency } from "@/lib/utils";
import { FinancialExpense } from "@/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  DollarSign,
  ReceiptText,
  FileSpreadsheet,
  CreditCard,
  PieChart,
  PlusCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export function FinanceModule() {
  const {
    expenses,
    branchAppointments,
    selectedBranch,
    activeSubTab,
    addToast,
  } = useSalon();

  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState<FinancialExpense["category"]>("Salon Maintenance");
  const [expenseAmount, setExpenseAmount] = useState<number>(15000);
  const [expensePaidTo, setExpensePaidTo] = useState("");

  const totalRevenue = branchAppointments
    .filter((a) => a.paymentStatus === "paid" || a.status === "completed")
    .reduce((sum, a) => sum + a.finalTotal, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const gstCollected = Math.round(totalRevenue * selectedBranch.taxRate * 100) / 100;

  const handleCreateExpense = () => {
    addToast("success", "Expense Logged", `Recorded expense of ${formatCurrency(expenseAmount, selectedBranch.currency)} for ${expensePaidTo}.`);
    setIsNewExpenseModalOpen(false);
    setExpensePaidTo("");
  };

  return (
    <div className="space-y-6">
      {/* Finance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="luxury" className="p-5 border-amber-900/20">
          <div className="flex items-center justify-between text-xs text-stone-500 font-mono uppercase">
            <span>Gross Revenue</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2">
            {formatCurrency(totalRevenue, selectedBranch.currency)}
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block font-semibold">+22.4% vs last month</span>
        </Card>

        <Card className="p-5 border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-500 font-mono uppercase">
            <span>Operational Expenses</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2">
            {formatCurrency(totalExpenses, selectedBranch.currency)}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">Rent, Stock, Utilities</span>
        </Card>

        <Card className="p-5 border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-500 font-mono uppercase">
            <span>Net Atelier Profit</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {formatCurrency(Math.max(0, netProfit), selectedBranch.currency)}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">Margin: 38.6%</span>
        </Card>

        <Card className="p-5 border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-500 font-mono uppercase">
            <span>GST / Tax Collected</span>
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2">
            {formatCurrency(gstCollected, selectedBranch.currency)}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">{Math.round(selectedBranch.taxRate * 100)}% tax rate</span>
        </Card>
      </div>

      {/* Subtab: Expenses Ledger */}
      {(activeSubTab === "expenses" || activeSubTab === "overview") && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <CardTitle>Operational Expenses & Vendor Payments Ledger</CardTitle>
              <p className="text-xs text-stone-500 mt-0.5">
                Audited disbursements for {selectedBranch.name}
              </p>
            </div>
            <Button variant="gold" size="sm" onClick={() => setIsNewExpenseModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>Record Expense</span>
            </Button>
          </div>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase font-mono text-[10px]">
                <th className="py-2.5">Category</th>
                <th className="py-2.5">Payee / Vendor</th>
                <th className="py-2.5">Payment Method</th>
                <th className="py-2.5">Date</th>
                <th className="py-2.5 text-right">Amount</th>
                <th className="py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td className="py-3 font-sans font-semibold text-stone-900">{exp.category}</td>
                  <td className="py-3 font-sans text-stone-600">{exp.paidTo}</td>
                  <td className="py-3 font-sans text-stone-500">{exp.paymentMethod}</td>
                  <td className="py-3 text-stone-500">{exp.date}</td>
                  <td className="py-3 text-right font-bold text-stone-900">
                    {formatCurrency(exp.amount, selectedBranch.currency)}
                  </td>
                  <td className="py-3 text-center font-sans">
                    <Badge variant="success" size="sm">
                      {exp.status.toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Subtab: GST & Tax Reports */}
      {activeSubTab === "gst_tax" && (
        <Card className="p-6 space-y-4">
          <CardTitle>Tax Filing & GST Breakdown Schedule</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-stone-500 block uppercase font-mono text-[10px]">CGST (9%)</span>
              <div className="text-xl font-bold text-stone-900 mt-1">
                {formatCurrency(gstCollected / 2, selectedBranch.currency)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-stone-500 block uppercase font-mono text-[10px]">SGST (9%)</span>
              <div className="text-xl font-bold text-stone-900 mt-1">
                {formatCurrency(gstCollected / 2, selectedBranch.currency)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-stone-500 block uppercase font-mono text-[10px]">Input Tax Credit (ITC)</span>
              <div className="text-xl font-bold text-emerald-700 mt-1">
                {formatCurrency(25560, selectedBranch.currency)}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Record Expense Modal */}
      <Modal
        isOpen={isNewExpenseModalOpen}
        onClose={() => setIsNewExpenseModalOpen(false)}
        title="Record Salon Expense"
        subtitle="Log operational overhead or inventory payment"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Expense Category</label>
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            >
              <option value="Rent & Lease">Rent & Lease</option>
              <option value="Inventory Stock">Inventory Stock</option>
              <option value="Staff Payroll">Staff Payroll</option>
              <option value="Utilities & Power">Utilities & Power</option>
              <option value="Marketing">Marketing</option>
              <option value="Salon Maintenance">Salon Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Payee Name</label>
            <input
              type="text"
              value={expensePaidTo}
              onChange={(e) => setExpensePaidTo(e.target.value)}
              placeholder="e.g. Luxury Power & Gas Utility"
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Amount</label>
            <input
              type="number"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <Button variant="gold" className="w-full" onClick={handleCreateExpense}>
            Record Disbursement
          </Button>
        </div>
      </Modal>
    </div>
  );
}
