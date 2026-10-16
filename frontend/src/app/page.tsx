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
const GovernanceModule = lazy(() =>
  import("@/components/owner/GovernanceModule").then((m) => ({
    default: m.GovernanceModule,
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
          {/* 1. Customer / Client Role */}
          {activeRole === "customer" && (
            <>
              {activeSubTab === "booking" && <CustomerBookingView />}
              {activeSubTab === "services" && <CustomerServicesView />}
              {activeSubTab === "memberships" && <CustomerMembershipsView />}
              {activeSubTab === "wallet" && <CustomerWalletView />}
              {activeSubTab === "payment" && <CustomerPaymentView />}
              {activeSubTab === "invoices" && <CustomerInvoicesView />}
              {![
                "booking",
                "services",
                "memberships",
                "wallet",
                "payment",
                "invoices",
              ].includes(activeSubTab) && <CustomerBookingView />}
            </>
          )}

          {/* 2. Stylist / Staff Role */}
          {activeRole === "staff" && (
            <>
              {activeSubTab === "dashboard" && <StaffDashboardView />}
              {activeSubTab === "customers" && <OwnerCustomersView />}
              {activeSubTab === "services" && <OwnerServicesView />}
              {activeSubTab === "inventory" && <OwnerInventoryView />}
              {activeSubTab === "attendance" && <StaffAttendanceView />}
              {activeSubTab === "payrolls" && <StaffPayrollsView />}
              {![
                "dashboard",
                "customers",
                "services",
                "inventory",
                "attendance",
                "payrolls",
              ].includes(activeSubTab) && <StaffDashboardView />}
            </>
          )}

          {/* 3. Reception / Cashier Role */}
          {activeRole === "cashier" && (
            <>
              {activeSubTab === "dashboard" && <OwnerDashboardView />}
              {activeSubTab === "customers" && <OwnerCustomersView />}
              {["pos", "billing", "newsale"].includes(activeSubTab) && <OwnerPOSView />}
              {activeSubTab === "services" && <OwnerServicesView />}
              {activeSubTab === "inventory" && <OwnerInventoryView />}
              {![
                "dashboard",
                "customers",
                "pos",
                "billing",
                "newsale",
                "services",
                "inventory",
              ].includes(activeSubTab) && <OwnerDashboardView />}
            </>
          )}

          {/* 4. Accountant / Auditor Role */}
          {activeRole === "auditor" && (
            <>
              {activeSubTab === "dashboard" && <OwnerDashboardView />}
              {activeSubTab === "customers" && <OwnerCustomersView />}
              {["pos", "billing", "newsale"].includes(activeSubTab) && <OwnerPOSView />}
              {activeSubTab === "inventory" && <OwnerInventoryView />}
              {[
                "staff",
                "employees",
                "payroll",
                "salary_structure",
                "payroll_processing",
                "pf",
                "esi",
                "tds",
                "payslips",
                "payslip_studio",
              ].includes(activeSubTab) && <OwnerStaffView />}
              {activeSubTab === "payrolls" && <StaffPayrollsView />}
              {![
                "dashboard",
                "customers",
                "pos",
                "billing",
                "newsale",
                "inventory",
                "staff",
                "employees",
                "payroll",
                "payrolls",
                "salary_structure",
                "payroll_processing",
                "pf",
                "esi",
                "tds",
                "payslips",
                "payslip_studio",
              ].includes(activeSubTab) && <OwnerDashboardView />}
            </>
          )}

          {/* 5. Branch Manager Role */}
          {activeRole === "branch_manager" && (
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
                "commissions",
              ].includes(activeSubTab) && <OwnerStaffView />}
              {["pos", "billing", "newsale"].includes(activeSubTab) && <OwnerPOSView />}
              {activeSubTab === "services" && <OwnerServicesView />}
              {activeSubTab === "memberships" && <OwnerMembershipsView />}
              {activeSubTab === "inventory" && <OwnerInventoryView />}
              {["settings", "profile", "branches", "customizations", "mfa", "discounts", "governance", "data-hub", "integrations"].includes(activeSubTab) && (
                <OwnerSettingsView
                  initialTab={
                    (["profile", "branches", "customizations", "mfa", "discounts", "governance", "data-hub", "integrations"].includes(activeSubTab)
                      ? (activeSubTab as any)
                      : "branches")
                  }
                />
              )}
              {![
                "dashboard",
                "customers",
                "staff",
                "employees",
                "attendance",
                "leave",
                "leaves",
                "payroll",
                "pos",
                "billing",
                "newsale",
                "services",
                "memberships",
                "inventory",
                "settings",
                "profile",
                "branches",
                "customizations",
                "mfa",
                "discounts",
                "governance",
                "data-hub",
                "integrations",
              ].includes(activeSubTab) && <OwnerDashboardView />}
            </>
          )}

          {/* 6. Super Admin Role */}
          {(activeRole === "admin" || activeRole === "super_admin") && <SuperAdminView />}

          {/* 7. Owner & Director Roles (Full Master Suite) */}
          {(activeRole === "owner" || activeRole === "director") && (
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
              {["pos", "billing", "newsale"].includes(activeSubTab) && <OwnerPOSView />}
              {activeSubTab === "services" && <OwnerServicesView />}
              {activeSubTab === "memberships" && <OwnerMembershipsView />}
              {activeSubTab === "inventory" && <OwnerInventoryView />}
              {activeSubTab === "governance" && <OwnerSettingsView initialTab="governance" />}
              {["settings", "profile", "branches", "customizations", "mfa", "discounts", "data-hub", "integrations"].includes(activeSubTab) && (
                <OwnerSettingsView
                  initialTab={
                    (["profile", "branches", "customizations", "mfa", "discounts", "data-hub", "integrations"].includes(activeSubTab)
                      ? (activeSubTab as any)
                      : "profile")
                  }
                />
              )}
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
                "billing",
                "newsale",
                "services",
                "memberships",
                "inventory",
                "governance",
                "settings",
                "profile",
                "branches",
                "customizations",
                "mfa",
                "discounts",
                "data-hub",
                "integrations",
              ].includes(activeSubTab) && <OwnerDashboardView />}
            </>
          )}
        </Suspense>
      </div>
    </div>
  );
}
