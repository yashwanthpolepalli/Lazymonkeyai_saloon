"use client";

import React, { useState, useEffect } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  Users,
  UserCheck,
  Star,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  X,
  Award,
  Clock,
  CalendarCheck,
  CalendarDays,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  XCircle,
  Download,
  Upload,
  UserPlus,
  Shield,
  Layers,
  ChevronRight,
  Filter,
  Edit2,
  Trash2,
  CreditCard,
  Check,
  QrCode,
  Tag,
  Calculator,
  Fingerprint,
  MapPin,
} from "lucide-react";
import { Employee, LeaveRequest, AttendanceRecord } from "@/types";

export function OwnerStaffView() {
  const {
    employees,
    attendance,
    leaves,
    selectedBranch,
    activeSubTab,
    setActiveSubTab,
    addEmployee,
    clockInEmployee,
    clockOutEmployee,
    updateLeaveStatus,
    addLeaveRequest,
    addToast,
  } = useSalon();

  // Active HRMS Subtab Section
  const currentTab =
    activeSubTab === "attendance" ||
    activeSubTab === "daily_attendance" ||
    activeSubTab === "biometric" ||
    activeSubTab === "face_recognition" ||
    activeSubTab === "gps_attendance" ||
    activeSubTab === "shift_attendance" ||
    activeSubTab === "attendance_corrections"
      ? "attendance"
      : activeSubTab === "leave" ||
        activeSubTab === "leaves" ||
        activeSubTab === "leave_requests" ||
        activeSubTab === "leave_balances" ||
        activeSubTab === "leave_policy" ||
        activeSubTab === "holidays"
      ? "leave"
      : activeSubTab === "payroll" ||
        activeSubTab === "salary_structure" ||
        activeSubTab === "payroll_processing" ||
        activeSubTab === "pf" ||
        activeSubTab === "esi" ||
        activeSubTab === "tds" ||
        activeSubTab === "payslips" ||
        activeSubTab === "payslip_studio" ||
        activeSubTab === "loans" ||
        activeSubTab === "advances" ||
        activeSubTab === "bonuses" ||
        activeSubTab === "commissions"
      ? "payroll"
      : "employees";

  // Attendance view toggle
  const [attendanceViewMode, setAttendanceViewMode] = useState<"table" | "calendar">("table");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddLeaveOpen, setIsAddLeaveOpen] = useState(false);
  const [isManualPunchOpen, setIsManualPunchOpen] = useState(false);
  const [isMapSalaryOpen, setIsMapSalaryOpen] = useState(false);

  // New Employee Form State
  const [empName, setEmpName] = useState("");
  const [empCode, setEmpCode] = useState(`EMP-000${employees.length + 1}`);
  const [empEmail, setEmpEmail] = useState("");
  const [empRole, setEmpRole] = useState("Senior Stylist");
  const [empDept, setEmpDept] = useState<Employee["department"]>("Hair Styling");
  const [empReporting, setEmpReporting] = useState("Org Admin");
  const [empType, setEmpType] = useState<"Full-Time" | "Part-Time" | "Contract">("Full-Time");
  const [empSalary, setEmpSalary] = useState("35000");

  // Leave Form State (Screenshot 3)
  const [leaveEmpId, setLeaveEmpId] = useState(employees[0]?.id || "");
  const [leaveCategory, setLeaveCategory] = useState("Annual");
  const [leaveFromDate, setLeaveFromDate] = useState("2026-09-10");
  const [leaveToDate, setLeaveToDate] = useState("2026-09-11");
  const [leaveDaysReq, setLeaveDaysReq] = useState("1");
  const [leaveApprovalAction, setLeaveApprovalAction] = useState("Auto-Approve Immediate");
  const [leaveReason, setLeaveReason] = useState("");

  // Manual Punch State (Image 2 Replica)
  const [punchEmpId, setPunchEmpId] = useState(employees[0]?.id || "");
  const [punchDate, setPunchDate] = useState("05/09/2026");
  const [punchStatus, setPunchStatus] = useState("Present");
  const [punchCheckIn, setPunchCheckIn] = useState("09:00 AM");
  const [punchCheckOut, setPunchCheckOut] = useState("06:00 PM");
  const [punchMethod, setPunchMethod] = useState("Manual Entry (HR Verified)");
  const [punchNotes, setPunchNotes] = useState("Direct administrative timesheet record");

  // Dynamic Timesheet Records (Live initial records for all employees)
  const [timesheetRecords, setTimesheetRecords] = useState<
    Array<{
      id: string;
      empId: string;
      empName: string;
      role?: string;
      checkIn: string;
      checkOut: string;
      hoursWorked: string;
      punchMethod: string;
      status: string;
      notes: string;
      date: string;
    }>
  >([
    {
      id: "att_01",
      empId: "emp_isabella",
      empName: "Isabella Moreau",
      role: "Master Stylist",
      checkIn: "09:12 AM",
      checkOut: "06:30 PM",
      hoursWorked: "8.5 hrs",
      punchMethod: "Biometric Device (Fingerprint)",
      status: "Present",
      notes: "Morning biometric punch verified",
      date: "05/09/2026",
    },
    {
      id: "att_02",
      empId: "emp_arjun",
      empName: "Arjun Singhania",
      role: "Creative Director",
      checkIn: "08:58 AM",
      checkOut: "06:00 PM",
      hoursWorked: "8.0 hrs",
      punchMethod: "Face Recognition Scan",
      status: "Present",
      notes: "AI camera face scan auto-logged",
      date: "05/09/2026",
    },
    {
      id: "att_03",
      empId: "emp_priya",
      empName: "Priya Nair",
      role: "Senior Balayage Artist",
      checkIn: "09:05 AM",
      checkOut: "05:45 PM",
      hoursWorked: "7.8 hrs",
      punchMethod: "GPS Geo-Fenced Mobile",
      status: "Present",
      notes: "Salon geo-fenced mobile clock-in",
      date: "05/09/2026",
    },
    {
      id: "att_04",
      empId: "emp_rohan",
      empName: "Rohan Kapoor",
      role: "Executive Barber",
      checkIn: "08:45 AM",
      checkOut: "06:15 PM",
      hoursWorked: "8.5 hrs",
      punchMethod: "Biometric Device (Fingerprint)",
      status: "Present",
      notes: "Biometric hardware sync",
      date: "05/09/2026",
    },
    {
      id: "att_05",
      empId: "emp_elena",
      empName: "Elena Rostova",
      role: "Nail Artist & Aesthetician",
      checkIn: "09:30 AM",
      checkOut: "06:30 PM",
      hoursWorked: "8.0 hrs",
      punchMethod: "WFH Web Portal",
      status: "Present",
      notes: "Remote web portal punch",
      date: "05/09/2026",
    },
    {
      id: "att_06",
      empId: "emp_dev",
      empName: "Devraj Chauhan",
      role: "Clinical Skincare Specialist",
      checkIn: "09:15 AM",
      checkOut: "06:00 PM",
      hoursWorked: "8.0 hrs",
      punchMethod: "Manual Entry (HR Verified)",
      status: "Present",
      notes: "Direct administrative timesheet record",
      date: "05/09/2026",
    },
  ]);

  // Map Salary Modal State & Live Auto-Formulas (Screenshot 5)
  const [salaryEmpId, setSalaryEmpId] = useState(employees[0]?.id || "");
  const [basicSalaryVal, setBasicSalaryVal] = useState("5000");
  const [hraVal, setHraVal] = useState("2000");
  const [otherAllowancesVal, setOtherAllowancesVal] = useState("1000");
  const [pfDedVal, setPfDedVal] = useState("600");
  const [esiVal, setEsiVal] = useState("87.5");
  const [tdsVal, setTdsVal] = useState("500");
  const [otherDedVal, setOtherDedVal] = useState("50");

  // Auto-calculate on Basic Salary change
  const handleBasicSalaryChange = (val: string) => {
    setBasicSalaryVal(val);
    const num = parseFloat(val) || 0;
    const hra = num * 0.4;
    const otherAllow = num * 0.2;
    const pf = num * 0.12;
    const gross = num + hra + otherAllow;
    const esi = Math.round(gross * 0.0075 * 10) / 10;
    const tds = num >= 25000 ? 500 : 0;
    const other = 50;

    setHraVal(hra.toString());
    setOtherAllowancesVal(otherAllow.toString());
    setPfDedVal(pf.toString());
    setEsiVal(esi.toString());
    setTdsVal(tds.toString());
    setOtherDedVal(other.toString());
  };

  // Calculations for live breakdown
  const basicNum = parseFloat(basicSalaryVal) || 0;
  const hraNum = parseFloat(hraVal) || 0;
  const allowNum = parseFloat(otherAllowancesVal) || 0;
  const grossEarnings = basicNum + hraNum + allowNum;

  const pfNum = parseFloat(pfDedVal) || 0;
  const esiNum = parseFloat(esiVal) || 0;
  const tdsNum = parseFloat(tdsVal) || 0;
  const otherDedNum = parseFloat(otherDedVal) || 0;
  const totalDeductions = pfNum + esiNum + tdsNum + otherDedNum;
  const netTakeHome = grossEarnings - totalDeductions;

  const filteredEmployees = employees.filter((emp) => {
    if (deptFilter !== "all" && emp.department !== deptFilter) return false;
    if (statusFilter !== "all" && emp.status !== statusFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        (emp.code && emp.code.toLowerCase().includes(q)) ||
        (emp.email && emp.email.toLowerCase().includes(q)) ||
        (emp.role && emp.role.toLowerCase().includes(q)) ||
        (emp.reportingManager && emp.reportingManager.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) {
      addToast("warning", "Missing Details", "Please enter employee Name.");
      return;
    }

    addEmployee({
      name: empName.trim(),
      code: empCode.trim() || `EMP-000${employees.length + 1}`,
      email: empEmail.trim() || `${empName.toLowerCase().replace(/\s+/g, "")}@example.com`,
      department: empDept,
      designation: "—",
      role: empRole,
      reportingManager: empReporting,
      employmentType: empType,
      joinDate: new Date().toLocaleDateString("en-GB"),
      status: "active",
      salaryBase: Number(empSalary) || 35000,
      basicSalary: Number(empSalary) || 35000,
      hra: (Number(empSalary) || 35000) * 0.4,
      allowances: 3500,
      statutoryDed: 3100,
      netTakeHome: (Number(empSalary) || 35000) * 1.4 - 3100,
    });

    addToast("success", "Employee Enrolled", `${empName} added to directory.`);
    setEmpName("");
    setEmpEmail("");
    setIsAddStaffOpen(false);
  };

  const handleRecordLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === leaveEmpId) || employees[0];
    addLeaveRequest({
      employeeId: emp.id,
      employeeName: emp.name,
      type: leaveCategory === "Annual" ? "paid" : leaveCategory === "Sick" ? "sick" : "casual",
      startDate: leaveFromDate,
      endDate: leaveToDate,
      reason: leaveReason || "Planned leave",
    });

    addToast("success", "Leave Application Recorded", `Leave scheduled for ${emp.name}.`);
    setLeaveReason("");
    setIsAddLeaveOpen(false);
  };

  const handleSavePunch = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === punchEmpId) || employees[0];
    const empName = emp ? emp.name : "Employee";

    const newRecord = {
      id: `ATT-${Date.now()}`,
      empId: emp?.id || "EMP-001",
      empName: empName,
      checkIn: punchCheckIn || "09:00 AM",
      checkOut: punchCheckOut || "06:00 PM",
      hoursWorked: "9.0 hrs",
      punchMethod: punchMethod || "Manual Entry (HR Verified)",
      status: punchStatus || "Present",
      notes: punchNotes || "Direct administrative timesheet record",
      date: punchDate || "05/09/2026",
    };

    setTimesheetRecords((prev) => [newRecord, ...prev]);
    addToast("success", "Attendance Recorded", `Timesheet punch saved for ${empName}.`);
    setIsManualPunchOpen(false);
  };

  const handleSaveSalaryStructure = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === salaryEmpId) || employees[0];
    addToast(
      "success",
      "Salary Structure Configured",
      `Gross: ₹${grossEarnings.toLocaleString()} | Net Take-Home: ₹${netTakeHome.toLocaleString()} for ${emp.name}.`
    );
    setIsMapSalaryOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Staff Management Module Navigation Card (Sky Blue Theme) */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab("employees")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === "employees"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20 font-bold"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff Enrollment / Employees</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                currentTab === "employees" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {employees.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("daily_attendance")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === "attendance"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20 font-bold"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Attendance & Timesheets</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                currentTab === "attendance" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
              }`}
            >
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("leave_requests")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === "leave"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20 font-bold"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Leave Management</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                currentTab === "leave" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
              }`}
            >
              {leaves.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("salary_structure")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === "payroll"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20 font-bold"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Payroll & Salary Structure</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                currentTab === "payroll" ? "bg-white/20 text-white" : "bg-purple-100 text-purple-800"
              }`}
            >
              Auto
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. STAFF DIRECTORY / EMPLOYEE MANAGEMENT (SCREENSHOT 1)                  */}
      {/* ========================================================================= */}
      {currentTab === "employees" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Management</h1>
              <p className="text-xs text-slate-500 mt-1">
                {employees.length} active employee directories linked to user login authentication.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => addToast("info", "vCards Exported", "Exported employee contacts vCard file.")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-sky-500" />
                <span>Export All vCards</span>
              </button>

              <button
                onClick={() => addToast("info", "CSV Import", "Upload CSV template for employee import.")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <span>Bulk Import CSV</span>
              </button>

              <button
                onClick={() => setIsAddStaffOpen(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Employee User</span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search directory..."
                className="w-full pl-10 pr-4 py-2 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Departments</option>
                <option value="Hair Styling">Hair Styling</option>
                <option value="Esthetics & Spa">Esthetics & Spa</option>
                <option value="Nail Art">Nail Art</option>
                <option value="Management">Management</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="probation">Probation</option>
              </select>
            </div>
          </div>

          {/* Employee Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Employee</th>
                    <th className="py-3.5 px-4 font-semibold">Code</th>
                    <th className="py-3.5 px-4 font-semibold">Designation</th>
                    <th className="py-3.5 px-4 font-semibold">Department</th>
                    <th className="py-3.5 px-4 font-semibold">Email</th>
                    <th className="py-3.5 px-4 font-semibold">Reporting Manager</th>
                    <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                    <th className="py-3.5 px-4 font-semibold">Type</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp) => {
                    const initials = emp.name
                      ? emp.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 3)
                          .toUpperCase()
                      : "EMP";

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <span className="font-bold text-slate-900">{emp.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                          {emp.code || "EMP-0001"}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{emp.designation || "—"}</td>
                        <td className="py-3 px-4 text-slate-400">{emp.department ? emp.department : "—"}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{emp.email}</td>
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {emp.reportingManager || "Org Admin"}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {emp.joinDate || "29/08/2026"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {emp.employmentType || "Full-Time"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2 text-slate-400">
                            <button
                              title="Documents"
                              onClick={() => addToast("info", "Documents", `Viewing docs for ${emp.name}`)}
                              className="p-1 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-sky-500" />
                            </button>
                            <button
                              title="QR Code"
                              onClick={() => addToast("info", "Badge QR", `QR Code for ${emp.name}`)}
                              className="p-1 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5 text-sky-500" />
                            </button>
                            <button
                              title="Edit Employee"
                              onClick={() => addToast("info", "Edit Employee", `Editing ${emp.name}`)}
                              className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Delete Employee"
                              onClick={() => addToast("error", "Deleted", `${emp.name} removed from registry.`)}
                              className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DAILY ATTENDANCE PAGE (SCREENSHOT 1 REPLICA)                           */}
      {/* ========================================================================= */}
      {currentTab === "attendance" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Top Sub-Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveSubTab("daily_attendance")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeSubTab === "daily_attendance" || activeSubTab === "attendance"
                  ? "bg-[#7c3aed] text-white shadow-xs"
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-xs"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Daily Attendance</span>
            </button>

            <button
              onClick={() => {
                setActiveSubTab("biometric");
                addToast("info", "Biometric Sync", "Connecting to Salon Biometric devices...");
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeSubTab === "biometric"
                  ? "bg-[#7c3aed] text-white shadow-xs"
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-xs"
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5 text-slate-500" />
              <span>Biometric</span>
            </button>

            <button
              onClick={() => {
                setActiveSubTab("face_recognition");
                addToast("info", "Face Recognition", "AI Face camera stream ready.");
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeSubTab === "face_recognition"
                  ? "bg-[#7c3aed] text-white shadow-xs"
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-xs"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Face Recognition</span>
            </button>

            <button
              onClick={() => {
                setActiveSubTab("gps_attendance");
                addToast("info", "GPS Geo-Fence", "Salon branch geo-fence perimeter active.");
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeSubTab === "gps_attendance"
                  ? "bg-[#7c3aed] text-white shadow-xs"
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-xs"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>GPS Attendance</span>
            </button>

            <button
              onClick={() => {
                setActiveSubTab("shift_attendance");
                addToast("info", "Shift Attendance", "Displaying morning, evening and flexi shifts.");
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeSubTab === "shift_attendance"
                  ? "bg-[#7c3aed] text-white shadow-xs"
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-xs"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Shift Attendance</span>
            </button>

            <button
              onClick={() => {
                setActiveSubTab("attendance_corrections");
                addToast("info", "Attendance Corrections", "Pending staff correction requests.");
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeSubTab === "attendance_corrections"
                  ? "bg-[#7c3aed] text-white shadow-xs"
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-xs"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Attendance Corrections</span>
            </button>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Daily Attendance</h1>
              <p className="text-xs text-slate-500 mt-1 font-normal">
                Timesheets log summary, interactive calendar grid, manual administrative punches, and WFH tracking.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center rounded-full border border-slate-200 bg-white p-0.5 shadow-xs">
                <button
                  onClick={() => setAttendanceViewMode("table")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    attendanceViewMode === "table" ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                  <span>Table View</span>
                </button>
                <button
                  onClick={() => setAttendanceViewMode("calendar")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    attendanceViewMode === "calendar" ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Calendar View</span>
                </button>
              </div>

              <button
                onClick={() => setIsManualPunchOpen(true)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:opacity-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manual Punch / Mark Date</span>
              </button>

              <button
                onClick={() => addToast("success", "WFH Clock In", "WFH Clock In recorded at 09:00 AM.")}
                className="flex items-center gap-1 px-4 py-2 rounded-full border border-emerald-400 bg-white hover:bg-emerald-50 text-emerald-600 text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                <span>WFH Clock In</span>
              </button>

              <button
                onClick={() => addToast("info", "WFH Clock Out", "WFH Clock Out recorded at 06:00 PM.")}
                className="flex items-center gap-1 px-4 py-2 rounded-full border border-rose-400 bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                <span>WFH Clock Out</span>
              </button>
            </div>
          </div>

          {/* 5 Stat Cards (Dynamic & Matching Screenshot 1 Exact Colors) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Card 1: Green */}
            <div className="py-5 px-4 rounded-2xl bg-[#ecfdf5] border border-[#d1fae5] shadow-xs text-center space-y-1">
              <div className="text-3xl font-extrabold text-[#10b981]">
                {timesheetRecords.filter((r) => r.status === "Present").length}
              </div>
              <div className="text-[10px] font-bold text-[#065f46] uppercase tracking-wider">
                PRESENT TODAY
              </div>
            </div>

            {/* Card 2: Red/Pink */}
            <div className="py-5 px-4 rounded-2xl bg-[#fef2f2] border border-[#fee2e2] shadow-xs text-center space-y-1">
              <div className="text-3xl font-extrabold text-[#ef4444]">
                {timesheetRecords.filter((r) => r.status === "Absent").length}
              </div>
              <div className="text-[10px] font-bold text-[#991b1b] uppercase tracking-wider">
                ABSENT
              </div>
            </div>

            {/* Card 3: Purple */}
            <div className="py-5 px-4 rounded-2xl bg-[#faf5ff] border border-[#f3e8ff] shadow-xs text-center space-y-1">
              <div className="text-3xl font-extrabold text-[#a855f7]">
                {timesheetRecords.filter((r) => r.status === "On Leave").length}
              </div>
              <div className="text-[10px] font-bold text-[#6b21a8] uppercase tracking-wider">
                ON LEAVE
              </div>
            </div>

            {/* Card 4: Sky Blue */}
            <div className="py-5 px-4 rounded-2xl bg-[#f0f9ff] border border-[#e0f2fe] shadow-xs text-center space-y-1">
              <div className="text-3xl font-extrabold text-[#0284c7]">
                {timesheetRecords.length > 0
                  ? `${Math.round(
                      (timesheetRecords.filter((r) => r.status === "Present").length /
                        timesheetRecords.length) *
                        100
                    )}%`
                  : "0%"}
              </div>
              <div className="text-[10px] font-bold text-[#075985] uppercase tracking-wider">
                AVG ATTENDANCE
              </div>
            </div>

            {/* Card 5: Gray */}
            <div className="py-5 px-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] shadow-xs text-center space-y-1">
              <div className="text-3xl font-extrabold text-[#1e293b]">
                {employees.length}
              </div>
              <div className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                TOTAL PROFILES
              </div>
            </div>
          </div>

          {/* Conditional View: Table View vs Calendar View */}
          {attendanceViewMode === "table" ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#f8fafc] text-[#475569] text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/70">
                      <th className="py-3.5 px-6 font-semibold">EMPLOYEE</th>
                      <th className="py-3.5 px-6 font-semibold">CHECK IN</th>
                      <th className="py-3.5 px-6 font-semibold">CHECK OUT</th>
                      <th className="py-3.5 px-6 font-semibold">HOURS WORKED</th>
                      <th className="py-3.5 px-6 font-semibold">PUNCH METHOD</th>
                      <th className="py-3.5 px-6 font-semibold">STATUS</th>
                      <th className="py-3.5 px-6 font-semibold text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {timesheetRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-xs text-slate-400 font-medium">
                          No attendance records generated yet.
                        </td>
                      </tr>
                    ) : (
                      timesheetRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 font-bold text-xs flex items-center justify-center border border-purple-100 shrink-0">
                                {rec.empName.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{rec.empName}</span>
                                <span className="text-[10px] text-slate-400">{rec.role || rec.date}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-6 font-mono text-slate-700">{rec.checkIn}</td>
                          <td className="py-3.5 px-6 font-mono text-slate-700">{rec.checkOut}</td>
                          <td className="py-3.5 px-6 font-mono text-slate-700 font-semibold">{rec.hoursWorked}</td>
                          <td className="py-3.5 px-6">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-100 inline-block">
                              {rec.punchMethod}
                            </span>
                          </td>
                          <td className="py-3.5 px-6">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 ${
                                rec.status === "Present"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : rec.status === "Absent"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  rec.status === "Present"
                                    ? "bg-emerald-500"
                                    : rec.status === "Absent"
                                    ? "bg-rose-500"
                                    : "bg-amber-500"
                                }`}
                              ></span>
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setTimesheetRecords((prev) =>
                                    prev.map((t) =>
                                      t.id === rec.id
                                        ? { ...t, checkOut: "06:30 PM", hoursWorked: "8.5 hrs" }
                                        : t
                                    )
                                  );
                                  addToast("success", "Punch Out", `Clocked out ${rec.empName} at 06:30 PM.`);
                                }}
                                className="px-3 py-1 rounded-full text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 cursor-pointer transition-colors"
                              >
                                Punch Out
                              </button>
                              <button
                                onClick={() => {
                                  setTimesheetRecords(timesheetRecords.filter((t) => t.id !== rec.id));
                                  addToast("info", "Record Removed", `Removed ${rec.empName}'s timesheet.`);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-sm text-slate-900">September 2026 Attendance Grid</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Present (100%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Absent</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span> On Leave</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="font-bold text-slate-400 py-1 uppercase text-[10px]">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 30 }).map((_, i) => {
                  const dayNum = i + 1;
                  const isToday = dayNum === 5;
                  return (
                    <div
                      key={dayNum}
                      className={`p-2.5 rounded-xl border transition-all text-left min-h-[68px] flex flex-col justify-between ${
                        isToday
                          ? "bg-purple-50/60 border-purple-300 ring-1 ring-purple-400"
                          : "bg-slate-50/50 border-slate-200/70 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isToday ? "text-purple-700" : "text-slate-700"}`}>
                          {dayNum}
                        </span>
                        {isToday && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-600 text-white">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-semibold text-emerald-600">6 Present</span>
                        <span className="text-[9px] text-slate-400 font-mono">100%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LEAVE MANAGEMENT PAGE (SCREENSHOT 3)                                    */}
      {/* ========================================================================= */}
      {currentTab === "leave" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Management</h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage employee leave applications, approval workflows, and balance allocations.
              </p>
            </div>

            <button
              onClick={() => setIsAddLeaveOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Leave Application</span>
            </button>
          </div>

          {/* Leave Requests Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Employee</th>
                  <th className="py-3.5 px-4 font-semibold">Leave Category</th>
                  <th className="py-3.5 px-4 font-semibold">From Date</th>
                  <th className="py-3.5 px-4 font-semibold">To Date</th>
                  <th className="py-3.5 px-4 font-semibold">Days</th>
                  <th className="py-3.5 px-4 font-semibold">Reason</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((lv) => (
                  <tr key={lv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{lv.employeeName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 capitalize">
                        {lv.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{lv.startDate}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{lv.endDate}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">2</td>
                    <td className="py-3 px-4 text-slate-600 italic">&ldquo;{lv.reason}&rdquo;</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          lv.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : lv.status === "rejected"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {lv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {lv.status === "pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => updateLeaveStatus(lv.id, "approved")}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateLeaveStatus(lv.id, "rejected")}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SALARY STRUCTURE & PAYROLL PAGE (SCREENSHOT 4)                         */}
      {/* ========================================================================= */}
      {currentTab === "payroll" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Salary Structure</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-600" /> Auto-Statutory
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Automated salary components, statutory EPFO/ESIC rules, and take-home mapping.
              </p>
            </div>

            <button
              onClick={() => setIsMapSalaryOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Map Employee Salary</span>
            </button>
          </div>

          {/* Salary Table (Screenshot 4) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Employee</th>
                    <th className="py-3.5 px-4 font-semibold">Role</th>
                    <th className="py-3.5 px-4 font-semibold">Basic Salary</th>
                    <th className="py-3.5 px-4 font-semibold">HRA (40%)</th>
                    <th className="py-3.5 px-4 font-semibold">Allowances</th>
                    <th className="py-3.5 px-4 font-semibold text-rose-600">Statutory Ded.</th>
                    <th className="py-3.5 px-4 font-semibold text-emerald-600">Net Take-Home</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => {
                    const basic = emp.basicSalary || emp.salaryBase || 35000;
                    const hra = emp.hra || basic * 0.4;
                    const allowances = emp.allowances || 3500;
                    const statutory = emp.statutoryDed || basic * 0.12;
                    const net = emp.netTakeHome || basic + hra + allowances - statutory;

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{emp.name}</td>
                        <td className="py-3 px-4 text-slate-500">{emp.role || "Senior Stylist"}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          ₹{basic.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          ₹{hra.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          ₹{allowances.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-rose-600">
                          -₹{statutory.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600 text-sm">
                          ₹{net.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSalaryEmpId(emp.id);
                              handleBasicSalaryChange(basic.toString());
                              setIsMapSalaryOpen(true);
                            }}
                            className="p-1 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-sky-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE EMPLOYEE USER (Screenshot 1)                              */}
      {/* ========================================================================= */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Create Employee User</h3>
                  <p className="text-xs text-slate-400">Enroll new staff into salon directory</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="e.g. Phanikumar"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Employee Code</label>
                  <input
                    type="text"
                    value={empCode}
                    onChange={(e) => setEmpCode(e.target.value)}
                    placeholder="EMP-0006"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    placeholder="emp@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Role / Title</label>
                  <input
                    type="text"
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    placeholder="Art Director / Senior Stylist"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Department</label>
                  <select
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Hair Styling">Hair Styling</option>
                    <option value="Esthetics & Spa">Esthetics & Spa</option>
                    <option value="Nail Art">Nail Art</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Employment Type</label>
                  <select
                    value={empType}
                    onChange={(e) => setEmpType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Reporting Manager</label>
                  <input
                    type="text"
                    value={empReporting}
                    onChange={(e) => setEmpReporting(e.target.value)}
                    placeholder="Org Admin"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Basic Salary (₹)</label>
                  <input
                    type="number"
                    value={empSalary}
                    onChange={(e) => setEmpSalary(e.target.value)}
                    placeholder="35000"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RECORD LEAVE APPLICATION (SCREENSHOT 3 EXACT REPLICA)            */}
      {/* ========================================================================= */}
      {isAddLeaveOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-500" />
                <h3 className="font-bold text-base text-slate-900">Record Leave Application</h3>
              </div>
              <button
                onClick={() => setIsAddLeaveOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordLeave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">EMPLOYEE PROFILE *</label>
                <select
                  value={leaveEmpId}
                  onChange={(e) => setLeaveEmpId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-sky-500"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.code || "EMP"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">LEAVE CATEGORY</label>
                <select
                  value={leaveCategory}
                  onChange={(e) => setLeaveCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-sky-500"
                >
                  <option value="Annual">Annual</option>
                  <option value="Casual">Casual</option>
                  <option value="Sick">Sick</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">FROM DATE</label>
                  <input
                    type="date"
                    value={leaveFromDate}
                    onChange={(e) => setLeaveFromDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">TO DATE</label>
                  <input
                    type="date"
                    value={leaveToDate}
                    onChange={(e) => setLeaveToDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">DAYS REQUESTED</label>
                  <input
                    type="number"
                    value={leaveDaysReq}
                    onChange={(e) => setLeaveDaysReq(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">APPROVAL ACTION</label>
                  <select
                    value={leaveApprovalAction}
                    onChange={(e) => setLeaveApprovalAction(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-sky-500"
                  >
                    <option value="Auto-Approve Immediate">Auto-Approve Immediate</option>
                    <option value="Send for Approval">Send for Approval</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">REASON / JUSTIFICATION</label>
                <input
                  type="text"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="e.g. Medical emergency / Planned vacation"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddLeaveOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Record Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MANUAL TIMESHEET PUNCH / ADJUSTMENT (SCREENSHOT 2 REPLICA)       */}
      {/* ========================================================================= */}
      {isManualPunchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Manual Timesheet Punch / Adjustment
                </h3>
              </div>
              <button
                onClick={() => setIsManualPunchOpen(false)}
                className="w-7 h-7 rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePunch} className="space-y-4">
              {/* Choose Employee */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  CHOOSE EMPLOYEE PROFILE *
                </label>
                <select
                  value={punchEmpId}
                  onChange={(e) => setPunchEmpId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-700 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Timesheet Date & Attendance Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                    TIMESHEET DATE
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={punchDate}
                      onChange={(e) => setPunchDate(e.target.value)}
                      placeholder="05/09/2026"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono pr-9"
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                    ATTENDANCE STATUS
                  </label>
                  <select
                    value={punchStatus}
                    onChange={(e) => setPunchStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs text-slate-700 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Half Day">Half Day</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Late Arrival">Late Arrival</option>
                    <option value="WFH Remote">WFH Remote</option>
                  </select>
                </div>
              </div>

              {/* Check In Time & Check Out Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                    CHECK IN TIME
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={punchCheckIn}
                      onChange={(e) => setPunchCheckIn(e.target.value)}
                      placeholder="09:00 AM"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 pr-9"
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                    CHECK OUT TIME
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={punchCheckOut}
                      onChange={(e) => setPunchCheckOut(e.target.value)}
                      placeholder="06:00 PM"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 pr-9"
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Punch Method */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  PUNCH METHOD
                </label>
                <select
                  value={punchMethod}
                  onChange={(e) => setPunchMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-700 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
                >
                  <option value="Manual Entry (HR Verified)">Manual Entry (HR Verified)</option>
                  <option value="Biometric Device (Fingerprint)">Biometric Device (Fingerprint)</option>
                  <option value="Face Recognition Scan">Face Recognition Scan</option>
                  <option value="GPS Geo-Fenced Mobile">GPS Geo-Fenced Mobile</option>
                  <option value="WFH Web Portal">WFH Web Portal</option>
                </select>
              </div>

              {/* Administrative Notes / Reason */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  ADMINISTRATIVE NOTES / REASON
                </label>
                <input
                  type="text"
                  value={punchNotes}
                  onChange={(e) => setPunchNotes(e.target.value)}
                  placeholder="Direct administrative timesheet record"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualPunchOpen(false)}
                  className="px-6 py-2 rounded-full text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:opacity-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: MAP EMPLOYEE SALARY STRUCTURE (SCREENSHOT 5 EXACT REPLICA)       */}
      {/* ========================================================================= */}
      {isMapSalaryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900">Map Employee Salary Structure</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" /> AUTO-FORMULA
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter Basic Salary — all statutory allowances and deductions auto-calculate instantaneously.
                </p>
              </div>
              <button
                onClick={() => setIsMapSalaryOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSalaryStructure} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">CHOOSE EMPLOYEE *</label>
                <select
                  value={salaryEmpId}
                  onChange={(e) => setSalaryEmpId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-sky-500"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.code || "EMP-0001"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-sky-700">
                    BASIC SALARY * <span className="text-[10px] font-normal text-slate-400">(MASTER ENTRY)</span>
                  </label>
                  <input
                    type="number"
                    value={basicSalaryVal}
                    onChange={(e) => handleBasicSalaryChange(e.target.value)}
                    placeholder="5000"
                    className="w-full px-3 py-2 text-xs border-2 border-sky-400 rounded-xl font-mono font-bold text-slate-900 focus:outline-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">HRA ALLOWANCE (40%)</label>
                  <input
                    type="number"
                    value={hraVal}
                    onChange={(e) => setHraVal(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">OTHER ALLOWANCES (10%)</label>
                  <input
                    type="number"
                    value={otherAllowancesVal}
                    onChange={(e) => setOtherAllowancesVal(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">PF DEDUCTION (12% EPFO)</label>
                  <input
                    type="number"
                    value={pfDedVal}
                    onChange={(e) => setPfDedVal(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">ESI (0.75%)</label>
                  <input
                    type="number"
                    value={esiVal}
                    onChange={(e) => setEsiVal(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">TDS TAX</label>
                  <input
                    type="number"
                    value={tdsVal}
                    onChange={(e) => setTdsVal(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">OTHER DED.</label>
                  <input
                    type="number"
                    value={otherDedVal}
                    onChange={(e) => setOtherDedVal(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Live Compensation Breakdown Capsule (Screenshot 5) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Live Compensation Breakdown</span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Fully Synchronized
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">GROSS EARNINGS</div>
                    <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                      ₹{grossEarnings.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">TOTAL DEDUCTIONS</div>
                    <div className="text-base font-bold font-mono text-rose-600 mt-0.5">
                      -₹{totalDeductions.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                    <div className="text-[10px] uppercase font-bold text-emerald-700">NET TAKE-HOME</div>
                    <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
                      ₹{netTakeHome.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMapSalaryOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
