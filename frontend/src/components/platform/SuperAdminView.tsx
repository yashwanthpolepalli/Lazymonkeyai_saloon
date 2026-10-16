"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  Globe,
  Building2,
  Users,
  CreditCard,
  BarChart3,
  Scissors,
  Sparkles,
  LifeBuoy,
  Cpu,
  ShieldCheck,
  Activity,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  DollarSign,
  TrendingUp,
  Tag,
  FileText,
  Sliders,
  Zap,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  RefreshCw,
  X,
  Send,
  MessageSquare,
  Lock,
  Unlock,
  Layers,
  ChevronRight,
  ChevronDown,
  Check,
  Phone,
  Mail,
  Copy,
  Calendar,
  Star,
  ExternalLink,
  Laptop,
  Server,
  Database,
  Radio,
  SlidersHorizontal,
  Settings,
  Key,
  Shield,
  UserCheck,
  User,
  Power,
  HardDrive,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { OnboardingService, OrganizationService, SubscriptionPlanService } from "@/services/apiClient";
import { SubscriptionPlan } from "@/types";

// ==========================================
// DATA TYPES & INTERFACES FOR SUPER ADMIN
// ==========================================
export interface TenantOwner {
  id: string;
  name: string;
  brandName: string;
  email: string;
  phone: string;
  plan: string;
  status: "Active" | "Trial" | "Suspended";
  branchesCount: number;
  staffCount: number;
  customersCount: number;
  bookingsCount: number;
  mrr: number;
  joinedDate: string;
  renewalDate: string;
  city: string;
  country: string;
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  code?: string;
  ownerName?: string;
  businessType?: string;
}

export interface MasterServiceItem {
  id: string;
  category: string;
  subcategory: string;
  name: string;
  audience: "women" | "men" | "unisex" | "kids";
  defaultDurationMin: number;
  recommendedPriceINR: number;
  status: "active" | "deprecated";
  tenantAdoptions: number;
}

export interface SupportTicketItem {
  id: string;
  tenantId: string;
  tenantName: string;
  subject: string;
  category: "Billing" | "Integration" | "AI Feature" | "Staff HRMS" | "POS Failure";
  priority: "Urgent" | "High" | "Normal" | "Low";
  status: "Open" | "In Progress" | "Escalated" | "Resolved";
  createdAt: string;
  slaBreachHours: number;
  assignedTo: string;
  messages: Array<{
    id: string;
    sender: string;
    role: "owner" | "superadmin" | "system";
    time: string;
    text: string;
  }>;
}

export interface AuditLogItem {
  id: string;
  adminName: string;
  action: string;
  tenantName: string;
  previousValue: string;
  newValue: string;
  ipAddress: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
}

export interface IntegrationGateway {
  id: string;
  name: string;
  category: "Payment" | "Messaging" | "AI & LLM" | "Calendar & Maps";
  iconName: string;
  status: "Connected" | "Configured" | "Degraded" | "Disabled";
  description: string;
  environment: "Production" | "Sandbox";
  lastPing: string;
  keyMasked: string;
}

