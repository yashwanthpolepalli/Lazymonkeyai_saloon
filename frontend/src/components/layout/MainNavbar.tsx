"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  Sparkles,
  MapPin,
  Calendar,
  ChevronDown,
  Scissors,
  Building2,
  Users,
  CreditCard,
  BarChart3,
  Crown,
  Wallet,
  Receipt,
  Clock,
  DollarSign,
  Tag,
  FileText,
  UserPlus,
  Package,
  LogOut,
  ShoppingBag,
  Settings,
  Globe,
  LifeBuoy,
  Cpu,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MainNavbarProps {
  onLogout?: () => void;
}

export function MainNavbar({ onLogout }: MainNavbarProps) {
  const {
    activeRole,
    currentUser,
    currentOrganization,
    organizations,
    setOrganization,
    policyConfig,
    selectedBranchId,
    setSelectedBranchId,
    selectedBranch,
    branches,
    activeSubTab,
    setActiveSubTab,
    cart,
    currentCustomer,
    currentStaff,
    ownerProfile,
    customizationSettings,
  } = useSalon();

  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  // Role Metadata
  const roleMeta = {
    customer: {
      title: "Customer & Beneficiary Portal",
      subtitle: "Booking, Entitlements & Wallet",
      badgeColor: "bg-pink-50 border-pink-200 text-pink-700",
      icon: <Sparkles className="w-4 h-4 text-pink-600" />,
      userTitle: currentUser?.name || currentCustomer.name,
      userSubtitle: `${currentCustomer.membershipTier || "Gold"} VIP Member`,
      avatarUrl: currentUser?.avatar || currentCustomer.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
    },
    owner: {
      title: `${currentOrganization.name} Suite`,
      subtitle: `${currentOrganization.business_type.replace("_", " ").toUpperCase()} MODEL`,
      badgeColor: "bg-emerald-50 border-emerald-200 text-emerald-800",
      icon: <Crown className="w-4 h-4 text-emerald-600" />,
      userTitle: currentUser?.name || ownerProfile?.name || "Salon Director",
      userSubtitle: `${currentOrganization.business_type.toUpperCase()} MANAGEMENT`,
      avatarUrl: currentUser?.avatar || ownerProfile?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
    },
    staff: {
      title: "Staff & Artisan Portal",
      subtitle: "Client Queue, Payrolls & Attendance",
      badgeColor: "bg-indigo-50 border-indigo-200 text-indigo-800",
      icon: <Scissors className="w-4 h-4 text-indigo-600" />,
      userTitle: currentUser?.name || currentStaff.name || "Aria Sharma",
      userSubtitle: `${currentStaff.tier?.toUpperCase() || "MASTER"} STYLIST`,
      avatarUrl: currentUser?.avatar || currentStaff.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80",
    },
    admin: {
      title: "Super Admin Console",
      subtitle: "Global Multi-Tenant Platform",
      badgeColor: "bg-purple-50 border-purple-200 text-purple-800",
      icon: <Building2 className="w-4 h-4 text-purple-600" />,
      userTitle: currentUser?.name || "Platform Super Admin",
      userSubtitle: "Global Platform Oversight",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80",
    },
    auditor: {
      title: "Governance & Audit Desk",
      subtitle: "Compliance & Trail Verification",
      badgeColor: "bg-indigo-50 border-indigo-200 text-indigo-800",
      icon: <ShieldCheck className="w-4 h-4 text-indigo-600" />,
      userTitle: currentUser?.name || "Compliance Auditor",
      userSubtitle: "Regulatory Compliance",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
    },
    director: {
      title: `${currentOrganization.name} Director`,
      subtitle: "Enterprise Strategy & Operations",
      badgeColor: "bg-amber-50 border-amber-200 text-amber-800",
      icon: <Crown className="w-4 h-4 text-amber-600" />,
      userTitle: currentUser?.name || "Executive Director",
      userSubtitle: "Executive Management",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
    },
    branch_manager: {
      title: "Branch Manager Portal",
      subtitle: "Facility Daily Operations",
      badgeColor: "bg-blue-50 border-blue-200 text-blue-800",
      icon: <Users className="w-4 h-4 text-blue-600" />,
      userTitle: currentUser?.name || "Branch Lead",
      userSubtitle: "Facility Management",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80",
    },
    cashier: {
      title: "Front Desk & POS Cashier",
      subtitle: "Fast Billing & Checkout",
      badgeColor: "bg-teal-50 border-teal-200 text-teal-800",
      icon: <CreditCard className="w-4 h-4 text-teal-600" />,
      userTitle: currentUser?.name || "Front Desk Cashier",
      userSubtitle: "Billing & Reception",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
    },
  }[activeRole] || {
    title: "Salon Portal",
    subtitle: "Salon Operating System",
    badgeColor: "bg-slate-50 border-slate-200 text-slate-800",
    icon: <Sparkles className="w-4 h-4 text-slate-600" />,
    userTitle: currentUser?.name || "User",
    userSubtitle: "Staff",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
  };

  // Role-Specific Horizontal Sub-Navigation Tabs with Multi-color Badge Icons
  const customerTabs = [
    { id: "memberships", label: "Memberships & Quota", icon: <Crown className="w-4 h-4 text-amber-600" />, bg: "bg-amber-100 text-amber-700" },
    { id: "booking", label: "Book Appointment", icon: <Calendar className="w-4 h-4 text-sky-600" />, bg: "bg-sky-100 text-sky-700" },
    { id: "services", label: "Services Catalog", icon: <Scissors className="w-4 h-4 text-violet-600" />, bg: "bg-violet-100 text-violet-700" },
    { id: "wallet", label: "Wallet & Rewards", icon: <Wallet className="w-4 h-4 text-emerald-600" />, bg: "bg-emerald-100 text-emerald-700" },
    { id: "payment", label: "Payment & Checkout", icon: <CreditCard className="w-4 h-4 text-indigo-600" />, bg: "bg-indigo-100 text-indigo-700" },
    { id: "invoices", label: "Invoices & Receipts", icon: <FileText className="w-4 h-4 text-teal-600" />, bg: "bg-teal-100 text-teal-700" },
  ];

  const ownerTabs = [
    { id: "dashboard", label: "Executive Dashboard", icon: <BarChart3 className="w-4 h-4 text-blue-600" />, bg: "bg-blue-100 text-blue-700" },
    { id: "customers", label: "CRM & Beneficiaries", icon: <UserPlus className="w-4 h-4 text-rose-600" />, bg: "bg-rose-100 text-rose-700" },
    { id: "staff", label: "Staff & Payroll", icon: <Scissors className="w-4 h-4 text-purple-600" />, bg: "bg-purple-100 text-purple-700" },
    { id: "pos", label: "Payments & Billings", icon: <Receipt className="w-4 h-4 text-emerald-600" />, bg: "bg-emerald-100 text-emerald-700" },
    { id: "services", label: "Services Menu", icon: <Tag className="w-4 h-4 text-pink-600" />, bg: "bg-pink-100 text-pink-700" },
    { id: "memberships", label: "Memberships & Plans", icon: <Crown className="w-4 h-4 text-amber-600" />, bg: "bg-amber-100 text-amber-700" },
    { id: "inventory", label: "Inventory Stock", icon: <Package className="w-4 h-4 text-orange-600" />, bg: "bg-orange-100 text-orange-700" },
    { id: "governance", label: "Governance & Policies", icon: <ShieldCheck className="w-4 h-4 text-indigo-600" />, bg: "bg-indigo-100 text-indigo-700" },
    { id: "settings", label: "Settings & System", icon: <Settings className="w-4 h-4 text-sky-600" />, bg: "bg-sky-100 text-sky-700" },
  ];

  const staffTabs = [
    { id: "dashboard", label: "My Chair & Queue", icon: <Scissors className="w-4 h-4 text-sky-600" />, bg: "bg-sky-100 text-sky-700" },
    { id: "payrolls", label: "Payrolls & Salary Slips", icon: <DollarSign className="w-4 h-4 text-emerald-600" />, bg: "bg-emerald-100 text-emerald-700" },
    { id: "attendance", label: "Attendance & Clock In", icon: <Clock className="w-4 h-4 text-indigo-600" />, bg: "bg-indigo-100 text-indigo-700" },
  ];

  const adminTabs = [
    { id: "dashboard", label: "Platform Overview", icon: <Globe className="w-4 h-4 text-purple-600" />, bg: "bg-purple-100 text-purple-700" },
    { id: "organizations", label: "Organizations & Hierarchy", icon: <Building2 className="w-4 h-4 text-indigo-600" />, bg: "bg-indigo-100 text-indigo-700" },
    { id: "finance", label: "Finance & Subscriptions", icon: <CreditCard className="w-4 h-4 text-emerald-600" />, bg: "bg-emerald-100 text-emerald-700" },
    { id: "analytics", label: "Platform Analytics", icon: <BarChart3 className="w-4 h-4 text-sky-600" />, bg: "bg-sky-100 text-sky-700" },
    { id: "catalog", label: "Master Catalog", icon: <Scissors className="w-4 h-4 text-pink-600" />, bg: "bg-pink-100 text-pink-700" },
    { id: "ai", label: "AI Intelligence Hub", icon: <Sparkles className="w-4 h-4 text-amber-600" />, bg: "bg-amber-100 text-amber-700" },
    { id: "support", label: "Support Ticket Desk", icon: <LifeBuoy className="w-4 h-4 text-rose-600" />, bg: "bg-rose-100 text-rose-700" },
    { id: "system", label: "System, Settings & APIs", icon: <Settings className="w-4 h-4 text-slate-700" />, bg: "bg-slate-200 text-slate-800" },
  ];

  const currentTabs =
    activeRole === "customer"
      ? customerTabs
      : activeRole === "staff"
      ? staffTabs
      : activeRole === "admin"
      ? adminTabs
      : ownerTabs;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      {/* Top Header Row */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 border-b border-slate-100">
        {/* Left: Brand Logo & Salon Name */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 text-left">
            {customizationSettings?.logoUrl ? (
              <img
                src={customizationSettings.logoUrl}
                alt={customizationSettings.salonName}
                className="w-9 h-9 rounded-xl object-cover border border-amber-300/60 shadow-xs"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-rose-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-xs font-sans">
                {customizationSettings?.monogram || "LM"}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5 font-sans">
                {customizationSettings?.salonName || "LAZYMONKEY AI"}
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono truncate max-w-[240px]">
                {customizationSettings?.tagline || "LUXE SALON OPERATING SYSTEM"}
              </span>
            </div>
          </div>
          <div className="hidden xl:block h-6 w-px bg-slate-200 mx-1" />

          {/* Organization Selector Dropdown */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200 text-indigo-900 text-xs font-semibold transition-all cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="truncate max-w-[140px] font-bold">{currentOrganization.name}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-200/60 text-indigo-950 uppercase font-extrabold">
                {currentOrganization.business_type.replace("_", " ")}
              </span>
              <ChevronDown className="w-3 h-3 text-indigo-400" />
            </button>

            {isOrgDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setIsOrgDropdownOpen(false)}
              >
                <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Switch Active Organization Profile
                </div>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      setOrganization(org);
                      setIsOrgDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left p-2.5 rounded-xl flex items-start justify-between transition-colors cursor-pointer",
                      org.id === currentOrganization.id
                        ? "bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold"
                        : "hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{org.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{org.brand_tagline}</div>
                    </div>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                      {org.business_type.replace("_", " ")}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Branch Selector Dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span className="truncate max-w-[140px]">{selectedBranch.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                {selectedBranch.code}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isBranchDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setIsBranchDropdownOpen(false)}
              >
                <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Select Active Salon Branch
                </div>
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBranchId(b.id);
                      setIsBranchDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left p-2.5 rounded-xl flex items-start justify-between transition-colors cursor-pointer",
                      b.id === selectedBranchId
                        ? "bg-amber-50 border border-amber-200 text-amber-900"
                        : "hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{b.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{b.city}, {b.country}</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500">{b.currency}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Current Portal Badge */}
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-2xl border shadow-xs transition-all bg-slate-50/90 border-slate-200">
          <div className="p-1 rounded-lg bg-white shadow-xs border border-slate-200/80">
            {roleMeta.icon}
          </div>
          <div className="text-left">
            <div className="text-xs font-extrabold text-slate-900 leading-tight">
              {roleMeta.title}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {roleMeta.subtitle}
            </div>
          </div>
        </div>

        {/* Right Section: Role User Details & Sign Out Button */}
        <div className="flex items-center gap-3">
          {/* Quick Wallet for Customer */}
          {activeRole === "customer" && (
            <button
              onClick={() => setActiveSubTab("wallet")}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              <span>₹{(currentCustomer.walletBalance || 4250).toLocaleString()}</span>
            </button>
          )}

          {/* Cart Icon for Customer & POS */}
          {(activeRole === "customer" || activeRole === "owner") && (
            <button
              onClick={() =>
                setActiveSubTab(activeRole === "customer" ? "payment" : "pos")
              }
              className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-slate-700" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {cart.length}
                </span>
              )}
            </button>
          )}

          {/* User Profile Card */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <img
              src={roleMeta.avatarUrl}
              alt={roleMeta.userTitle}
              className="w-8 h-8 rounded-full object-cover border border-amber-300/60 shadow-xs"
            />
            <div className="hidden sm:block text-left">
              <div className="font-bold text-xs text-slate-900 leading-tight">
                {roleMeta.userTitle}
              </div>
              <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                {roleMeta.userSubtitle}
              </div>
            </div>
          </div>

          {/* Sign Out / Switch Account Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out & Return to Login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all cursor-pointer shadow-xs ml-1"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Sub-Navigation Tabs Bar (Pure White with Multi-color Badge Icons) */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5">
          {currentTabs.map((tab) => {
            const isStaffActive =
              tab.id === "staff" &&
              [
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
              ].includes(activeSubTab);

            const isSettingsActive =
              tab.id === "settings" &&
              ["settings", "profile", "branches", "customizations", "mfa"].includes(activeSubTab);

            const isActive = isStaffActive || isSettingsActive || activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "staff") {
                    setActiveSubTab("employees");
                  } else {
                    setActiveSubTab(tab.id);
                  }
                }}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border",
                  isActive
                    ? "bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/20 scale-[1.02]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
                )}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? "bg-white/20 text-white" : tab.bg
                  }`}
                >
                  {tab.icon}
                </div>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
