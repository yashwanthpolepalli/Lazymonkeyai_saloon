"use client";

import React from "react";
import { useSalon, OwnerModule } from "@/context/SalonContext";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Users,
  UserPlus,
  Clock,
  CalendarDays,
  CalendarCheck,
  FileSpreadsheet,
  Building,
  Award,
  PlusCircle,
  History,
  Receipt,
  RotateCcw,
  Tag,
  Kanban,
  Target,
  Crown,
  Package,
  Wallet,
  Coins,
  Armchair,
  Scissors,
  ListOrdered,
  AlertTriangle,
  ShoppingCart,
  Layers,
  ArrowLeftRight,
  Trash2,
  Megaphone,
  MessageSquare,
  Image as ImageIcon,
  UserCheck,
  TrendingUp,
  DollarSign,
  ReceiptText,
  CreditCard,
  PieChart,
  BarChart2,
  GitCompare,
  Star,
  Inbox,
  LifeBuoy,
  MessageCircleQuestion,
  Bot,
  Percent,
  Sliders,
  Shield,
  FileCode,
  ToggleLeft,
  Settings,
} from "lucide-react";

interface SubTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export function ContextNav() {
  const { activeRole, activeModule, activeSubTab, setActiveSubTab } = useSalon();

  if (activeRole !== "owner") {
    return null;
  }

