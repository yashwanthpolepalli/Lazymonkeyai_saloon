"use client";

import React, { useState, useMemo } from "react";
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

// ==========================================
// DATA TYPES & INTERFACES FOR SUPER ADMIN
// ==========================================
export interface TenantOwner {
  id: string;
  name: string;
  brandName: string;
  email: string;
  phone: string;
  plan: "Starter" | "Professional" | "Business" | "Enterprise";
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
  const { activeSubTab, setActiveSubTab, addToast } = useSalon();

  // Search, Filter & Drill-down state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<TenantOwner | null>(null);
  const [ownerDrillTab, setOwnerDrillTab] = useState<
    "overview" | "branches" | "staff" | "customers" | "bookings" | "finance" | "ai"
  >("overview");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState("");

  // System Tab Internal Navigation
  const [systemSubTab, setSystemSubTab] = useState<
    "integrations" | "profile" | "security" | "flags" | "health"
  >("integrations");

  // Modals state
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  // New Tenant Form state
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [newOwnerPhone, setNewOwnerPhone] = useState("");
  const [newOwnerCity, setNewOwnerCity] = useState("Mumbai");
  const [newOwnerPlan, setNewOwnerPlan] = useState<"Starter" | "Professional" | "Business" | "Enterprise">("Business");

  // Admin Profile State
  const [adminProfile, setAdminProfile] = useState({
    name: "Alexander Vance",
    role: "Super Admin Root",
    email: "admin.root@lazymonkeyai.luxury",
    phone: "+91 98200 99999",
    twoFactorEnabled: true,
    ipRestrictionsEnabled: true,
  });

  // 1. TENANT ORGANIZATIONS (MOCK DATA)
  const [tenants, setTenants] = useState<TenantOwner[]>([
    {
      id: "org_01",
      name: "Priya Reddy",
      brandName: "Glam Studio Luxury Chain",
      email: "priya.reddy@glamstudio.luxury",
      phone: "+91 98200 44122",
      plan: "Business",
      status: "Active",
      branchesCount: 4,
      staffCount: 38,
      customersCount: 3840,
      bookingsCount: 1842,
      mrr: 29999,
      joinedDate: "14 Jan 2025",
      renewalDate: "14 Oct 2026",
      city: "Hyderabad",
      country: "India",
      aiCreditsUsed: 18240,
      aiCreditsLimit: 50000,
    },
    {
      id: "org_02",
      name: "Alexander Vance",
      brandName: "LazyMonkey AI Flagship Group",
      email: "alexander.vance@lazymonkeyai.luxury",
      phone: "+91 98200 12345",
      plan: "Enterprise",
      status: "Active",
      branchesCount: 8,
      staffCount: 94,
      customersCount: 14200,
      bookingsCount: 8940,
      mrr: 79999,
      joinedDate: "02 Nov 2024",
      renewalDate: "02 Nov 2026",
      city: "Mumbai",
      country: "India",
      aiCreditsUsed: 64200,
      aiCreditsLimit: 200000,
    },
    {
      id: "org_03",
      name: "Camille Dupont",
      brandName: "Maison De Beauté Paris",
      email: "camille@maisonbeaute.fr",
      phone: "+33 1 42 68 55 00",
      plan: "Enterprise",
      status: "Active",
      branchesCount: 3,
      staffCount: 42,
      customersCount: 5120,
      bookingsCount: 3200,
      mrr: 79999,
      joinedDate: "10 Mar 2025",
      renewalDate: "10 Dec 2026",
      city: "London Mayfair",
      country: "United Kingdom",
      aiCreditsUsed: 31200,
      aiCreditsLimit: 200000,
    },
    {
      id: "org_04",
      name: "Zayn Al-Mansoor",
      brandName: "Royale Couture Lounge Dubai",
      email: "zayn@royalecouture.ae",
      phone: "+971 4 399 2200",
      plan: "Business",
      status: "Active",
      branchesCount: 2,
      staffCount: 24,
      customersCount: 2840,
      bookingsCount: 1420,
      mrr: 29999,
      joinedDate: "05 Jun 2025",
      renewalDate: "05 Nov 2026",
      city: "Dubai Marina",
      country: "United Arab Emirates",
      aiCreditsUsed: 22400,
      aiCreditsLimit: 50000,
    },
    {
      id: "org_05",
      name: "Rohit Verma",
      brandName: "Urban Glow Hair & Aesthetics",
      email: "rohit@urbanglow.in",
      phone: "+91 98450 11998",
      plan: "Professional",
      status: "Active",
      branchesCount: 2,
      staffCount: 16,
      customersCount: 1940,
      bookingsCount: 880,
      mrr: 14999,
      joinedDate: "18 Aug 2025",
      renewalDate: "18 Oct 2026",
      city: "Bengaluru",
      country: "India",
      aiCreditsUsed: 8900,
      aiCreditsLimit: 20000,
    },
  ]);

