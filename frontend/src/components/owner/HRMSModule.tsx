"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import { formatCurrency } from "@/lib/utils";
import { Employee } from "@/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Users,
  UserPlus,
  Clock,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  CheckCircle2,
  XCircle,
  Star,
  FileText,
} from "lucide-react";

export function HRMSModule() {
  const {
    employees,
    attendance,
    leaves,
    selectedBranch,
    activeSubTab,
    clockInEmployee,
    clockOutEmployee,
    updateLeaveStatus,
  } = useSalon();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(employees[0] || null);
  const [isNewEmpModalOpen, setIsNewEmpModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Subtab 1: Employees Directory & 360 Profile */}
      {(activeSubTab === "employees" || activeSubTab === "overview") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Employee Directory */}
          <Card className="p-5 lg:col-span-1 border-stone-200 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Artisan Staff ({employees.length})</span>
              </h3>
            </div>

            <div className="space-y-2">
              {employees.map((emp) => {
                const isSelected = selectedEmployee?.id === emp.id;
                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? "bg-amber-50/40 border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
                        : "bg-white border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-stone-900 truncate">{emp.name}</div>
                      <div className="text-[11px] text-stone-500">{emp.designation}</div>
                      <Badge variant="gold" size="sm" className="mt-1">
                        {emp.tier}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Employee 360 Full Profile */}
          {selectedEmployee && (
            <Card variant="luxury" className="p-6 lg:col-span-2 border-stone-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedEmployee.avatar}
                    alt={selectedEmployee.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-stone-900">
                        {selectedEmployee.name}
                      </h3>
                      <Badge variant="gold" size="sm">
                        {selectedEmployee.department}
                      </Badge>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {selectedEmployee.designation} • {selectedEmployee.phone} • Joined {selectedEmployee.joinDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-700 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {selectedEmployee.performanceRating} Rating
                  </span>
                </div>
              </div>

              {/* Payroll & Commission Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-stone-200">
                  <span className="text-[10px] uppercase font-mono text-stone-500 block">Base Salary</span>
                  <div className="text-lg font-bold text-stone-900 mt-0.5">
                    {formatCurrency(selectedEmployee.salaryBase, selectedBranch.currency)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-stone-200">
                  <span className="text-[10px] uppercase font-mono text-emerald-700 font-semibold block">
                    Monthly Commission ({selectedEmployee.commissionRate}%)
                  </span>
                  <div className="text-lg font-bold text-emerald-700 mt-0.5">
                    {formatCurrency(selectedEmployee.monthlyCommission, selectedBranch.currency)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-stone-200">
                  <span className="text-[10px] uppercase font-mono text-amber-700 font-semibold block">
                    Leave Balance
                  </span>
                  <div className="text-lg font-bold text-stone-900 mt-0.5">
                    {selectedEmployee.leaveBalance} Days
                  </div>
                </div>
              </div>

              {/* Verified Skills & Credentials */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-stone-800 uppercase font-mono">
                  Mastery Skills & Certified Diplomas
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployee.skills.map((skill) => (
                    <Badge key={skill} variant="slate" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Compliance Documents */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] block">
                  HR Compliance & Dossier Files
                </span>
                <div className="grid grid-cols-2 gap-2 text-stone-600">
                  {selectedEmployee.documentsSubmitted.map((doc) => (
                    <div key={doc} className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Subtab 2: Attendance Tracker */}
      {activeSubTab === "attendance" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <CardTitle>Artisan Attendance & Floor Check-in Ledger</CardTitle>
              <p className="text-xs text-stone-500 mt-0.5">
                Real-time shift clocking for {selectedBranch.name}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {employees.map((emp) => {
              const att = attendance.find((a) => a.employeeId === emp.id);
              const isCheckedIn = !!att;

              return (
                <div
                  key={emp.id}
                  className="p-3.5 rounded-xl border border-stone-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <div className="font-semibold text-stone-900">{emp.name}</div>
                      <div className="text-stone-500">{emp.designation}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-stone-500 block">
                        {isCheckedIn ? `In at ${att.checkIn}` : "Not clocked in"}
                      </span>
                      {att?.checkOut && (
                        <span className="text-stone-400 text-[10px]">Out at {att.checkOut}</span>
                      )}
                    </div>
                    {isCheckedIn ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => clockOutEmployee(emp.id)}
                      >
                        Clock Out
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="gold"
                        onClick={() => clockInEmployee(emp.id)}
                      >
                        Clock In
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Subtab 3: Leave Requests Approval */}
      {activeSubTab === "leave" && (
        <Card className="p-6 space-y-4">
          <CardTitle>Staff Leave & Vacation Authorizations</CardTitle>
          <div className="space-y-3">
            {leaves.map((lv) => (
              <div
                key={lv.id}
                className="p-4 rounded-xl border border-stone-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">{lv.employeeName}</span>
                    <Badge variant={lv.status === "approved" ? "success" : "warning"} size="sm">
                      {lv.type} ({lv.status})
                    </Badge>
                  </div>
                  <p className="text-stone-600 mt-1">{lv.reason}</p>
                  <span className="text-stone-400 font-mono text-[11px]">
                    {lv.startDate} to {lv.endDate}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {lv.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="gold"
                        onClick={() => updateLeaveStatus(lv.id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLeaveStatus(lv.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Subtab 4: Payroll Preview */}
      {activeSubTab === "payroll" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <CardTitle>Automated Monthly Payroll & Commission Ledger</CardTitle>
              <p className="text-xs text-stone-500 mt-0.5">
                Computed from base salary + direct POS attribution commissions
              </p>
            </div>
          </div>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase font-mono text-[10px]">
                <th className="py-2.5">Artisan</th>
                <th className="py-2.5">Department</th>
                <th className="py-2.5 text-right">Base Pay</th>
                <th className="py-2.5 text-right">Commission</th>
                <th className="py-2.5 text-right">Net Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="py-3 font-sans text-stone-900 font-semibold">{emp.name}</td>
                  <td className="py-3 font-sans text-stone-600">{emp.department}</td>
                  <td className="py-3 text-right">
                    {formatCurrency(emp.salaryBase, selectedBranch.currency)}
                  </td>
                  <td className="py-3 text-right text-emerald-700 font-bold">
                    +{formatCurrency(emp.monthlyCommission, selectedBranch.currency)}
                  </td>
                  <td className="py-3 text-right text-stone-900 font-bold text-sm">
                    {formatCurrency(emp.salaryBase + emp.monthlyCommission, selectedBranch.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