  const moduleSubTabs: Record<OwnerModule, SubTabItem[]> = {
    workspace: [
      { id: "overview", label: "Executive Dashboard", icon: <TrendingUp className="w-3.5 h-3.5" /> },
      { id: "chairs", label: "Live Floor & Chairs", icon: <Armchair className="w-3.5 h-3.5" /> },
      { id: "today_schedule", label: "Today's Schedule", icon: <Clock className="w-3.5 h-3.5" /> },
      { id: "quick_actions", label: "Quick Actions", icon: <Sparkles className="w-3.5 h-3.5" /> },
    ],
    operations: [
      { id: "calendar", label: "Interactive Calendar", icon: <CalendarDays className="w-3.5 h-3.5" /> },
      { id: "bookings", label: "Appointments Queue", icon: <CalendarCheck className="w-3.5 h-3.5" /> },
      { id: "walkins", label: "Walk-ins & Waitlist", icon: <ListOrdered className="w-3.5 h-3.5" /> },
      { id: "catalog", label: "Service Catalog & Inventory Mapping", icon: <Scissors className="w-3.5 h-3.5" /> },
    ],
    pos: [
      { id: "newsale", label: "New Sale Cashier", icon: <PlusCircle className="w-3.5 h-3.5" /> },
      { id: "saleshistory", label: "Sales History", icon: <History className="w-3.5 h-3.5" /> },
      { id: "invoices", label: "Invoices & Receipts", icon: <Receipt className="w-3.5 h-3.5" /> },
      { id: "returns", label: "Returns & Refunds", icon: <RotateCcw className="w-3.5 h-3.5" /> },
      { id: "discounts", label: "Discounts & Coupons", icon: <Tag className="w-3.5 h-3.5" /> },
    ],
    crm: [
      { id: "customers", label: "Customer 360", icon: <Users className="w-3.5 h-3.5" /> },
      { id: "pipeline", label: "Leads & Deals Pipeline", icon: <Kanban className="w-3.5 h-3.5" /> },
      { id: "opportunities", label: "Opportunities", icon: <Target className="w-3.5 h-3.5" /> },
      { id: "memberships", label: "VIP Memberships", icon: <Crown className="w-3.5 h-3.5" /> },
      { id: "packages", label: "Service Packages", icon: <Package className="w-3.5 h-3.5" /> },
      { id: "wallet_loyalty", label: "Wallet & Loyalty", icon: <Wallet className="w-3.5 h-3.5" /> },
    ],
    hrms: [
      { id: "employees", label: "Employees", icon: <Users className="w-3.5 h-3.5" /> },
      { id: "onboarding", label: "Onboarding", icon: <UserPlus className="w-3.5 h-3.5" /> },
      { id: "attendance", label: "Attendance", icon: <Clock className="w-3.5 h-3.5" /> },
      { id: "shifts", label: "Shifts & Schedule", icon: <CalendarDays className="w-3.5 h-3.5" /> },
      { id: "leave", label: "Leave Requests", icon: <CalendarCheck className="w-3.5 h-3.5" /> },
      { id: "payroll", label: "Payroll & Commission", icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
      { id: "departments", label: "Departments", icon: <Building className="w-3.5 h-3.5" /> },
      { id: "performance", label: "Performance", icon: <Award className="w-3.5 h-3.5" /> },
    ],
    inventory: [
      { id: "stock", label: "Stock Overview", icon: <Package className="w-3.5 h-3.5" /> },
      { id: "low_stock", label: "Low Stock Alerts", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
      { id: "purchase_orders", label: "Purchase Orders", icon: <ShoppingCart className="w-3.5 h-3.5" /> },
      { id: "consumption", label: "Service Consumption", icon: <Layers className="w-3.5 h-3.5" /> },
      { id: "transfers", label: "Branch Transfers", icon: <ArrowLeftRight className="w-3.5 h-3.5" /> },
      { id: "wastage", label: "Wastage & Adjustments", icon: <Trash2 className="w-3.5 h-3.5" /> },
    ],
    marketing: [
      { id: "campaigns", label: "Campaigns", icon: <Megaphone className="w-3.5 h-3.5" /> },
      { id: "whatsapp_sms", label: "WhatsApp & SMS Automation", icon: <MessageSquare className="w-3.5 h-3.5" /> },
      { id: "ai_posters", label: "AI Ad Posters", icon: <ImageIcon className="w-3.5 h-3.5" /> },
      { id: "coupons", label: "Coupons & Offers", icon: <Tag className="w-3.5 h-3.5" /> },
      { id: "segments", label: "Audience Segments", icon: <UserCheck className="w-3.5 h-3.5" /> },
    ],
    finance: [
      { id: "revenue", label: "Revenue & P&L", icon: <DollarSign className="w-3.5 h-3.5" /> },
      { id: "expenses", label: "Expenses", icon: <ReceiptText className="w-3.5 h-3.5" /> },
      { id: "gst_tax", label: "GST & Tax Reports", icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
      { id: "payments", label: "Payment Gateways", icon: <CreditCard className="w-3.5 h-3.5" /> },
      { id: "reconciliation", label: "Reconciliation", icon: <PieChart className="w-3.5 h-3.5" /> },
    ],
    analytics: [
      { id: "business", label: "Business Summary", icon: <BarChart2 className="w-3.5 h-3.5" /> },
      { id: "branches", label: "Branch Comparison", icon: <GitCompare className="w-3.5 h-3.5" /> },
      { id: "stylists", label: "Stylist Leaderboard", icon: <Star className="w-3.5 h-3.5" /> },
      { id: "services", label: "Services Matrix", icon: <Scissors className="w-3.5 h-3.5" /> },
      { id: "customers", label: "Retention & RFM", icon: <Users className="w-3.5 h-3.5" /> },
    ],
    "customer-service": [
      { id: "inbox", label: "Unified Tickets Desk", icon: <Inbox className="w-3.5 h-3.5" /> },
      { id: "escalations", label: "Critical Escalations", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
      { id: "feedback", label: "Customer Reviews & NPS", icon: <Star className="w-3.5 h-3.5" /> },
      { id: "knowledge_base", label: "Knowledge Base", icon: <MessageCircleQuestion className="w-3.5 h-3.5" /> },
    ],
    ai: [
      { id: "styling_ai", label: "AI Hair & Skin Stylist", icon: <Bot className="w-3.5 h-3.5" /> },
      { id: "pricing_ai", label: "Dynamic Pricing Engine", icon: <Percent className="w-3.5 h-3.5" /> },
      { id: "scheduler_ai", label: "Smart Schedule Balancer", icon: <Sliders className="w-3.5 h-3.5" /> },
    ],
    system: [
      { id: "branches_config", label: "Branches & Chairs", icon: <Building className="w-3.5 h-3.5" /> },
      { id: "roles", label: "Roles & Permissions", icon: <Shield className="w-3.5 h-3.5" /> },
      { id: "audit_logs", label: "Audit Logs", icon: <FileCode className="w-3.5 h-3.5" /> },
      { id: "feature_flags", label: "Feature Flags", icon: <ToggleLeft className="w-3.5 h-3.5" /> },
    ],
  };

  const tabs = moduleSubTabs[activeModule] || [];

  return (
    <div className="bg-stone-900 border-b border-stone-800 px-4 sm:px-6 shadow-xs">
      <div className="max-w-[1720px] mx-auto overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 py-1.5 min-w-max">
          {tabs.map((tab) => {
            const isSelected = activeSubTab === tab.id || (activeSubTab === "overview" && tab.id === tabs[0].id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                  isSelected
                    ? "bg-amber-500/20 text-amber-200 border border-amber-500/40 font-semibold"
                    : "text-stone-400 hover:text-stone-200 hover:bg-stone-800"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