  // 2. MASTER UNIVERSAL SERVICE CATALOG
  const [masterCatalog, setMasterCatalog] = useState<MasterServiceItem[]>([
    {
      id: "svc_m_01",
      category: "Hair Care & Couture",
      subcategory: "Styling & Cuts",
      name: "Signature Royal Hair Botox Treatment",
      audience: "unisex",
      defaultDurationMin: 90,
      recommendedPriceINR: 5500,
      status: "active",
      tenantAdoptions: 24,
    },
    {
      id: "svc_m_02",
      category: "Hair Care & Couture",
      subcategory: "Coloring",
      name: "French Balayage & Glossing Fusion",
      audience: "women",
      defaultDurationMin: 120,
      recommendedPriceINR: 7800,
      status: "active",
      tenantAdoptions: 31,
    },
    {
      id: "svc_m_03",
      category: "Aesthetics & Advanced Skin",
      subcategory: "Hydrafacial",
      name: "24K Liquid Gold Hydrafacial & LED",
      audience: "women",
      defaultDurationMin: 60,
      recommendedPriceINR: 6500,
      status: "active",
      tenantAdoptions: 42,
    },
    {
      id: "svc_m_04",
      category: "Bridal & VIP Suites",
      subcategory: "Bridal Couture",
      name: "Bespoke Royal Bridal Makeup & Draping",
      audience: "women",
      defaultDurationMin: 180,
      recommendedPriceINR: 22000,
      status: "active",
      tenantAdoptions: 19,
    },
    {
      id: "svc_m_05",
      category: "Men's Luxury Grooming",
      subcategory: "Beard & Shave",
      name: "Turkish Hot Towel Beard Sculpt & Charcoal Mask",
      audience: "men",
      defaultDurationMin: 45,
      recommendedPriceINR: 2400,
      status: "active",
      tenantAdoptions: 28,
    },
    {
      id: "svc_m_06",
      category: "Body Spa & Wellness",
      subcategory: "Aromatherapy",
      name: "Swedish Deep Tissue Lava Stone Ritual",
      audience: "unisex",
      defaultDurationMin: 75,
      recommendedPriceINR: 4800,
      status: "active",
      tenantAdoptions: 36,
    },
  ]);