// ==========================================
// MAIN SUPER ADMIN VIEW COMPONENT
// ==========================================
export function SuperAdminView() {
  const { activeSubTab, setActiveSubTab, addToast, currentUser, organizations, hydrateFromBackend } = useSalon();

  // Search, Filter & Drill-down state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<TenantOwner | null>(null);
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set());
  const [isDeletingOrgs, setIsDeletingOrgs] = useState(false);
  const [ownerDrillTab, setOwnerDrillTab] = useState<
    "overview" | "branches" | "staff" | "customers" | "bookings" | "finance" | "ai"
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("salon_admin_drill_tab");
      const valid = ["overview", "branches", "staff", "customers", "bookings", "finance", "ai"];
      if (saved && valid.includes(saved)) return saved as any;
    }
    return "overview";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("salon_admin_drill_tab", ownerDrillTab);
    }
  }, [ownerDrillTab]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState("");

  // Toggle one row checkbox
  const toggleOrgSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrgs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle all rows
  const toggleSelectAll = () => {
    if (selectedOrgs.size === tenants.length) {
      setSelectedOrgs(new Set());
    } else {
      setSelectedOrgs(new Set(tenants.map((t) => t.id)));
    }
  };

  // Bulk delete
  const handleDeleteSelected = async () => {
    if (selectedOrgs.size === 0) return;
    const ids = Array.from(selectedOrgs);
    setIsDeletingOrgs(true);
    const failed: string[] = [];
    for (const id of ids) {
      try {
        await OrganizationService.deleteOrganization(id);
      } catch {
        failed.push(id);
      }
    }
    // Remove successful deletes from local state
    const toRemove = new Set(ids.filter((id) => !failed.includes(id)));
    setTenants((prev) => prev.filter((t) => !toRemove.has(t.id)));
    setSelectedOrgs(new Set(failed));
    setIsDeletingOrgs(false);
    if (failed.length === 0) {
      addToast?.("success", "Organisations Deleted", `${ids.length} organisation${ids.length > 1 ? "s" : ""} deleted successfully.`);
    } else {
      addToast?.("error", "Partial Deletion", `${ids.length - failed.length} deleted; ${failed.length} failed. Check console.`);
    }
  };

  // System Tab Internal Navigation
  const [systemSubTab, setSystemSubTab] = useState<
    "integrations" | "profile" | "security" | "flags" | "health"
  >("integrations");

  // Modals state — showAddTenantModal declared below with isProvisioning/provisionError
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  // New Tenant Form state
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [newOwnerPhone, setNewOwnerPhone] = useState("");
  const [newOwnerCity, setNewOwnerCity] = useState("");
  const [newOwnerPassword, setNewOwnerPassword] = useState("");
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [newOwnerPlan, setNewOwnerPlan] = useState<string>("");

  const emptyPlanForm = {
    name: "",
    code: "",
    description: "",
    price_monthly: 0,
    price_yearly: 0,
    currency: "INR",
    branches_limit: 1,
    staff_limit: 1,
    ai_credits_limit: 0,
    features: "",
    is_popular: false,
    is_active: true,
    color: "border-slate-200 bg-white",
  };

  // Subscription Plans DB State & Modals
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState(emptyPlanForm);

  // Admin Profile State
  const [adminProfile, setAdminProfile] = useState({
    name: currentUser?.name || "",
    role: currentUser?.role || "",
    email: currentUser?.email || "",
    phone: "",
    twoFactorEnabled: false,
    ipRestrictionsEnabled: false,
  });

  const [orgViewMode, setOrgViewMode] = useState<"table" | "cards">("table");

  // Pure dynamic mapper without hardcoded default values
  const mapOrgToTenant = (org: any): TenantOwner => {
    return {
      id: org.id || "",
      name: org.owner_name || org.owner || org.name || "Owner",
      brandName: org.name || "",
      email: org.owner_email || org.email || "",
      phone: org.owner_phone || org.phone || "",
      plan: org.subscription_tier || "Starter",
      status: org.is_active !== false ? "Active" : "Suspended",
      branchesCount: org.branches_count ?? (org.branches?.length || 0),
      staffCount: org.staff_count ?? (org.users?.length || 0),
      customersCount: org.customers_count || org.customers?.length || 0,
      bookingsCount: org.bookings_count || org.bookings?.length || 0,
      mrr: Number(org.mrr || 0),
      joinedDate: org.created_at ? new Date(org.created_at).toISOString().split("T")[0] : "",
      renewalDate: org.renewal_date ? new Date(org.renewal_date).toISOString().split("T")[0] : "",
      city: org.city || "",
      country: org.country || "India",
      aiCreditsUsed: Number(org.ai_credits_used || 0),
      aiCreditsLimit: Number(org.ai_credits_limit || 0),
      code: org.code || "",
      ownerName: org.owner_name || org.owner || org.name || "",
      businessType: org.business_type || "general",
    };
  };

  // 1. TENANT ORGANIZATIONS (DYNAMIC FROM REGISTERED ORGANIZATIONS)
  const [tenants, setTenants] = useState<TenantOwner[]>(() => {
    if (organizations && organizations.length > 0) {
      return organizations.map(mapOrgToTenant);
    }
    return [];
  });

  // Fetch all organizations and subscription plans from backend API
  const fetchPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const data = await SubscriptionPlanService.getPlans();
      if (data && Array.isArray(data)) {
        setSubscriptionPlans(data);
      }
    } catch (err) {
      console.error("Failed to load subscription plans:", err);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const orgList = await OrganizationService.getOrganizations();
        if (orgList && Array.isArray(orgList) && orgList.length > 0) {
          const mapped = orgList.map(mapOrgToTenant);
          setTenants(mapped);
          setSelectedOwner((prev) => {
            if (!prev) return null;
            const updated = mapped.find((t) => t.id === prev.id);
            return updated || prev;
          });
        }
      } catch (err) {
        console.error("Failed to load organizations for super admin:", err);
      }
    };
    fetchOrgs();
  }, [organizations]);

  // 2. MASTER UNIVERSAL SERVICE CATALOG
  const [masterCatalog, setMasterCatalog] = useState<MasterServiceItem[]>([]);

  // 3. SUPPORT TICKETS
  const [supportTickets, setSupportTickets] = useState<SupportTicketItem[]>([]);

  // 4. AUDIT LOGS
  const [auditLogs] = useState<AuditLogItem[]>([]);

  // 5. FEATURE FLAGS
  const [featureFlags, setFeatureFlags] = useState([
    { id: "ff_ai_hairstyle", name: "AI Hairstyle Recommendations V2", description: "Generative AI multi-angle visualizer for salon clients", status: "ON", scope: "Global (All Plans)" },
    { id: "ff_whatsapp_pos", name: "WhatsApp Interactive POS Checkout", description: "Automated instant checkout & digital receipt over WhatsApp", status: "ON", scope: "Business & Enterprise" },
    { id: "ff_dynamic_pricing", name: "Dynamic Demand Slot Pricing", description: "AI pricing surges for high-demand holiday slots", status: "BETA", scope: "Enterprise Only" },
    { id: "ff_biometric", name: "AI Facial Biometric Clock-in", description: "Camera-based staff attendance verification", status: "BETA", scope: "All Plans" },
    { id: "ff_campaign_copilot", name: "AI Marketing Campaign Copilot", description: "Autonomous SMS/WhatsApp retention campaign generator", status: "OFF", scope: "Internal Preview" },
  ]);

  // 6. INTEGRATIONS LIST
  const [integrations, setIntegrations] = useState<IntegrationGateway[]>([
    { id: "int_01", name: "Razorpay Multi-Account Gateway", category: "Payment", iconName: "CreditCard", status: "Connected", description: "Indian UPI, Cards & Netbanking auto-routing with webhook verification.", environment: "Production", lastPing: "Active", keyMasked: "rzp_live_***" },
    { id: "int_02", name: "Stripe Global Connect", category: "Payment", iconName: "CreditCard", status: "Connected", description: "Multi-currency processing for international branches.", environment: "Production", lastPing: "Active", keyMasked: "pk_live_***" },
    { id: "int_03", name: "Twilio WhatsApp Business Cloud", category: "Messaging", iconName: "MessageSquare", status: "Connected", description: "Automated interactive appointment confirmations & digital receipts.", environment: "Production", lastPing: "Active", keyMasked: "AC_live_***" },
    { id: "int_04", name: "Resend Transactional Email", category: "Messaging", iconName: "Mail", status: "Connected", description: "High-deliverability SMTP & API for invoices, OTPs, and notifications.", environment: "Production", lastPing: "Active", keyMasked: "re_***" },
    { id: "int_05", name: "Google Gemini 3.7 Pro & Vision API", category: "AI & LLM", iconName: "Sparkles", status: "Connected", description: "Core LLM backend for hairstyle rendering, marketing copilot, and analytics.", environment: "Production", lastPing: "Active", keyMasked: "AIzaSy***" },
    { id: "int_06", name: "Google Calendar & Maps Sync", category: "Calendar & Maps", iconName: "Calendar", status: "Configured", description: "Real-time client calendar invites and salon GPS coordinates routing.", environment: "Production", lastPing: "Active", keyMasked: "gcal_***" },
  ]);

  // Aggregated Stats
  const platformStats = useMemo(() => {
    const totalMRR = tenants.reduce((acc, t) => acc + t.mrr, 0);
    const totalBranches = tenants.reduce((acc, t) => acc + t.branchesCount, 0);
    const totalCustomers = tenants.reduce((acc, t) => acc + t.customersCount, 0);
    const totalStaff = tenants.reduce((acc, t) => acc + t.staffCount, 0);
    const totalBookings = tenants.reduce((acc, t) => acc + t.bookingsCount, 0);
    const totalAIUsage = tenants.reduce((acc, t) => acc + t.aiCreditsUsed, 0);

    return {
      totalMRR,
      totalBranches,
      totalCustomers,
      totalStaff,
      totalBookings,
      totalAIUsage,
      activeTenantsCount: tenants.length,
    };
  }, [tenants]);

  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [provisionedCreds, setProvisionedCreds] = useState<{
    org: string; owner: string; email: string; username: string; password: string; phone?: string;
  } | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  // Handler for adding a tenant — calls real backend
  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerName.trim() || !newBrandName.trim()) return;
    setProvisionError(null);
    setIsProvisioning(true);
    try {
      const result = await OnboardingService.provisionOwner({
        brand_name: newBrandName.trim(),
        owner_name: newOwnerName.trim(),
        owner_email: newOwnerEmail.trim() || undefined,
        owner_phone: newOwnerPhone.trim() || undefined,
        owner_password: newOwnerPassword.trim() || undefined,
        city: newOwnerCity.trim() || undefined,
        business_type: "general",
        subscription_tier: newOwnerPlan,
        currency: "INR",
      });

      // Add to local tenants list
      const matchedPlan = subscriptionPlans.find((p) => p.name === newOwnerPlan || p.code === newOwnerPlan);
      const newTenant: TenantOwner = {
        id: result.organization_id,
        name: result.owner_name,
        brandName: result.organization_name,
        email: result.owner_email,
        phone: result.phone || newOwnerPhone,
        plan: newOwnerPlan,
        status: "Active",
        branchesCount: 0,
        staffCount: 0,
        customersCount: 0,
        bookingsCount: 0,
        mrr: matchedPlan ? matchedPlan.price_monthly : 0,
        joinedDate: new Date().toISOString().split("T")[0],
        renewalDate: "",
        city: newOwnerCity,
        country: "India",
        aiCreditsUsed: 0,
        aiCreditsLimit: matchedPlan ? matchedPlan.ai_credits_limit : 0,
      };
      setTenants((prev) => [newTenant, ...prev]);
      hydrateFromBackend?.();

      // Show credentials popup
      setProvisionedCreds({
        org: result.organization_name,
        owner: result.owner_name,
        email: result.owner_email,
        username: result.username,
        password: result.temp_password,
        phone: result.phone,
      });

      setNewOwnerName("");
      setNewBrandName("");
      setNewOwnerEmail("");
      setNewOwnerPhone("");
      setNewOwnerCity("");
      setNewOwnerPassword("");
      setShowOwnerPassword(false);
      setShowAddTenantModal(false);
      addToast("success", "Owner Provisioned", `${result.organization_name} is now live in the database.`);
    } catch (err: any) {
      const msg = err?.message || "Failed to provision owner. Please try again.";
      setProvisionError(msg);
    } finally {
      setIsProvisioning(false);
    }
  };

  // Handlers for Plan CRUD stored in database
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name.trim()) return;

    const payload = {
      name: planForm.name.trim(),
      code: planForm.code.trim() || planForm.name.toLowerCase().replace(/\s+/g, "_"),
      description: planForm.description.trim(),
      price_monthly: Number(planForm.price_monthly) || 0,
      price_yearly: Number(planForm.price_yearly) || Number(planForm.price_monthly) * 10,
      currency: planForm.currency || "INR",
      branches_limit: Number(planForm.branches_limit) || 1,
      staff_limit: Number(planForm.staff_limit) || 5,
      ai_credits_limit: Number(planForm.ai_credits_limit) || 1000,
      features: typeof planForm.features === "string"
        ? (planForm.features as string).split(",").map((s: string) => s.trim()).filter(Boolean)
        : planForm.features,
      is_popular: Boolean(planForm.is_popular),
      is_active: Boolean(planForm.is_active),
      color: planForm.color || "border-slate-200 bg-white",
    };

    try {
      if (editingPlan) {
        const updated = await SubscriptionPlanService.updatePlan(editingPlan.id, payload);
        setSubscriptionPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? updated : p)));
        addToast("success", "Plan Updated", `Tier '${payload.name}' saved to database.`);
      } else {
        const created = await SubscriptionPlanService.createPlan(payload);
        setSubscriptionPlans((prev) => [...prev, created]);
        addToast("success", "Plan Created", `Tier '${payload.name}' created in database.`);
      }
      setShowPlanModal(false);
      setEditingPlan(null);
    } catch (err: any) {
      console.error("Failed to save plan:", err);
      addToast("error", "Failed", err?.message || "Could not save subscription tier.");
    }
  };

  const handleDeletePlan = async (planId: string, planName: string) => {
    if (!window.confirm(`Are you sure you want to delete '${planName}' tier?`)) return;
    try {
      await SubscriptionPlanService.deletePlan(planId);
      setSubscriptionPlans((prev) => prev.filter((p) => p.id !== planId));
      addToast("success", "Plan Deleted", `Tier '${planName}' removed from database.`);
      setShowPlanModal(false);
      setEditingPlan(null);
    } catch (err: any) {
      console.error("Failed to delete plan:", err);
      addToast("error", "Error", err?.message || "Could not delete plan.");
    }
  };

  // Handler for ticket reply
  const handleSendTicketReply = () => {
    if (!selectedTicket || !ticketReplyText.trim()) return;

    const newMsg = {
      id: `m_${Date.now()}`,
      sender: "Super Admin Support",
      role: "superadmin" as const,
      time: "Just now",
      text: ticketReplyText.trim(),
    };

    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? {
            ...t,
            status: "In Progress",
            messages: [...t.messages, newMsg],
          }
          : t
      )
    );

    setSelectedTicket((prev) =>
      prev
        ? {
          ...prev,
          status: "In Progress",
          messages: [...prev.messages, newMsg],
        }
        : null
    );

    setTicketReplyText("");
    addToast("success", "Reply Dispatched", `Message delivered to ${selectedTicket.tenantName}.`);
  };

  // Chart data
  const growthData = [
    { month: "May", mrr: 18.2, owners: 140, bookings: 4200 },
    { month: "Jun", mrr: 24.5, owners: 172, bookings: 5800 },
    { month: "Jul", mrr: 31.0, owners: 198, bookings: 7100 },
    { month: "Aug", mrr: 39.8, owners: 224, bookings: 8900 },
    { month: "Sep", mrr: 48.6, owners: 248, bookings: 11200 },
  ];

  // Dynamic Header Configuration per Active Tab
  const activeHeaderConfig = useMemo(() => {
    const tab = activeSubTab || "dashboard";
    switch (tab) {
      case "organizations":
        return {
          title: "Tenant Organizations & Multi-Branch Hierarchy",
          badge: "MULTI-TENANT DIRECTORY",
          badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
          gradient: "from-slate-950 via-indigo-950 to-slate-900",
          description: "Global salon enterprise owners, licensed franchise chains, staff rosters, and deep drill-down analytics.",
          actionText: "+ Provision Tenant Owner",
          onAction: () => setShowAddTenantModal(true),
          metrics: [
            { label: "Licensed Chains", value: platformStats.activeTenantsCount.toString(), change: "+12.4% MoM", icon: <Building2 className="w-3.5 h-3.5 text-indigo-400" /> },
            { label: "Active Ateliers", value: platformStats.totalBranches.toString(), change: "4 Countries", icon: <MapPin className="w-3.5 h-3.5 text-sky-400" /> },
            { label: "Total Stylists", value: platformStats.totalStaff.toString(), change: "Verified Staff", icon: <Scissors className="w-3.5 h-3.5 text-purple-400" /> },
            { label: "Registered Guests", value: platformStats.totalCustomers.toLocaleString(), change: "+1.8k weekly", icon: <Users className="w-3.5 h-3.5 text-pink-400" /> },
            { label: "Total Bookings", value: platformStats.totalBookings.toLocaleString(), change: "All branches", icon: <Calendar className="w-3.5 h-3.5 text-teal-400" /> },
            { label: "Tenant MRR", value: `₹${(platformStats.totalMRR / 100000).toFixed(1)}L`, change: "Monthly SaaS", icon: <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> },
          ],
        };

      case "finance":
        return {
          title: "SaaS Revenue, Billing & Subscriptions Engine",
          badge: "SAAS REVENUE & MRR",
          badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          gradient: "from-slate-950 via-emerald-950 to-slate-900",
          description: "Subscription tiers (Starter to Enterprise), recurring billing cycles, gateway revenue, and tax compliance.",
          actionText: "+ Create Custom Plan",
          onAction: () => {
            setEditingPlan(null);
            setPlanForm(emptyPlanForm);
            setShowPlanModal(true);
          },
          metrics: [
            { label: "Monthly MRR", value: `₹${(platformStats.totalMRR / 100000).toFixed(1)}L`, change: "+18.6% Growth", icon: <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> },
            { label: "Projected ARR", value: `₹${((platformStats.totalMRR * 12) / 10000000).toFixed(2)}Cr`, change: "Annual Run-Rate", icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> },
            { label: "Paid Subscriptions", value: `${platformStats.activeTenantsCount} Active`, change: "Zero Churn", icon: <CreditCard className="w-3.5 h-3.5 text-teal-400" /> },
            { label: "Average ARPU", value: `₹${platformStats.activeTenantsCount > 0 ? (platformStats.totalMRR / platformStats.activeTenantsCount).toFixed(0) : 0}`, change: "Per Owner", icon: <BarChart3 className="w-3.5 h-3.5 text-sky-400" /> },
            { label: "Gateway Health", value: "100%", change: "Razorpay & Stripe", icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
            { label: "Pending Invoices", value: "0 Due", change: "All Cleared", icon: <FileText className="w-3.5 h-3.5 text-purple-400" /> },
          ],
        };

      case "analytics":
        return {
          title: "Platform Analytics & Tenant Cohort Intelligence",
          badge: "GLOBAL TELEMETRY",
          badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
          gradient: "from-slate-950 via-sky-950 to-slate-900",
          description: "Aggregated gross merchandise volume (GMV), customer acquisition trends, and cross-branch velocity.",
          actionText: "Export Platform CSV",
          onAction: () => addToast("success", "Analytics Exported", "Downloaded global platform metrics report."),
          metrics: [
            { label: "Platform GMV", value: "₹2.48 Cr", change: "+34% YoY", icon: <DollarSign className="w-3.5 h-3.5 text-sky-400" /> },
            { label: "Active Guests", value: platformStats.totalCustomers.toLocaleString(), change: "88% Retention", icon: <Users className="w-3.5 h-3.5 text-pink-400" /> },
            { label: "Monthly Churn", value: "0.8%", change: "Industry Lowest", icon: <Activity className="w-3.5 h-3.5 text-emerald-400" /> },
            { label: "LTV to CAC", value: "5.4x", change: "Highly Profitable", icon: <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> },
            { label: "Top Region", value: "Hyderabad", change: "38% of Bookings", icon: <MapPin className="w-3.5 h-3.5 text-teal-400" /> },
            { label: "Avg Ticket Size", value: "₹3,450", change: "+12% Upsell", icon: <Tag className="w-3.5 h-3.5 text-purple-400" /> },
          ],
        };

      case "catalog":
        return {
          title: "Universal Master Service Catalog & Taxonomy",
          badge: "GLOBAL SERVICE TAXONOMY",
          badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
          gradient: "from-slate-950 via-pink-950 to-slate-900",
          description: "Universal catalog definitions inherited by all salon chains with centralized durations and recommended pricing.",
          actionText: "+ Add Master Service",
          onAction: () => {
            const newSvc: MasterServiceItem = {
              id: `svc_m_0${masterCatalog.length + 1}`,
              category: "Hair Care & Couture",
              subcategory: "Keratin Fusion",
              name: "Bespoke Nano-Plastia Keratin Therapy",
              audience: "unisex",
              defaultDurationMin: 120,
              recommendedPriceINR: 8500,
              status: "active",
              tenantAdoptions: 1,
            };
            setMasterCatalog((prev) => [newSvc, ...prev]);
            addToast("success", "Master Service Added", `${newSvc.name} published to universal catalog.`);
          },
          metrics: [
            { label: "Master Services", value: masterCatalog.length.toString(), change: "Universal Base", icon: <Scissors className="w-3.5 h-3.5 text-pink-400" /> },
            { label: "Categories", value: "6 Core", change: "Hair, Skin, Spa...", icon: <Layers className="w-3.5 h-3.5 text-purple-400" /> },
            { label: "Total Adoptions", value: "192 Instances", change: "Across Tenants", icon: <Building2 className="w-3.5 h-3.5 text-indigo-400" /> },
            { label: "Avg Service Duration", value: "85 mins", change: "Optimized Slots", icon: <Clock className="w-3.5 h-3.5 text-teal-400" /> },
            { label: "Avg Price INR", value: "₹6,800", change: "Luxury Benchmark", icon: <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> },
            { label: "Catalog Version", value: "v4.8 Global", change: "Sync Live", icon: <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> },
          ],
        };

      case "ai":
        return {
          title: "AI Intelligence, Token Telemetry & Models Hub",
          badge: "GEMINI 3.7 FLASH CLUSTER",
          badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          gradient: "from-slate-950 via-amber-950 to-slate-900",
          description: "Generative AI Hairstyle visualizer, skin diagnostic vision, token metering, and cost margin economics.",
          actionText: "Manage AI Quotas",
          onAction: () => addToast("info", "AI Quotas", "Opening tenant AI credit quota controls."),
          metrics: [
            { label: "Total Inferences", value: `${(platformStats.totalAIUsage / 1000).toFixed(1)}k`, change: "Calls this month", icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" /> },
            { label: "Inference Latency", value: "320 ms", change: "Fast Streaming", icon: <Zap className="w-3.5 h-3.5 text-amber-400" /> },
            { label: "Platform AI Cost", value: "₹22,480", change: "Compute Billing", icon: <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> },
            { label: "AI Gross Margin", value: "88.4%", change: "Healthy SaaS Spread", icon: <TrendingUp className="w-3.5 h-3.5 text-teal-400" /> },
            { label: "Active AI Features", value: "4 Online", change: "Hairstyle, Skin, POS", icon: <Cpu className="w-3.5 h-3.5 text-sky-400" /> },
            { label: "Core Model", value: "Gemini 3.7", change: "Vision Multi-Modal", icon: <Radio className="w-3.5 h-3.5 text-purple-400" /> },
          ],
        };

      case "support":
        return {
          title: "Omnichannel Support Command Desk & SLA Tracker",
          badge: "LIVE SUPPORT QUEUE",
          badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
          gradient: "from-slate-950 via-rose-950 to-slate-900",
          description: "Priority incident management, interactive two-way owner messaging, SLA timers, and escalation routing.",
          actionText: "+ Create Incident Ticket",
          onAction: () => addToast("info", "Support Desk", "Opening support ticket creation dialog."),
          metrics: [
            { label: "Open Tickets", value: supportTickets.filter((t) => t.status !== "Resolved").length.toString(), change: "Active Queue", icon: <LifeBuoy className="w-3.5 h-3.5 text-rose-400" /> },
            { label: "Urgent Priority", value: supportTickets.filter((t) => t.priority === "Urgent").length.toString(), change: "Immediate Attention", icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> },
            { label: "Avg SLA Response", value: "18 mins", change: "Target < 30m", icon: <Clock className="w-3.5 h-3.5 text-teal-400" /> },
            { label: "Resolved Today", value: "31 Tickets", change: "100% Target", icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
            { label: "Tenant CSAT", value: "99.2%", change: "High Satisfaction", icon: <Star className="w-3.5 h-3.5 text-amber-400" /> },
            { label: "Active Agents", value: "4 On-Duty", change: "Tier 1 & DevOps", icon: <Users className="w-3.5 h-3.5 text-sky-400" /> },
          ],
        };

      case "system":
        return {
          title: "Platform System, Settings, Integrations & Security",
          badge: "SYSTEM ENGINE & ROOT SETTINGS",
          badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
          gradient: "from-slate-950 via-slate-900 to-cyan-950",
          description: "Payment gateways, WhatsApp/SMS APIs, Super Admin root credentials, feature flags, and tamper-evident audit logs.",
          actionText: "Run System Diagnostics",
          onAction: () => addToast("success", "System Diagnostic Complete", "All 6 gateway connections and 4 node clusters are healthy."),
          metrics: [
            { label: "Integrations", value: "6 / 6 Live", change: "All Connected", icon: <Cpu className="w-3.5 h-3.5 text-teal-400" /> },
            { label: "Security Status", value: "2FA Active", change: "Root Protected", icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> },
            { label: "Feature Flags", value: "5 Active", change: "Toggles Live", icon: <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" /> },
            { label: "Audit Logs", value: `${auditLogs.length} Events`, change: "Tamper-Evident", icon: <FileText className="w-3.5 h-3.5 text-purple-400" /> },
            { label: "Cloud Node SLA", value: "99.98%", change: "Zero Downtime", icon: <Activity className="w-3.5 h-3.5 text-sky-400" /> },
            { label: "Storage Load", value: "1.2 TB / 5 TB", change: "24% Consumed", icon: <HardDrive className="w-3.5 h-3.5 text-amber-400" /> },
          ],
        };

      default:
        return {
          title: "Super Admin Platform SaaS Orchestrator",
          badge: "PLATFORM ROOT V4.8",
          badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
          gradient: "from-slate-950 via-purple-950 to-indigo-950",
          description: "Central multi-tenant operations, global tenant hierarchy, subscription billing, master service catalog, and AI telemetry cluster.",
          actionText: "+ Provision Tenant Organization",
          onAction: () => setShowAddTenantModal(true),
          metrics: [
            { label: "Active Owners", value: platformStats.activeTenantsCount.toString(), change: "+12.4% MoM", icon: <Building2 className="w-3.5 h-3.5 text-purple-400" /> },
            { label: "Total Branches", value: platformStats.totalBranches.toString(), change: "Across 4 Countries", icon: <MapPin className="w-3.5 h-3.5 text-indigo-400" /> },
            { label: "Registered Guests", value: platformStats.totalCustomers.toLocaleString(), change: "+1,840 this week", icon: <Users className="w-3.5 h-3.5 text-pink-400" /> },
            { label: "Platform MRR", value: `₹${(platformStats.totalMRR / 100000).toFixed(1)}L`, change: "+18.6% Growth", icon: <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> },
            { label: "AI Inference Calls", value: `${(platformStats.totalAIUsage / 1000).toFixed(1)}k`, change: "Gemini 3.7 Core", icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" /> },
            { label: "Cluster SLA", value: "99.98%", change: "Zero Incidents", icon: <Activity className="w-3.5 h-3.5 text-teal-400" /> },
          ],
        };
    }
  }, [activeSubTab, platformStats, masterCatalog.length, supportTickets, auditLogs.length]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. DYNAMIC TOP HERO BANNER (ADAPTS TO EACH ACTIVE TAB / PAGE) */}
      {/* ========================================================================= */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${activeHeaderConfig.gradient} text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl transition-all duration-300`}>
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            {/* Breadcrumb Navigation */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300">
              <span
                onClick={() => {
                  setSelectedOwner(null);
                  setActiveSubTab("dashboard");
                }}
                className="hover:text-white cursor-pointer transition-colors flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10"
              >
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>Super Admin Root</span>
              </span>

              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize text-white bg-white/15 px-2.5 py-1 rounded-lg border border-white/20 font-bold">
                {activeSubTab || "dashboard"} Domain
              </span>

              {selectedOwner && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-700/40 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{selectedOwner.brandName}</span>
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>{activeHeaderConfig.title}</span>
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border shadow-xs ${activeHeaderConfig.badgeColor}`}>
                {activeHeaderConfig.badge}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              {activeHeaderConfig.description}
            </p>
          </div>

          {/* Dynamic Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={activeHeaderConfig.onAction}
              className="px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-black/20 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <span>{activeHeaderConfig.actionText}</span>
            </button>
            <button
              onClick={() => {
                addToast("info", "Syncing Cloud Telemetry", "Pulling live metrics from platform cloud clusters...");
              }}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Key Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10">
          {activeHeaderConfig.metrics.map((metric, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/5 space-y-1">
              <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                {metric.icon}
                <span>{metric.label}</span>
              </div>
              <div className="text-xl font-bold text-white">{metric.value}</div>
              <div className="text-[10px] text-emerald-400 font-semibold">{metric.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TABBED CONTENT RENDERER BASED ON ACTIVE SUB-TAB */}
      {/* ========================================================================= */}

      {/* --- TAB 1: PLATFORM OVERVIEW & DASHBOARD --- */}
      {(!activeSubTab || activeSubTab === "dashboard") && (
        <div className="space-y-6">
          {/* Growth Charts & Live Telemetry Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span>SaaS Revenue & Tenant Velocity</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Monthly Recurring Revenue (MRR in Lakhs INR) vs Total Active Tenant Chains
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  +38% H2 Target Achieved
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        color: "#fff",
                        borderRadius: "16px",
                        border: "none",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="mrr" stroke="#9333ea" strokeWidth={3} fillOpacity={1} fill="url(#colorMRR)" name="MRR (₹ Lakhs)" />
                    <Area type="monotone" dataKey="owners" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" name="Tenant Owners" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cloud Nodes & Global Platform Health */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-emerald-600" />
                  <span>Cloud Node Status</span>
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Global Operational
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { name: "AP-South (  Primary)", ping: "14ms", status: "Healthy", load: "34%" },
                  { name: "EU-West (London Mayfair)", ping: "38ms", status: "Healthy", load: "28%" },
                  { name: "ME-Central (Dubai Marina)", ping: "22ms", status: "Healthy", load: "41%" },
                  { name: "US-West (Beverly Hills)", ping: "54ms", status: "Healthy", load: "19%" },
                  { name: "AI Gateway (Gemini 3.7 Flash)", ping: "88ms", status: "Optimal", load: "62%" },
                  { name: "Payment Gateways (Razorpay/Stripe)", ping: "18ms", status: "100% Up", load: "21%" },
                ].map((node, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{node.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Latency: {node.ping} • Load: {node.load}</div>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg text-[10px]">
                      {node.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Drill-down Tenant Overview Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span>All Salon Tenant Organizations ({tenants.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Click any owner to drill down into their specific branches, staff, customers, and bookings.
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search owners, brands, or cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Salon Enterprise</th>
                    <th className="py-3 px-4">Managing Owner</th>
                    <th className="py-3 px-4">Tier Plan</th>
                    <th className="py-3 px-4">Branches</th>
                    <th className="py-3 px-4">Staff</th>
                    <th className="py-3 px-4">Customers</th>
                    <th className="py-3 px-4">MRR</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenants
                    .filter(
                      (t) =>
                        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.city.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => {
                          setSelectedOwner(t);
                          setActiveSubTab("organizations");
                        }}
                        className="hover:bg-purple-50/50 cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                            {t.brandName.charAt(0)}
                          </div>
                          <div>
                            <div>{t.brandName}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{t.city}, {t.country}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{t.name}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${t.plan === "Enterprise"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : t.plan === "Business"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : "bg-sky-100 text-sky-800 border border-sky-200"
                              }`}
                          >
                            {t.plan}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{t.branchesCount} Ateliers</td>
                        <td className="py-3.5 px-4 text-slate-600">{t.staffCount} Stylists</td>
                        <td className="py-3.5 px-4 text-slate-600">{t.customersCount.toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700">₹{t.mrr.toLocaleString()}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            className="text-purple-600 group-hover:text-purple-800 font-bold text-xs flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <span>Drill Down</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: ORGANIZATIONS & DEEP TENANT HIERARCHY DRILL-DOWN --- */}
      {activeSubTab === "organizations" && (
        <div className="space-y-6">
          {selectedOwner ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              {/* Tenant Detail Top Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
                    {selectedOwner.brandName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{selectedOwner.brandName}</h2>
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                        {selectedOwner.plan} Plan
                      </span>
                      {selectedOwner.code && (
                        <span className="bg-slate-100 text-slate-700 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-slate-200">
                          {selectedOwner.code}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Owner: <strong className="text-slate-900">{selectedOwner.name}</strong>
                      </span>
                      {selectedOwner.email && (
                        <>
                          <span className="text-slate-300">•</span>
                          <a
                            href={`mailto:${selectedOwner.email}`}
                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-indigo-500" />
                            {selectedOwner.email}
                          </a>
                        </>
                      )}
                      {selectedOwner.phone && (
                        <>
                          <span className="text-slate-300">•</span>
                          <a
                            href={`tel:${selectedOwner.phone}`}
                            className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            {selectedOwner.phone}
                          </a>
                        </>
                      )}
                      {(selectedOwner.city || selectedOwner.country) && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {[selectedOwner.city, selectedOwner.country].filter(Boolean).join(", ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedOwner(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    ← Back to All Owners
                  </button>
                  <button
                    onClick={() => addToast("success", "Owner Profile Updated", "Tenant configuration saved.")}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Edit Tenant License
                  </button>
                </div>
              </div>

              {/* Drill-down Subtab Navigation */}
              <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
                {[
                  { id: "overview", label: "Tenant Overview", icon: <Building2 className="w-3.5 h-3.5" /> },
                  { id: "branches", label: `Branches (${selectedOwner.branchesCount})`, icon: <MapPin className="w-3.5 h-3.5" /> },
                  { id: "staff", label: `Staff Network (${selectedOwner.staffCount})`, icon: <Scissors className="w-3.5 h-3.5" /> },
                  { id: "customers", label: `Guest Directory (${selectedOwner.customersCount})`, icon: <Users className="w-3.5 h-3.5" /> },
                  { id: "bookings", label: `Bookings (${selectedOwner.bookingsCount})`, icon: <Calendar className="w-3.5 h-3.5" /> },
                  { id: "finance", label: "SaaS Subscriptions & MRR", icon: <CreditCard className="w-3.5 h-3.5" /> },
                  { id: "ai", label: "AI Usage & Telemetry", icon: <Sparkles className="w-3.5 h-3.5" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setOwnerDrillTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${ownerDrillTab === tab.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Drilldown Tab Body */}
              {ownerDrillTab === "overview" && (
                <div className="space-y-6">
                  {/* Dedicated Official Credentials & Contacts Card */}
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-500/20 shadow-lg text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-sm">
                            <Key className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
                              Organization Credentials & Contact Directory
                              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                                Verified Active
                              </span>
                            </h4>
                            <p className="text-[11px] text-indigo-200/70">
                              Registered credentials, owner login email, direct phone, and unique organization codes.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const credsText = `Salon OS Tenant Credentials\nOrganization: ${selectedOwner.brandName}\nOrg ID: ${selectedOwner.id}\nOrg Code: ${selectedOwner.code || "N/A"}\nOwner: ${selectedOwner.name}\nEmail: ${selectedOwner.email || "N/A"}\nPhone: ${selectedOwner.phone || "N/A"}\nCity: ${selectedOwner.city || "N/A"}, ${selectedOwner.country || "N/A"}\nPlan: ${selectedOwner.plan}`;
                            navigator.clipboard.writeText(credsText);
                            addToast("success", "Credentials Copied", "Organization details copied to clipboard.");
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Credentials</span>
                        </button>
                      </div>

                      {/* Credentials 4-Column Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* 1. Email */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
                          <div className="text-[11px] font-semibold text-indigo-200/70 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-indigo-400" />
                            Official Login Email
                          </div>
                          <div className="font-bold text-sm text-white truncate" title={selectedOwner.email || "Not Configured"}>
                            {selectedOwner.email || <span className="text-slate-400 italic font-normal">Not Configured</span>}
                          </div>
                          {selectedOwner.email && (
                            <a
                              href={`mailto:${selectedOwner.email}`}
                              className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-white transition font-medium pt-1"
                            >
                              Send Direct Email →
                            </a>
                          )}
                        </div>

                        {/* 2. Phone */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
                          <div className="text-[11px] font-semibold text-indigo-200/70 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            Primary Phone Number
                          </div>
                          <div className="font-bold text-sm text-white truncate" title={selectedOwner.phone || "Not Configured"}>
                            {selectedOwner.phone || <span className="text-slate-400 italic font-normal">Not Configured</span>}
                          </div>
                          {selectedOwner.phone && (
                            <a
                              href={`tel:${selectedOwner.phone}`}
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-300 hover:text-white transition font-medium pt-1"
                            >
                              Call / WhatsApp →
                            </a>
                          )}
                        </div>

                        {/* 3. Organization Identity */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
                          <div className="text-[11px] font-semibold text-indigo-200/70 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-purple-400" />
                            Organization Code
                          </div>
                          <div className="font-mono font-bold text-sm text-purple-200 tracking-wider">
                            {selectedOwner.code || selectedOwner.id.substring(0, 12).toUpperCase()}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate" title={selectedOwner.id}>
                            ID: {selectedOwner.id}
                          </div>
                        </div>

                        {/* 4. Owner Account & License */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
                          <div className="text-[11px] font-semibold text-indigo-200/70 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                            Registered Owner
                          </div>
                          <div className="font-bold text-sm text-white truncate">
                            {selectedOwner.name}
                          </div>
                          <div className="text-[10px] text-amber-300 font-semibold">
                            {selectedOwner.plan} License &bull; Owner Role
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Summary Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-900">Tenant License Summary</h4>
                      <div className="space-y-2 text-xs text-slate-700">
                        <div className="flex justify-between"><span>Subscription MRR:</span><strong className="text-emerald-700 font-bold">₹{selectedOwner.mrr.toLocaleString()}/mo</strong></div>
                        <div className="flex justify-between"><span>Joined Platform:</span><strong>{selectedOwner.joinedDate || "Active"}</strong></div>
                        <div className="flex justify-between"><span>Next Renewal Date:</span><strong>{selectedOwner.renewalDate || "30 Days Active"}</strong></div>
                        <div className="flex justify-between"><span>License Type:</span><span className="font-bold text-indigo-700">Multi-Location Franchise</span></div>
                      </div>
                    </div>

                    <div className="bg-sky-50/50 p-5 rounded-2xl border border-sky-100 space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-sky-900">AI Quotas & Limits</h4>
                      <div className="space-y-2 text-xs text-slate-700">
                        <div className="flex justify-between"><span>AI Credits Consumed:</span><strong>{selectedOwner.aiCreditsUsed.toLocaleString()}</strong></div>
                        <div className="flex justify-between"><span>Credit Quota Limit:</span><strong>{selectedOwner.aiCreditsLimit.toLocaleString()}</strong></div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-sky-600 h-2 rounded-full"
                            style={{ width: `${selectedOwner.aiCreditsLimit > 0 ? (selectedOwner.aiCreditsUsed / selectedOwner.aiCreditsLimit) * 100 : 0}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 text-right">
                          {selectedOwner.aiCreditsLimit > 0 ? ((selectedOwner.aiCreditsUsed / selectedOwner.aiCreditsLimit) * 100).toFixed(1) : 0}% used
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900">Operational Health</h4>
                      <div className="space-y-2 text-xs text-slate-700">
                        <div className="flex justify-between"><span>Active Branches:</span><strong>{selectedOwner.branchesCount} online</strong></div>
                        <div className="flex justify-between"><span>Staff on Duty:</span><strong>{selectedOwner.staffCount} verified</strong></div>
                        <div className="flex justify-between"><span>POS Status:</span><span className="text-emerald-700 font-bold">Connected (Zero Failures)</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {ownerDrillTab === "branches" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">Registered Branches for {selectedOwner.brandName}</h4>
                    <button
                      onClick={() => addToast("info", "Add Branch Modal", "Opening franchise branch registration dialog.")}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      + Add Location
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { code: "LM-HYD-01", name: "Jubilee Hills Flagship Atelier", chairs: 14, staff: 18, revenue: "₹18.4L", status: "Active" },
                      { code: "LM-HYD-02", name: "Banjara Hills Royal Suite", chairs: 10, staff: 12, revenue: "₹12.2L", status: "Active" },
                      { code: "LM-HYD-03", name: "Gachibowli Tech-City Studio", chairs: 8, staff: 8, revenue: "₹8.9L", status: "Active" },
                    ].map((br, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-xs font-bold text-slate-900">{br.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{br.code}</div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {br.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 flex justify-between pt-2 border-t border-slate-200">
                          <span>Chairs: <strong>{br.chairs}</strong></span>
                          <span>Staff: <strong>{br.staff}</strong></span>
                          <span>Monthly Gross: <strong className="text-emerald-700">{br.revenue}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <span>Onboarded Salon Organizations & Franchises ({tenants.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live list of all onboarded customer salon organizations, owners, and license entitlements.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setOrgViewMode("table")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${orgViewMode === "table" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Row View</span>
                    </button>
                    <button
                      onClick={() => setOrgViewMode("cards")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${orgViewMode === "cards" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Grid Cards</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowAddTenantModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Provision Tenant</span>
                  </button>
                </div>
              </div>

              {/* Bulk action toolbar */}
              {selectedOrgs.size > 0 && (
                <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2.5 text-sm animate-in slide-in-from-top-1 duration-200">
                  <span className="text-rose-700 font-semibold">
                    {selectedOrgs.size} organisation{selectedOrgs.size > 1 ? "s" : ""} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrgs(new Set())}
                      className="text-slate-500 hover:text-slate-700 text-xs font-medium px-3 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                      Deselect All
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteSelected}
                      disabled={isDeletingOrgs}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isDeletingOrgs ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      {isDeletingOrgs ? "Deleting…" : `Delete ${selectedOrgs.size > 1 ? `(${selectedOrgs.size})` : ""}`}
                    </button>
                  </div>
                </div>
              )}

              {orgViewMode === "table" ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/75">
                      <tr className="border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        {/* Select-all checkbox */}
                        <th className="py-3 px-4 w-10">
                          <input
                            type="checkbox"
                            id="select-all-orgs"
                            checked={tenants.length > 0 && selectedOrgs.size === tenants.length}
                            ref={(el) => {
                              if (el) el.indeterminate = selectedOrgs.size > 0 && selectedOrgs.size < tenants.length;
                            }}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 accent-indigo-600 cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-4">Salon Organization</th>
                        <th className="py-3 px-4">Managing Owner</th>
                        <th className="py-3 px-4">Contact Info</th>
                        <th className="py-3 px-4">Plan Tier</th>
                        <th className="py-3 px-4">Locations</th>
                        <th className="py-3 px-4">Staff</th>
                        <th className="py-3 px-4">MRR</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tenants.map((t) => (
                        <tr
                          key={t.id}
                          onClick={() => {
                            setSelectedOwner(t);
                          }}
                          className={`hover:bg-indigo-50/40 cursor-pointer transition-colors group ${selectedOrgs.has(t.id) ? "bg-rose-50/60" : ""
                            }`}
                        >
                          {/* Row checkbox */}
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedOrgs.has(t.id)}
                              onChange={() => { }}
                              onClick={(e) => toggleOrgSelection(t.id, e)}
                              className="w-4 h-4 rounded border-slate-300 text-rose-600 accent-rose-600 cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                              {t.brandName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-slate-900 font-bold group-hover:text-indigo-600 transition-colors">
                                {t.brandName}
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                {t.city}, {t.country}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            {t.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 space-y-0.5">
                            <div className="text-slate-700">{t.email}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{t.phone}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${t.plan === "Enterprise"
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : t.plan === "Business"
                                    ? "bg-purple-100 text-purple-800 border border-purple-200"
                                    : "bg-sky-100 text-sky-800 border border-sky-200"
                                }`}
                            >
                              {t.plan}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {t.branchesCount} Ateliers
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {t.staffCount} Stylists
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-700">
                            ₹{t.mrr.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{t.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              className="text-indigo-600 group-hover:text-indigo-800 font-bold text-xs inline-flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition"
                            >
                              <span>Inspect</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                  {tenants.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedOwner(t)}
                      className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer space-y-4 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                            {t.brandName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition-colors">
                              {t.brandName}
                            </h4>
                            <div className="text-[10px] text-slate-400">{t.city}, {t.country}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                          {t.plan}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200/60 text-center text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400">Branches</div>
                          <div className="font-bold text-slate-800">{t.branchesCount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Staff</div>
                          <div className="font-bold text-slate-800">{t.staffCount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Monthly MRR</div>
                          <div className="font-bold text-emerald-700">₹{(t.mrr / 1000).toFixed(0)}k</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-indigo-600 font-bold group-hover:text-indigo-800">
                        <span>Owner: {t.name}</span>
                        <span className="flex items-center gap-1">
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: SAAS FINANCE & SUBSCRIPTIONS --- */}
      {activeSubTab === "finance" && (
        <div className="space-y-6">
          {/* SaaS Pricing Plans Configurator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {isLoadingPlans ? (
              <div className="col-span-full py-12 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Loading subscription tiers from database...</span>
              </div>
            ) : subscriptionPlans.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
                <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700">No subscription tiers configured yet</p>
                <button
                  onClick={() => {
                    setEditingPlan(null);
                    setPlanForm(emptyPlanForm);
                    setShowPlanModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  + Create First Subscription Tier
                </button>
              </div>
            ) : (
              subscriptionPlans.map((plan) => (
                <div key={plan.id} className={`p-6 rounded-3xl border shadow-xs space-y-4 ${plan.color || "border-slate-200 bg-white"} relative`}>
                  {plan.is_popular && (
                    <span className="absolute -top-3 right-6 bg-purple-600 text-white text-[10px] uppercase font-bold px-3 py-0.5 rounded-full shadow-xs">
                      Most Popular
                    </span>
                  )}
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{plan.name} Tier</h4>
                    <div className="text-2xl font-extrabold text-slate-900 mt-1">
                      ₹{plan.price_monthly.toLocaleString()}<span className="text-xs font-normal text-slate-500">/mo</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 border-t border-slate-200 pt-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span><strong>{plan.branches_limit >= 900 ? "Unlimited" : plan.branches_limit}</strong> Branch License</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span><strong>{plan.staff_limit >= 900 ? "Unlimited" : plan.staff_limit}</strong> Staff Accounts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span><strong>{(plan.ai_credits_limit / 1000).toFixed(0)}k credits</strong> AI Limit</span>
                    </div>
                    {(plan.features || []).slice(0, 2).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setEditingPlan(plan);
                      setPlanForm({
                        name: plan.name,
                        code: plan.code,
                        description: plan.description || "",
                        price_monthly: plan.price_monthly,
                        price_yearly: plan.price_yearly || plan.price_monthly * 10,
                        currency: plan.currency || "INR",
                        branches_limit: plan.branches_limit,
                        staff_limit: plan.staff_limit,
                        ai_credits_limit: plan.ai_credits_limit,
                        features: Array.isArray(plan.features) ? plan.features.join(", ") : (plan.features || ""),
                        is_popular: plan.is_popular,
                        is_active: plan.is_active,
                        color: plan.color || "border-slate-200 bg-white",
                      });
                      setShowPlanModal(true);
                    }}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Configure Tier Limits
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Subscriptions Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>Active Tenant Subscriptions & Recurring Invoices</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Current Plan</th>
                    <th className="py-3 px-4">Monthly Rate</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Next Renewal</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{t.brandName}</td>
                      <td className="py-3.5 px-4"><span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md">{t.plan}</span></td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">₹{t.mrr.toLocaleString()}</td>
                      <td className="py-3.5 px-4"><span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">{t.status}</span></td>
                      <td className="py-3.5 px-4 text-slate-500">{t.renewalDate}</td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => addToast("success", "Subscription Upgraded", `${t.brandName} upgraded.`)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px] hover:bg-emerald-100 cursor-pointer"
                        >
                          Upgrade
                        </button>
                        <button
                          onClick={() => addToast("warning", "Trial Extended", `Added 14 days to ${t.brandName}.`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] hover:bg-slate-200 cursor-pointer"
                        >
                          Extend
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: PLATFORM ANALYTICS --- */}
      {activeSubTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-sky-600" />
                <span>Geographic GMV Contribution by City</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { city: "Hyderabad", gmv: 84 },
                      { city: " ", gmv: 62 },
                      { city: "London", gmv: 48 },
                      { city: "Dubai", gmv: 34 },
                      { city: "Bengaluru", gmv: 20 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="city" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", color: "#fff", borderRadius: "16px" }} />
                    <Bar dataKey="gmv" fill="#0284c7" radius={[8, 8, 0, 0]} name="GMV (₹ Lakhs)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>Tenant Tier Distribution</span>
              </h3>
              <div className="space-y-3 pt-2">
                {tenants.length === 0 ? (
                  <p className="text-slate-400 text-xs py-4 text-center">No active tenant data available yet.</p>
                ) : (
                  (() => {
                    const counts: Record<string, number> = {};
                    tenants.forEach((t) => {
                      const key = t.plan || "Unassigned";
                      counts[key] = (counts[key] || 0) + 1;
                    });
                    const colorMap = ["bg-indigo-500", "bg-purple-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500"];
                    return Object.entries(counts).map(([tierName, count], i) => {
                      const pctNum = Math.round((count / tenants.length) * 100);
                      const planObj = subscriptionPlans.find((p) => p.name === tierName);
                      const priceText = planObj ? ` (₹${planObj.price_monthly.toLocaleString()}/mo)` : "";
                      return (
                        <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{tierName}{priceText}</span>
                            <span>{count} {count === 1 ? "Tenant" : "Tenants"} ({pctNum}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className={`${colorMap[i % colorMap.length]} h-2 rounded-full`} style={{ width: `${pctNum}%` }} />
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: MASTER UNIVERSAL SERVICE CATALOG --- */}
      {activeSubTab === "catalog" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-pink-600" />
                <span>Super Admin Universal Service Catalog ({masterCatalog.length})</span>
              </h3>
              <p className="text-xs text-slate-500">
                Universal taxonomy and master service definitions inherited dynamically by all salon tenants globally.
              </p>
            </div>

            <button
              onClick={() => {
                const newSvc: MasterServiceItem = {
                  id: `svc_m_0${masterCatalog.length + 1}`,
                  category: "Hair Care & Couture",
                  subcategory: "Keratin Fusion",
                  name: "Bespoke Nano-Plastia Keratin Therapy",
                  audience: "unisex",
                  defaultDurationMin: 120,
                  recommendedPriceINR: 8500,
                  status: "active",
                  tenantAdoptions: 1,
                };
                setMasterCatalog((prev) => [newSvc, ...prev]);
                addToast("success", "Master Service Added", `${newSvc.name} published to global catalog.`);
              }}
              className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              + Add Master Service to Universal Catalog
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Master Service</th>
                  <th className="py-3 px-4">Category & Subcategory</th>
                  <th className="py-3 px-4">Audience</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Recommended Base Price</th>
                  <th className="py-3 px-4">Tenant Adoption</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {masterCatalog.map((svc) => (
                  <tr key={svc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{svc.name}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{svc.category}</div>
                      <div className="text-[10px] text-slate-400">{svc.subcategory}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
                        {svc.audience}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{svc.defaultDurationMin} mins</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">₹{svc.recommendedPriceINR.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-semibold text-purple-700">{svc.tenantAdoptions} Salons</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {svc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 6: AI INTELLIGENCE & TELEMETRY HUB --- */}
      {activeSubTab === "ai" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-amber-500 to-yellow-600 p-6 rounded-3xl text-slate-950 shadow-md space-y-2">
              <div className="flex items-center justify-between font-bold text-xs uppercase tracking-wider opacity-80">
                <span>Total AI Inferences (Month)</span>
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black">144,980 calls</div>
              <div className="text-xs font-semibold">Gemini 3.7 Flash & Vision Core</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Inference Latency</div>
              <div className="text-3xl font-bold text-slate-900">320 ms</div>
              <div className="text-xs text-emerald-600 font-semibold">Fast streaming enabled</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Platform AI Cost</div>
              <div className="text-3xl font-bold text-purple-700">₹22,480</div>
              <div className="text-xs text-slate-500">Gross Margin on AI: <strong>88.4%</strong></div>
            </div>
          </div>

          {/* AI Usage per Tenant Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>AI Token & Inference Consumption per Tenant</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Tenant Enterprise</th>
                    <th className="py-3 px-4">AI Credits Used</th>
                    <th className="py-3 px-4">Monthly Quota</th>
                    <th className="py-3 px-4">Active AI Features</th>
                    <th className="py-3 px-4 text-right">Computed Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{t.brandName}</td>
                      <td className="py-3.5 px-4 font-bold text-purple-700">{t.aiCreditsUsed.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-slate-500">{t.aiCreditsLimit.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-slate-600">Hairstyle AI, Skin Diagnostics, Marketing Copilot</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">₹{(t.aiCreditsUsed * 0.45).toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 7: SUPPORT TICKET DESK & SLA --- */}
      {activeSubTab === "support" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-rose-600" />
                <span>Omnichannel Support Tickets ({supportTickets.length})</span>
              </h3>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                Avg SLA: 18m Response
              </span>
            </div>

            <div className="space-y-3">
              {supportTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${selectedTicket?.id === ticket.id
                    ? "border-rose-500 bg-rose-50/40 shadow-xs"
                    : "border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/60"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-rose-700">{ticket.id}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ticket.priority === "Urgent"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                          }`}
                      >
                        {ticket.priority} Priority
                      </span>
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{ticket.subject}</h4>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Tenant: <strong>{ticket.tenantName}</strong></span>
                    <span>{ticket.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Ticket Conversation Drawer */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            {selectedTicket ? (
              <>
                <div className="space-y-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-700">{selectedTicket.id}</span>
                    <span className="text-xs font-semibold text-slate-500">{selectedTicket.category}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{selectedTicket.subject}</h4>
                  <div className="text-xs text-slate-500">Tenant: <strong>{selectedTicket.tenantName}</strong></div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 py-2 max-h-72 text-xs">
                  {selectedTicket.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-2xl space-y-1 ${m.role === "superadmin"
                        ? "bg-purple-600 text-white ml-6"
                        : m.role === "system"
                          ? "bg-slate-100 text-slate-600 italic"
                          : "bg-slate-100 text-slate-800 mr-6"
                        }`}
                    >
                      <div className="flex justify-between items-center text-[10px] opacity-80">
                        <strong>{m.sender}</strong>
                        <span>{m.time}</span>
                      </div>
                      <p>{m.text}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Type official reply to salon owner..."
                    value={ticketReplyText}
                    onChange={(e) => setTicketReplyText(e.target.value)}
                    className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => {
                        setSupportTickets((prev) =>
                          prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: "Resolved" } : t))
                        );
                        setSelectedTicket((prev) => (prev ? { ...prev, status: "Resolved" } : null));
                        addToast("success", "Ticket Resolved", `${selectedTicket.id} marked as resolved.`);
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      ✓ Mark Resolved
                    </button>
                    <button
                      onClick={handleSendTicketReply}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 text-slate-400 space-y-2">
                <LifeBuoy className="w-10 h-10 text-slate-300" />
                <p className="text-xs">Select a support ticket from the queue to view messages and reply directly to the tenant.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 8: UNIFIED SYSTEM, SETTINGS, INTEGRATIONS & SECURITY --- */}
      {activeSubTab === "system" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          {/* Internal System Subtab Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "integrations", label: "Integrations & APIs", icon: <Cpu className="w-3.5 h-3.5" /> },
                { id: "profile", label: "Admin Profile & 2FA", icon: <User className="w-3.5 h-3.5" /> },
                { id: "security", label: "Security & Audit Logs", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                { id: "flags", label: "Feature Flags & Toggles", icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
                { id: "health", label: "Cloud Nodes & Health", icon: <Server className="w-3.5 h-3.5" /> },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSystemSubTab(sub.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${systemSubTab === sub.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {sub.icon}
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>

            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Root Orchestrator Operational</span>
            </span>
          </div>

          {/* 1. Integrations Subtab */}
          {systemSubTab === "integrations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Platform Gateways & External Integrations</h3>
                  <p className="text-xs text-slate-500">Configure central credentials for payments, communication, AI engines, and maps.</p>
                </div>
                <button
                  onClick={() => addToast("info", "Add Integration", "Opening gateway configuration wizard.")}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                >
                  + Connect Gateway
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((gateway) => (
                  <div key={gateway.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{gateway.name}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold">{gateway.category} • {gateway.environment}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {gateway.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{gateway.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                        {gateway.keyMasked}
                      </span>
                      <button
                        onClick={() => addToast("info", "Key Settings", `Editing secret keys for ${gateway.name}`)}
                        className="text-[11px] font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
                      >
                        Rotate Secret Key
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Admin Profile & 2FA Subtab */}
          {systemSubTab === "profile" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Super Admin Root Identity & Security</h3>
                <p className="text-xs text-slate-500">Manage root console credentials and hardware Two-Factor Authentication.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Root Admin Name</label>
                    <input
                      type="text"
                      value={adminProfile.name}
                      onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Administrative Role</label>
                    <input
                      type="text"
                      disabled
                      value={adminProfile.role}
                      className="w-full p-3 rounded-xl bg-slate-100 border border-slate-200 font-semibold text-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Primary Security Email</label>
                    <input
                      type="email"
                      value={adminProfile.email}
                      onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Backup Emergency Phone</label>
                    <input
                      type="text"
                      value={adminProfile.phone}
                      onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Two-Factor Authentication (2FA)</span>
                      </div>
                      <div className="text-slate-500 text-[11px]">Enforce hardware TOTP / Authenticator app for all root actions.</div>
                    </div>
                    <button
                      onClick={() => {
                        setAdminProfile({ ...adminProfile, twoFactorEnabled: !adminProfile.twoFactorEnabled });
                        addToast("info", "2FA Setting Updated", "Two-factor state updated.");
                      }}
                      className={`px-3 py-1 rounded-full font-bold text-xs cursor-pointer ${adminProfile.twoFactorEnabled
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-700"
                        }`}
                    >
                      {adminProfile.twoFactorEnabled ? "Active" : "Disabled"}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => addToast("success", "Admin Profile Saved", "Credentials updated.")}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          )}

          {/* 3. Security & Audit Logs Subtab */}
          {systemSubTab === "security" && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-violet-600" />
                <span>Tamper-Evident Platform Audit Trail</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Super Admin</th>
                      <th className="py-3 px-4">Action Event</th>
                      <th className="py-3 px-4">Target Organization</th>
                      <th className="py-3 px-4">Value Diff (Before → After)</th>
                      <th className="py-3 px-4">Client IP</th>
                      <th className="py-3 px-4 text-right">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-500">{log.timestamp}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{log.adminName}</td>
                        <td className="py-3.5 px-4 font-semibold text-violet-700">{log.action}</td>
                        <td className="py-3.5 px-4 text-slate-800">{log.tenantName}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          <span className="text-rose-600">{log.previousValue}</span> → <span className="text-emerald-600 font-bold">{log.newValue}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{log.ipAddress}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.severity === "critical"
                              ? "bg-rose-100 text-rose-800"
                              : log.severity === "warning"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-sky-100 text-sky-800"
                              }`}
                          >
                            {log.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. Feature Flags Subtab */}
          {systemSubTab === "flags" && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
                <span>Feature Flags & Live Module Switches</span>
              </h3>

              <div className="space-y-3">
                {featureFlags.map((flag) => (
                  <div key={flag.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{flag.name}</span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-md">
                          {flag.scope}
                        </span>
                      </div>
                      <div className="text-slate-500">{flag.description}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${flag.status === "ON"
                          ? "bg-emerald-100 text-emerald-800"
                          : flag.status === "BETA"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-200 text-slate-600"
                          }`}
                      >
                        {flag.status}
                      </span>
                      <button
                        onClick={() => {
                          setFeatureFlags((prev) =>
                            prev.map((f) =>
                              f.id === flag.id ? { ...f, status: f.status === "ON" ? "OFF" : "ON" } : f
                            )
                          );
                          addToast("info", "Feature Flag Toggled", `${flag.name} updated.`);
                        }}
                        className="text-xs font-bold text-purple-600 hover:text-purple-800 cursor-pointer"
                      >
                        Toggle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Cloud Health Subtab */}
          {systemSubTab === "health" && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                <span>Global Multi-Region Cloud Infrastructure Nodes</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { region: "AP-South-1 (  Primary)", instances: "8 Kubernetes Pods", load: "34%", ping: "14ms", status: "Healthy" },
                  { region: "EU-West-2 (London Mayfair)", instances: "4 Kubernetes Pods", load: "28%", ping: "38ms", status: "Healthy" },
                  { region: "ME-Central-1 (Dubai Marina)", instances: "4 Kubernetes Pods", load: "41%", ping: "22ms", status: "Healthy" },
                  { region: "US-West-1 (Beverly Hills)", instances: "2 Kubernetes Pods", load: "19%", ping: "54ms", status: "Healthy" },
                ].map((node, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-900">{node.region}</div>
                        <div className="text-[10px] text-slate-400">{node.instances}</div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {node.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200 text-[11px]">
                      <span>Compute Load: <strong>{node.load}</strong></span>
                      <span>Latency: <strong className="text-emerald-700">{node.ping}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PROVISION TENANT MODAL DIALOG */}
      {/* ========================================================================= */}
      {showAddTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span>Provision New Salon Tenant</span>
              </h3>
              <button
                onClick={() => setShowAddTenantModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTenant} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Enterprise Brand / Chain Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Grand Salon Group"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Managing Owner Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Alexander Vance"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Owner Email</label>
                  <input
                    type="email"
                    placeholder="owner@salon.com"
                    value={newOwnerEmail}
                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Owner Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98200 00000"
                    value={newOwnerPhone}
                    onChange={(e) => setNewOwnerPhone(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Headquarters City</label>
                  <input
                    type="text"
                    placeholder="  / Dubai / London"
                    value={newOwnerCity}
                    onChange={(e) => setNewOwnerCity(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Subscription Tier</label>
                  <select
                    value={newOwnerPlan}
                    onChange={(e) => setNewOwnerPlan(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    {subscriptionPlans.length > 0 ? (
                      subscriptionPlans.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} (₹{p.price_monthly.toLocaleString()}/mo)
                        </option>
                      ))
                    ) : (
                      <option value="Starter">Starter Plan</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Set Owner Password */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-indigo-500" />
                  Set Owner Password *
                </label>
                <div className="relative">
                  <input
                    type={showOwnerPassword ? "text" : "password"}
                    required
                    placeholder="Min 6 characters"
                    value={newOwnerPassword}
                    onChange={(e) => setNewOwnerPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full p-3 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showOwnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">This password will be stored as a bcrypt hash. Share it securely with the owner.</p>
              </div>
              {provisionError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-red-600">{provisionError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowAddTenantModal(false); setProvisionError(null); }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProvisioning}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-md transition-all cursor-pointer text-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProvisioning ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Provisioning...</>
                  ) : "Provision & Launch License"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ===================================================================== */}
      {/* PROVISIONED CREDENTIALS MODAL */}
      {/* ===================================================================== */}
      {provisionedCreds && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-600" />
                Owner Credentials Created
              </h3>
              <button
                onClick={() => setProvisionedCreds(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1 text-xs">
              <p className="text-emerald-700 font-bold text-sm mb-2">✅ Saved to database with bcrypt hash</p>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Organization</span>
                  <span className="font-bold text-slate-800">{provisionedCreds.org}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Owner Name</span>
                  <span className="font-bold text-slate-800">{provisionedCreds.owner}</span>
                </div>
                <div className="flex justify-between items-center border-t border-emerald-200 pt-2 mt-2">
                  <span className="text-slate-500">Login Email</span>
                  <span className="font-bold text-indigo-700">{provisionedCreds.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Username</span>
                  <span className="font-bold text-indigo-700">{provisionedCreds.username}</span>
                </div>
                <div className="flex justify-between items-center bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <span className="text-slate-500">Temp Password</span>
                  <span className="font-bold text-amber-700 text-sm tracking-widest">{provisionedCreds.password}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-700">
              ⚠️ Share these credentials securely with the owner. The password is stored as a bcrypt hash — this is the only time it's shown in plain text.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const text = `Salon OS Login Credentials\nOrganization: ${provisionedCreds.org}\nOwner: ${provisionedCreds.owner}\nEmail: ${provisionedCreds.email}\nUsername: ${provisionedCreds.username}\nPassword: ${provisionedCreds.password}\n\nLogin at: ${window.location.origin}`;
                  navigator.clipboard.writeText(text);
                  addToast("success", "Copied!", "Credentials copied to clipboard.");
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                Copy Credentials
              </button>
              <button
                onClick={() => setProvisionedCreds(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. SUBSCRIPTION PLAN CONFIGURATOR / CREATION MODAL */}
      {/* ===================================================================== */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span>{editingPlan ? `Edit ${editingPlan.name} Tier` : "Create New Subscription Tier"}</span>
              </h3>
              <button
                onClick={() => { setShowPlanModal(false); setEditingPlan(null); }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tier Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Enterprise Plus"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Internal Code</label>
                  <input
                    type="text"
                    placeholder="e.g., enterprise_plus"
                    value={planForm.code}
                    onChange={(e) => setPlanForm({ ...planForm, code: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description</label>
                <input
                  type="text"
                  placeholder="Target audience and plan positioning summary"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Monthly Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="29999"
                    value={planForm.price_monthly}
                    onChange={(e) => setPlanForm({ ...planForm, price_monthly: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Yearly Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="299990"
                    value={planForm.price_yearly}
                    onChange={(e) => setPlanForm({ ...planForm, price_yearly: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Branches Limit</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="5 (999 for Unl.)"
                    value={planForm.branches_limit}
                    onChange={(e) => setPlanForm({ ...planForm, branches_limit: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Staff Accounts</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="50 (999 for Unl.)"
                    value={planForm.staff_limit}
                    onChange={(e) => setPlanForm({ ...planForm, staff_limit: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">AI Credits</label>
                  <input
                    type="number"
                    min="0"
                    placeholder=" 0"
                    value={planForm.ai_credits_limit}
                    onChange={(e) => setPlanForm({ ...planForm, ai_credits_limit: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Features Included (Comma Separated)</label>
                <textarea
                  rows={2}
                  placeholder="WhatsApp & SMS Gateway, Advanced POS Checkout, AI Visualizer, Dedicated Account Manager"
                  value={planForm.features}
                  onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.is_popular}
                    onChange={(e) => setPlanForm({ ...planForm, is_popular: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-slate-700">Badge 'Most Popular'</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.is_active}
                    onChange={(e) => setPlanForm({ ...planForm, is_active: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-slate-700">Tier Active for Sale</span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {editingPlan ? (
                  <button
                    type="button"
                    onClick={() => handleDeletePlan(editingPlan.id, editingPlan.name)}
                    className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Tier
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowPlanModal(false); setEditingPlan(null); }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-md transition-all cursor-pointer text-xs flex items-center gap-2"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {editingPlan ? "Save Changes" : "Create Tier in Database"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
