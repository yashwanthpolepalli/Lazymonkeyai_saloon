"use client";

import React, { Suspense, lazy } from "react";
import { useSalon } from "@/context/SalonContext";

// Lazy-loaded Customer Role Views
const CustomerMembershipsView = lazy(() =>
  import("@/components/customer/CustomerMembershipsView").then((m) => ({
    default: m.CustomerMembershipsView,
  }))
);
const CustomerBookingView = lazy(() =>
  import("@/components/customer/CustomerBookingView").then((m) => ({
    default: m.CustomerBookingView,
  }))
);
const CustomerServicesView = lazy(() =>
  import("@/components/customer/CustomerServicesView").then((m) => ({
    default: m.CustomerServicesView,
  }))
);
const CustomerWalletView = lazy(() =>
  import("@/components/customer/CustomerWalletView").then((m) => ({
    default: m.CustomerWalletView,
  }))
);
const CustomerPaymentView = lazy(() =>
  import("@/components/customer/CustomerPaymentView").then((m) => ({
    default: m.CustomerPaymentView,
  }))
);
const CustomerInvoicesView = lazy(() =>
  import("@/components/customer/CustomerInvoicesView").then((m) => ({
    default: m.CustomerInvoicesView,
  }))
);

// Lazy-loaded Owner Role Views
const OwnerDashboardView = lazy(() =>
  import("@/components/owner/OwnerDashboardView").then((m) => ({
    default: m.OwnerDashboardView,
  }))
);
const OwnerCustomersView = lazy(() =>
  import("@/components/owner/OwnerCustomersView").then((m) => ({
    default: m.OwnerCustomersView,
  }))
);
const OwnerStaffView = lazy(() =>
  import("@/components/owner/OwnerStaffView").then((m) => ({
    default: m.OwnerStaffView,
  }))
);
const OwnerPOSView = lazy(() =>
  import("@/components/owner/OwnerPOSView").then((m) => ({
    default: m.OwnerPOSView,
  }))
);
const OwnerServicesView = lazy(() =>
  import("@/components/owner/OwnerServicesView").then((m) => ({
    default: m.OwnerServicesView,
  }))
);
const OwnerMembershipsView = lazy(() =>
  import("@/components/owner/OwnerMembershipsView").then((m) => ({
    default: m.OwnerMembershipsView,
  }))
);
const OwnerInventoryView = lazy(() =>
  import("@/components/owner/OwnerInventoryView").then((m) => ({
    default: m.OwnerInventoryView,
  }))
);
const OwnerSettingsView = lazy(() =>
  import("@/components/owner/OwnerSettingsView").then((m) => ({
    default: m.OwnerSettingsView,
  }))
);

// Lazy-loaded Staff Role Views
const StaffDashboardView = lazy(() =>
  import("@/components/staff/StaffDashboardView").then((m) => ({
    default: m.StaffDashboardView,
  }))
);
const StaffPayrollsView = lazy(() =>
  import("@/components/staff/StaffPayrollsView").then((m) => ({
    default: m.StaffPayrollsView,
  }))
);
const StaffAttendanceView = lazy(() =>
  import("@/components/staff/StaffAttendanceView").then((m) => ({
    default: m.StaffAttendanceView,
  }))
);

// Lazy-loaded Super Admin View
const SuperAdminView = lazy(() =>
  import("@/components/platform/SuperAdminView").then((m) => ({
    default: m.SuperAdminView,
  }))
);

function ViewFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
    </div>
  );
}

export default function Home() {
  const { activeRole, activeSubTab } = useSalon();

  return (
    <div className="bg-slate-50/50 min-h-[calc(100vh-120px)] py-8">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6">
        <Suspense fallback={<ViewFallback />}>
          {/* 1. Customer Role */}
          {activeRole === "customer" && (
            <>
              {activeSubTab === "memberships" && <CustomerMembershipsView />}
              {activeSubTab === "booking" && <CustomerBookingView />}
              {activeSubTab === "services" && <CustomerServicesView />}
              {activeSubTab === "wallet" && <CustomerWalletView />}
              {activeSubTab === "payment" && <CustomerPaymentView />}
              {activeSubTab === "invoices" && <CustomerInvoicesView />}
              {![
                "memberships",
                "booking",
                "services",
                "wallet",
                "payment",
                "invoices",
              ].includes(activeSubTab) && <CustomerMembershipsView />}
            </>
          )}

          {/* 2. Owner Role */}
          {activeRole === "owner" && (
            <>
              {activeSubTab === "dashboard" && <OwnerDashboardView />}
              {activeSubTab === "customers" && <OwnerCustomersView />}
              {[
                "staff",
                "employees",
                "attendance",
                "daily_attendance",
                "biometric",
                "face_recognition",
                "gps_attendance",
                "shift_attendance",
                "attendance_corrections",
                "leave",
                "leaves",
                "leave_requests",
                "leave_balances",
                "leave_policy",
                "holidays",
                "payroll",
                "salary_structure",
                "payroll_processing",
                "pf",
                "esi",
                "tds",
                "payslips",
                "payslip_studio",
                "loans",
                "advances",
                "bonuses",
                "commissions",
              ].includes(activeSubTab) && <OwnerStaffView />}
              {activeSubTab === "pos" && <OwnerPOSView />}
              {activeSubTab === "services" && <OwnerServicesView />}
              {activeSubTab === "memberships" && <OwnerMembershipsView />}
              {activeSubTab === "inventory" && <OwnerInventoryView />}
              {activeSubTab === "settings" && <OwnerSettingsView />}
              {![
                "dashboard",
                "customers",
                "staff",
                "employees",
                "attendance",
                "daily_attendance",
                "biometric",
                "face_recognition",
                "gps_attendance",
                "shift_attendance",
                "attendance_corrections",
                "leave",
                "leaves",
                "leave_requests",
                "leave_balances",
                "leave_policy",
                "holidays",
                "payroll",
                "salary_structure",
                "payroll_processing",
                "pf",
                "esi",
                "tds",
                "payslips",
                "payslip_studio",
                "loans",
                "advances",
                "bonuses",
                "commissions",
                "pos",
                "services",
                "memberships",
                "inventory",
                "settings",
              ].includes(activeSubTab) && <OwnerDashboardView />}
            </>
          )}

          {/* 3. Staff Role */}
          {activeRole === "staff" && (
            <>
              {activeSubTab === "dashboard" && <StaffDashboardView />}
              {activeSubTab === "payrolls" && <StaffPayrollsView />}
              {activeSubTab === "attendance" && <StaffAttendanceView />}
              {!["dashboard", "payrolls", "attendance"].includes(activeSubTab) && (
                <StaffDashboardView />
              )}
            </>
          )}

          {/* 4. Super Admin Role */}
          {activeRole === "admin" && <SuperAdminView />}
        </Suspense>
      </div>
    </div>
  );
}