  // 3. SUPPORT TICKETS
  const [supportTickets, setSupportTickets] = useState<SupportTicketItem[]>([
    {
      id: "TCK-10482",
      tenantId: "org_01",
      tenantName: "Glam Studio Luxury Chain",
      subject: "Payment webhook timeout during multi-branch subscription renewal",
      category: "Billing",
      priority: "Urgent",
      status: "Open",
      createdAt: "10 mins ago",
      slaBreachHours: 2,
      assignedTo: "Platform DevOps",
      messages: [
        {
          id: "m_1",
          sender: "Priya Reddy",
          role: "owner",
          time: "10 mins ago",
          text: "Hi Super Admin team, our Razorpay webhook failed on the Jubilee Hills branch card renewal. Please check the transaction logs.",
        },
        {
          id: "m_2",
          sender: "System Bot",
          role: "system",
          time: "9 mins ago",
          text: "Automated Telemetry: Gateway HTTP 504 verified on node ap-south-1. Re-queuing transaction.",
        },
      ],
    },
    {
      id: "TCK-10480",
      tenantId: "org_03",
      tenantName: "Maison De Beauté Paris",
      subject: "Requesting additional 50,000 AI Hairstyle recommendation credits",
      category: "AI Feature",
      priority: "High",
      status: "In Progress",
      createdAt: "1 hour ago",
      slaBreachHours: 6,
      assignedTo: "AI Product Lead",
      messages: [
        {
          id: "m_1",
          sender: "Camille Dupont",
          role: "owner",
          time: "1 hour ago",
          text: "We are launching the London Fashion Week pop-up and will exceed our 200k monthly AI quota. Can we provision an add-on bundle?",
        },
      ],
    },
    {
      id: "TCK-10475",
      tenantId: "org_05",
      tenantName: "Urban Glow Hair & Aesthetics",
      subject: "Biometric Face Recognition Sync with Attendance Module",
      category: "Staff HRMS",
      priority: "Normal",
      status: "Resolved",
      createdAt: "5 hours ago",
      slaBreachHours: 12,
      assignedTo: "Hardware & IoT Support",
      messages: [
        {
          id: "m_1",
          sender: "Rohit Verma",
          role: "owner",
          time: "5 hours ago",
          text: "Device IP configured for Bengaluru branch. Face scanner tokens verified.",
        },
      ],
    },
  ]);

  // 4. AUDIT LOGS
  const [auditLogs] = useState<AuditLogItem[]>([
    {
      id: "AUD-9912",
      adminName: "Super Admin Root",
      action: "Upgraded Tenant Plan",
      tenantName: "Glam Studio Luxury Chain",
      previousValue: "Professional (₹14,999)",
      newValue: "Business (₹29,999)",
      ipAddress: "103.21.244.18",
      timestamp: "Today · 21:43",
      severity: "warning",
    },
    {
      id: "AUD-9911",
      adminName: "Super Admin Root",
      action: "Provisioned Global AI Credits",
      tenantName: "LazyMonkey AI Flagship Group",
      previousValue: "100,000 Tokens",
      newValue: "200,000 Tokens",
      ipAddress: "103.21.244.18",
      timestamp: "Today · 19:15",
      severity: "info",
    },
    {
      id: "AUD-9910",
      adminName: "DevOps Security",
      action: "Rotated Razorpay Webhook Secret",
      tenantName: "Platform Level (All Tenants)",
      previousValue: "sec_live_***92a",
      newValue: "sec_live_***88c",
      ipAddress: "172.68.22.91",
      timestamp: "Today · 14:02",
      severity: "critical",
    },
  ]);

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
    { id: "int_01", name: "Razorpay Multi-Account Gateway", category: "Payment", iconName: "CreditCard", status: "Connected", description: "Indian UPI, Cards & Netbanking auto-routing with webhook verification.", environment: "Production", lastPing: "2 mins ago", keyMasked: "rzp_live_***8942a" },
    { id: "int_02", name: "Stripe Global Connect", category: "Payment", iconName: "CreditCard", status: "Connected", description: "Multi-currency processing for Dubai, London, and US branches.", environment: "Production", lastPing: "1 min ago", keyMasked: "pk_live_***4491b" },
    { id: "int_03", name: "Twilio WhatsApp Business Cloud", category: "Messaging", iconName: "MessageSquare", status: "Connected", description: "Automated interactive appointment confirmations & digital receipts.", environment: "Production", lastPing: "4 mins ago", keyMasked: "AC_live_***9921c" },
    { id: "int_04", name: "Resend Transactional Email", category: "Messaging", iconName: "Mail", status: "Connected", description: "High-deliverability SMTP & API for invoices, OTPs, and notifications.", environment: "Production", lastPing: "10 mins ago", keyMasked: "re_***7712d" },
    { id: "int_05", name: "Google Gemini 3.7 Pro & Vision API", category: "AI & LLM", iconName: "Sparkles", status: "Connected", description: "Core LLM backend for hairstyle rendering, marketing copilot, and analytics.", environment: "Production", lastPing: "30 secs ago", keyMasked: "AIzaSy***6632e" },
    { id: "int_06", name: "Google Calendar & Maps Sync", category: "Calendar & Maps", iconName: "Calendar", status: "Configured", description: "Real-time client calendar invites and salon GPS coordinates routing.", environment: "Production", lastPing: "15 mins ago", keyMasked: "gcal_***3319f" },
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

  // Handler for adding a tenant
  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerName.trim() || !newBrandName.trim()) return;

    const newTenant: TenantOwner = {
      id: `org_0${tenants.length + 1}`,
      name: newOwnerName,
      brandName: newBrandName,
      email: newOwnerEmail || `contact@${newBrandName.toLowerCase().replace(/\s+/g, "")}.com`,
      phone: newOwnerPhone || "+91 98000 00000",
      plan: newOwnerPlan,
      status: "Active",
      branchesCount: 1,
      staffCount: 8,
      customersCount: 150,
      bookingsCount: 45,
      mrr: newOwnerPlan === "Enterprise" ? 79999 : newOwnerPlan === "Business" ? 29999 : 14999,
      joinedDate: "Today",
      renewalDate: "07 Oct 2026",
      city: newOwnerCity,
      country: "India",
      aiCreditsUsed: 0,
      aiCreditsLimit: newOwnerPlan === "Enterprise" ? 200000 : 50000,
    };

    setTenants((prev) => [newTenant, ...prev]);
    addToast("success", "Tenant Organization Provisioned", `${newTenant.brandName} is now live on LazyMonkey AI Platform.`);
    setNewOwnerName("");
    setNewBrandName("");
    setShowAddTenantModal(false);
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
          onAction: () => addToast("info", "Plan Config", "Opening subscription tier configurator."),
          metrics: [
            { label: "Monthly MRR", value: `₹${(platformStats.totalMRR / 100000).toFixed(1)}L`, change: "+18.6% Growth", icon: <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> },
            { label: "Projected ARR", value: `₹${((platformStats.totalMRR * 12) / 10000000).toFixed(2)}Cr`, change: "Annual Run-Rate", icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> },
            { label: "Paid Subscriptions", value: `${platformStats.activeTenantsCount} Active`, change: "Zero Churn", icon: <CreditCard className="w-3.5 h-3.5 text-teal-400" /> },
            { label: "Average ARPU", value: `₹${(platformStats.totalMRR / platformStats.activeTenantsCount).toFixed(0)}`, change: "Per Owner", icon: <BarChart3 className="w-3.5 h-3.5 text-sky-400" /> },
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
                  { name: "AP-South (Mumbai Primary)", ping: "14ms", status: "Healthy", load: "34%" },
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
                            className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                              t.plan === "Enterprise"
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
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-3">
                      <span>Owner: <strong>{selectedOwner.name}</strong></span>
                      <span>•</span>
                      <span>{selectedOwner.email}</span>
                      <span>•</span>
                      <span>{selectedOwner.phone}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">{selectedOwner.city}, {selectedOwner.country}</span>
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
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      ownerDrillTab === tab.id
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-900">Tenant License Summary</h4>
                    <div className="space-y-2 text-xs text-slate-700">
                      <div className="flex justify-between"><span>Subscription MRR:</span><strong className="text-emerald-700 font-bold">₹{selectedOwner.mrr.toLocaleString()}/mo</strong></div>
                      <div className="flex justify-between"><span>Joined Platform:</span><strong>{selectedOwner.joinedDate}</strong></div>
                      <div className="flex justify-between"><span>Next Renewal Date:</span><strong>{selectedOwner.renewalDate}</strong></div>
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
                          style={{ width: `${(selectedOwner.aiCreditsUsed / selectedOwner.aiCreditsLimit) * 100}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">
                        {((selectedOwner.aiCreditsUsed / selectedOwner.aiCreditsLimit) * 100).toFixed(1)}% used
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Tenant Franchise Directory</h3>
                  <p className="text-xs text-slate-500">Select any salon enterprise to inspect their complete multi-branch hierarchy.</p>
                </div>
                <button
                  onClick={() => setShowAddTenantModal(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 cursor-pointer"
                >
                  + Add New Owner
                </button>
              </div>

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
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: SAAS FINANCE & SUBSCRIPTIONS --- */}
      {activeSubTab === "finance" && (
        <div className="space-y-6">
          {/* SaaS Pricing Plans Configurator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: "Starter", price: "₹4,999", period: "/mo", branches: 1, staff: 5, ai: "5k credits", color: "border-slate-200 bg-white" },
              { name: "Professional", price: "₹14,999", period: "/mo", branches: 2, staff: 15, ai: "20k credits", color: "border-sky-200 bg-sky-50/30" },
              { name: "Business", price: "₹29,999", period: "/mo", branches: 5, staff: 50, ai: "50k credits", color: "border-purple-300 bg-purple-50/40", popular: true },
              { name: "Enterprise", price: "₹79,999", period: "/mo", branches: "Unlimited", staff: "Unlimited", ai: "200k credits", color: "border-amber-300 bg-amber-50/40" },
            ].map((plan, i) => (
              <div key={i} className={`p-6 rounded-3xl border shadow-xs space-y-4 ${plan.color} relative`}>
                {plan.popular && (
                  <span className="absolute -top-3 right-6 bg-purple-600 text-white text-[10px] uppercase font-bold px-3 py-0.5 rounded-full shadow-xs">
                    Most Popular
                  </span>
                )}
                <div>
                  <h4 className="text-base font-bold text-slate-900">{plan.name} Tier</h4>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    {plan.price}<span className="text-xs font-normal text-slate-500">{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 border-t border-slate-200 pt-3">
                  <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /><span><strong>{plan.branches}</strong> Branch License</span></div>
                  <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /><span><strong>{plan.staff}</strong> Staff Accounts</span></div>
                  <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /><span><strong>{plan.ai}</strong> for AI Hairstyle & POS</span></div>
                  <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /><span>WhatsApp & SMS Gateway</span></div>
                </div>

                <button
                  onClick={() => addToast("info", "Plan Config", `Editing limits for ${plan.name} tier.`)}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Configure Tier Limits
                </button>
              </div>
            ))}
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
                      { city: "Mumbai", gmv: 62 },
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
                {[
                  { tier: "Enterprise Unlimited (₹79,999/mo)", count: 2, pct: "40%", color: "bg-amber-500" },
                  { tier: "Business Standard (₹29,999/mo)", count: 2, pct: "40%", color: "bg-purple-500" },
                  { tier: "Professional Growth (₹14,999/mo)", count: 1, pct: "20%", color: "bg-sky-500" },
                  { tier: "Starter Franchise (₹4,999/mo)", count: 0, pct: "0%", color: "bg-slate-400" },
                ].map((item, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{item.tier}</span>
                      <span>{item.count} Tenants ({item.pct})</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: item.pct }} />
                    </div>
                  </div>
                ))}
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
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selectedTicket?.id === ticket.id
                      ? "border-rose-500 bg-rose-50/40 shadow-xs"
                      : "border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-rose-700">{ticket.id}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ticket.priority === "Urgent"
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
                      className={`p-3 rounded-2xl space-y-1 ${
                        m.role === "superadmin"
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
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    systemSubTab === sub.id
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
                      className={`px-3 py-1 rounded-full font-bold text-xs cursor-pointer ${
                        adminProfile.twoFactorEnabled
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
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              log.severity === "critical"
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
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          flag.status === "ON"
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
                  { region: "AP-South-1 (Mumbai Primary)", instances: "8 Kubernetes Pods", load: "34%", ping: "14ms", status: "Healthy" },
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
                  placeholder="e.g., Beverly Hills Haute Aesthetics"
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
                    placeholder="Mumbai / Dubai / London"
                    value={newOwnerCity}
                    onChange={(e) => setNewOwnerCity(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Subscription Tier</label>
                  <select
                    value={newOwnerPlan}
                    onChange={(e) => setNewOwnerPlan(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value="Starter">Starter (₹4,999/mo)</option>
                    <option value="Professional">Professional (₹14,999/mo)</option>
                    <option value="Business">Business (₹29,999/mo)</option>
                    <option value="Enterprise">Enterprise (₹79,999/mo)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-md transition-all cursor-pointer"
                >
                  Provision & Launch License
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
