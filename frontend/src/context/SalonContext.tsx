"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import {
  Branch,
  Role,
  Service,
  Stylist,
  Customer,
  Appointment,
  InventoryProduct,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  Lead,
  Campaign,
  Coupon,
  FinancialExpense,
  CustomerTicket,
  CartItem,
  Invoice,
  SplitPayment,
  OwnerProfile,
  MFASettings,
  SalonCustomization,
  GSTDiscountSettings,
  TimeSlotConfig,
  AppointmentStatus,
  Organization,
  BusinessType,
  PolicyConfig,
  ApprovalRequest,
  AuditLog,
  ServiceAllocation,
  AuthUser,
  StylistTier,
} from "@/types";
import {
  MOCK_BRANCHES,
  MOCK_CATEGORIES,
  MOCK_SERVICES,
  MOCK_STYLISTS,
  MOCK_CUSTOMERS,
  MOCK_APPOINTMENTS,
  MOCK_INVENTORY,
  MOCK_EMPLOYEES,
  MOCK_ATTENDANCE,
  MOCK_LEAVES,
  MOCK_LEADS,
  MOCK_CAMPAIGNS,
  MOCK_COUPONS,
  MOCK_EXPENSES,
  MOCK_TICKETS,
  MOCK_MEMBERSHIPS,
  DEFAULT_TIME_SLOTS,
} from "@/data/mockData";
import { generateId, normalizeSlotTime, sortTimeSlots } from "@/lib/utils";
import {
  BranchService,
  SalonCatalogService,
  AppointmentService,
  CRMService,
  POSService,
  HRMSService,
  InventoryService,
  ERPService,
  SettingsService,
  OrganizationService,
  ApprovalService,
  AuditLogService,
  AllocationService,
  AuthService,
} from "@/services/apiClient";


export type OwnerModule =
  | "workspace"
  | "operations"
  | "pos"
  | "crm"
  | "hrms"
  | "inventory"
  | "marketing"
  | "finance"
  | "analytics"
  | "customer-service"
  | "ai"
  | "governance"
  | "system";

export interface ToastMessage {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
}

export const DEFAULT_POLICY_CONFIG: PolicyConfig = {
  multi_branch_enabled: true,
  approval_required: false,
  inventory_enabled: true,
  central_warehouse_enabled: false,
  payroll_enabled: true,
  commission_enabled: true,
  membership_enabled: true,
  marketing_enabled: true,
  audit_enabled: true,
  internal_entitlement_mode: false,
  budget_tracking_enabled: false,
  pos_mode: "retail_pos",
  departments: ["Hair Styling", "Skin Care & Aesthetics", "Nail Studio", "Wellness & Spa"],
};

export const DEFAULT_ORGANIZATIONS: Organization[] = [];

export const EMPTY_ORGANIZATION: Organization = {
  id: "",
  name: "",
  code: "",
  business_type: "general",
  brand_tagline: "",
  logo: "",
  currency: "",
  tax_rate: 0,
  gstin_or_tax_id: "",
  is_active: true,
  policy_config: DEFAULT_POLICY_CONFIG,
};

interface SalonContextType {
  // Navigation & Role State
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
  loginUser: (user: AuthUser, token?: string) => void;
  logoutUser: () => void;

  // Organization & Multi-Tenant Policy Engine
  currentOrganization: Organization;
  organizations: Organization[];
  setOrganization: (org: Organization) => void;
  policyConfig: PolicyConfig;
  updatePolicyConfig: (updates: Partial<PolicyConfig>) => void;

  // Governance & Institutional Workflows
  approvals: ApprovalRequest[];
  addApprovalRequest: (req: Partial<ApprovalRequest>) => Promise<void>;
  decideApproval: (id: string, status: "approved" | "rejected", notes?: string) => Promise<void>;
  auditLogs: AuditLog[];
  recordAuditLog: (log: Partial<AuditLog>) => Promise<void>;
  serviceAllocations: ServiceAllocation[];
  addServiceAllocation: (alloc: Partial<ServiceAllocation>) => Promise<void>;
  consumeAllocation: (id: string) => Promise<void>;

  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  selectedBranch: Branch;
  branches: Branch[];
  setBranches: React.Dispatch<React.SetStateAction<Branch[]>>;
  addBranch: (branch: Partial<Branch>) => Branch;
  deleteBranch: (branchId: string) => void;
  activeModule: OwnerModule;
  setActiveModule: (module: OwnerModule) => void;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // Active Current User context
  currentCustomer: Customer;
  setCurrentCustomer: (c: Customer) => void;
  currentStaff: Employee;

  // Settings & System Customization
  ownerProfile: OwnerProfile;
  setOwnerProfile: React.Dispatch<React.SetStateAction<OwnerProfile>>;
  updateOwnerProfile: (updates: Partial<OwnerProfile>) => void;
  mfaSettings: MFASettings;
  setMfaSettings: React.Dispatch<React.SetStateAction<MFASettings>>;
  toggleMfaMaster: (enabled: boolean) => void;
  togglePageMfa: (pageKey: keyof MFASettings["pageProtection"], enabled: boolean) => void;
  customizationSettings: SalonCustomization;
  setCustomizationSettings: React.Dispatch<React.SetStateAction<SalonCustomization>>;
  updateCustomization: (updates: Partial<SalonCustomization>) => void;
  gstSettings: GSTDiscountSettings;
  setGstSettings: React.Dispatch<React.SetStateAction<GSTDiscountSettings>>;
  updateGstSettings: (updates: Partial<GSTDiscountSettings>) => void;

  // Shared Data
  hydrateFromBackend: () => Promise<void>;
  categories: typeof MOCK_CATEGORIES;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  filteredServices: Service[];
  stylists: Stylist[];
  filteredStylists: Stylist[];
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  appointments: Appointment[];
  branchAppointments: Appointment[];
  inventory: InventoryProduct[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryProduct[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  leads: Lead[];
  campaigns: Campaign[];
  coupons: Coupon[];
  expenses: FinancialExpense[];
  tickets: CustomerTicket[];
  memberships: typeof MOCK_MEMBERSHIPS;
  invoices: Invoice[];
  timeSlots: TimeSlotConfig[];
  setTimeSlots: React.Dispatch<React.SetStateAction<TimeSlotConfig[]>>;

  // POS & Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  processPOSCheckout: (customerId: string, payments: SplitPayment[], notes?: string) => Invoice;

  // Mutations
  addAppointment: (appointment: Omit<Appointment, "id" | "bookingRef" | "createdAt">) => Appointment;
  bookAppointment: (appointment: any) => Appointment;
  rescheduleAppointment: (id: string, newDate: string, newTimeSlot: string, newStylistId?: string) => void;
  toggleSlotAvailability: (slotId: string, isAvailable: boolean, reason?: string) => void;
  updateSlotConfig: (slotId: string, updates: Partial<TimeSlotConfig>) => void;
  addCustomSlot: (time: string, branchId?: string, stylistId?: string, allowedGenders?: any[], allowedCategories?: string[], slotType?: any) => void;
  deleteSlot: (slotId: string) => void;
  addCustomer: (customer: Partial<Customer>) => Customer;
  bulkAddCustomers: (newCustomers: Partial<Customer>[], replace?: boolean) => void;
  addService: (service: Partial<Service>) => Service;
  bulkAddServices: (newServices: Partial<Service>[], replace?: boolean) => void;
  bulkAddInventory: (newItems: Partial<InventoryProduct>[], replace?: boolean) => void;
  addEmployee: (employee: Partial<Employee>) => Employee;
  updateAppointmentStatus: (id: string, status: Appointment["status"]) => void;
  updateAppointmentDetails: (id: string, updates: Partial<Appointment>) => void;
  deductInventory: (productId: string, branchId: string, quantity: number, reason: string) => void;
  restockInventory: (productId: string, branchId: string, quantity: number) => void;
  transferStock: (productId: string, fromBranchId: string, toBranchId: string, quantity: number) => void;
  addLead: (lead: Omit<Lead, "id" | "createdDate">) => void;
  updateLeadStage: (id: string, stage: Lead["stage"]) => void;
  addLeaveRequest: (req: Omit<LeaveRequest, "id" | "status">) => void;
  updateLeaveStatus: (id: string, status: LeaveRequest["status"]) => void;
  clockInEmployee: (employeeId: string) => void;
  clockOutEmployee: (employeeId: string) => void;
  createTicket: (ticket: Omit<CustomerTicket, "id" | "ticketNumber" | "createdAt">) => void;
  replyToTicket: (ticketId: string, text: string, senderRole: "customer" | "staff" | "manager") => void;

  // Global Toast & Notification System
  toasts: ToastMessage[];
  addToast: (type: "success" | "error" | "info" | "warning", title: string, description?: string) => void;
  removeToast: (id: string) => void;
}

export const defaultSalonContext: SalonContextType = {
  activeRole: "owner",
  setActiveRole: () => {},
  currentUser: null,
  setCurrentUser: () => {},
  loginUser: () => {},
  logoutUser: () => {},
  currentOrganization: EMPTY_ORGANIZATION,
  organizations: [],
  setOrganization: () => {},
  policyConfig: DEFAULT_POLICY_CONFIG,
  updatePolicyConfig: () => {},
  approvals: [],
  addApprovalRequest: async () => {},
  decideApproval: async () => {},
  auditLogs: [],
  recordAuditLog: async () => {},
  serviceAllocations: [],
  addServiceAllocation: async () => {},
  consumeAllocation: async () => {},
  selectedBranchId: "",
  setSelectedBranchId: () => {},
  selectedBranch: {} as Branch,
  branches: [],
  setBranches: () => {},
  addBranch: () => ({} as Branch),
  deleteBranch: () => {},
  activeModule: "workspace",
  setActiveModule: () => {},
  activeSubTab: "overview",
  setActiveSubTab: () => {},
  selectedDate: new Date().toISOString().split("T")[0],
  setSelectedDate: () => {},
  currentCustomer: {} as Customer,
  setCurrentCustomer: () => {},
  currentStaff: {} as Employee,
  ownerProfile: {} as OwnerProfile,
  setOwnerProfile: () => {},
  updateOwnerProfile: () => {},
  mfaSettings: {} as MFASettings,
  setMfaSettings: () => {},
  toggleMfaMaster: () => {},
  togglePageMfa: () => {},
  customizationSettings: {} as SalonCustomization,
  setCustomizationSettings: () => {},
  updateCustomization: () => {},
  gstSettings: {} as GSTDiscountSettings,
  setGstSettings: () => {},
  updateGstSettings: () => {},
  hydrateFromBackend: async () => {},
  categories: [],
  services: [],
  setServices: () => {},
  filteredServices: [],
  stylists: [],
  filteredStylists: [],
  customers: [],
  setCustomers: () => {},
  appointments: [],
  branchAppointments: [],
  inventory: [],
  setInventory: () => {},
  employees: [],
  setEmployees: () => {},
  attendance: [],
  leaves: [],
  leads: [],
  campaigns: [],
  coupons: [],
  expenses: [],
  tickets: [],
  memberships: [],
  invoices: [],
  timeSlots: [],
  setTimeSlots: () => {},
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  processPOSCheckout: () => ({} as any),
  addAppointment: () => ({} as any),
  bookAppointment: () => ({} as any),
  rescheduleAppointment: () => {},
  toggleSlotAvailability: () => {},
  updateSlotConfig: () => {},
  addCustomSlot: () => {},
  deleteSlot: () => {},
  addCustomer: () => ({} as any),
  bulkAddCustomers: () => {},
  addService: () => ({} as any),
  bulkAddServices: () => {},
  bulkAddInventory: () => {},
  addEmployee: () => ({} as any),
  updateAppointmentStatus: () => {},
  updateAppointmentDetails: () => {},
  deductInventory: () => {},
  restockInventory: () => {},
  transferStock: () => {},
  addLead: () => {},
  updateLeadStage: () => {},
  addLeaveRequest: () => {},
  updateLeaveStatus: () => {},
  clockInEmployee: () => {},
  clockOutEmployee: () => {},
  createTicket: () => {},
  replyToTicket: () => {},
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
};

const SalonContext = createContext<SalonContextType>(defaultSalonContext);

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    // Purge legacy mock data and hardcoded profile avatar cache once
    if (!localStorage.getItem("salon_data_version_v5_clean_avatars")) {
      const legacyKeys = [
        "salon_services",
        "salon_branches",
        "salon_organizations",
        "salon_customers",
        "salon_employees",
        "salon_stylists",
        "salon_appointments",
        "salon_inventory",
        "salon_invoices",
        "salon_leaves",
        "salon_leads",
        "salon_campaigns",
        "salon_coupons",
        "salon_expenses",
        "salon_tickets",
        "salon_approvals",
        "salon_audit_logs",
        "salon_service_allocations",
        "salon_current_organization",
        "salon_owner_profile",
        "salon_current_customer",
        "salon_customization_settings",
      ];
      legacyKeys.forEach((k) => localStorage.removeItem(k));

      // Also clean any hardcoded unsplash avatar from salon_current_user if present
      const storedUser = localStorage.getItem("salon_current_user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.avatar && parsed.avatar.includes("unsplash.com")) {
            parsed.avatar = "";
            localStorage.setItem("salon_current_user", JSON.stringify(parsed));
          }
        } catch {}
      }

      localStorage.setItem("salon_data_version_v5_clean_avatars", "true");
    }

    const item = localStorage.getItem(key);
    if (item === null || item === undefined) return fallback;
    try {
      return JSON.parse(item);
    } catch {
      // If the stored item is a plain string (like "customers" or "owner") that was not JSON-encoded:
      if (typeof fallback === "string" || typeof item === "string") {
        return item as unknown as T;
      }
      return fallback;
    }
  } catch {
    return fallback;
  }
};

export const ROLE_VALID_SUBTABS: Record<string, string[]> = {
  customer: [
    "booking",
    "services",
    "memberships",
    "wallet",
    "payment",
    "invoices",
  ],
  staff: [
    "dashboard",
    "customers",
    "services",
    "inventory",
    "attendance",
    "payrolls",
  ],
  cashier: [
    "dashboard",
    "customers",
    "pos",
    "services",
    "inventory",
  ],
  auditor: [
    "dashboard",
    "customers",
    "pos",
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
  ],
  branch_manager: [
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
    "commissions",
    "pos",
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
  ],
  admin: [
    "dashboard",
    "organizations",
    "finance",
    "analytics",
    "catalog",
    "ai",
    "support",
    "system",
  ],
  super_admin: [
    "dashboard",
    "organizations",
    "finance",
    "analytics",
    "catalog",
    "ai",
    "support",
    "system",
  ],
  owner: [
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
    "governance",
    "settings",
    "profile",
    "branches",
    "customizations",
    "mfa",
    "discounts",
    "data-hub",
    "integrations",
  ],
  director: [
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
    "governance",
    "settings",
    "profile",
    "branches",
    "customizations",
    "mfa",
    "discounts",
    "data-hub",
    "integrations",
  ],
};

export const getDefaultSubTabForRole = (role: string): string => {
  return role === "customer" ? "booking" : "dashboard";
};

export const isValidSubTabForRole = (role: string, tab: string): boolean => {
  const allowed = ROLE_VALID_SUBTABS[role] || ROLE_VALID_SUBTABS.owner;
  return allowed.includes(tab);
};

export function SalonProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRole] = useState<Role>(() => {
    const savedUser = loadFromStorage<AuthUser | null>("salon_current_user", null);
    if (savedUser && savedUser.role) return savedUser.role;
    return loadFromStorage<Role>("salon_active_role", "owner");
  });
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() =>
    loadFromStorage("salon_current_user", null)
  );

  // Dynamic Organizations and Policy Config
  const [organizations, setOrganizations] = useState<Organization[]>(() =>
    loadFromStorage("salon_organizations", [])
  );
  const [currentOrganization, setCurrentOrganization] = useState<Organization>(() =>
    loadFromStorage("salon_current_organization", EMPTY_ORGANIZATION)
  );
  const [policyConfig, setPolicyConfig] = useState<PolicyConfig>(() =>
    loadFromStorage("salon_policy_config", DEFAULT_POLICY_CONFIG)
  );

  // Governance & Workflows state
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(() =>
    loadFromStorage("salon_approvals", [])
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadFromStorage("salon_audit_logs", [])
  );
  const [serviceAllocations, setServiceAllocations] = useState<ServiceAllocation[]>(() =>
    loadFromStorage("salon_service_allocations", [])
  );

  const [selectedBranchId, setSelectedBranchId] = useState<string>(() =>
    loadFromStorage("salon_selected_branch_id", "")
  );
  const [activeModule, setActiveModule] = useState<OwnerModule>("workspace");
  const [activeSubTab, setActiveSubTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab") || window.location.hash.replace(/^#/, "");
      if (urlTab) return urlTab;
    }
    const saved = loadFromStorage<string>("salon_active_subtab", "");
    if (saved && saved !== "overview") return saved;
    const savedUser = loadFromStorage<AuthUser | null>("salon_current_user", null);
    const role: Role = savedUser?.role || loadFromStorage<Role>("salon_active_role", "owner");
    return getDefaultSubTabForRole(role);
  });
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Branches state
  const [branches, setBranches] = useState<Branch[]>(() =>
    loadFromStorage("salon_branches", [])
  );

  // Owner Profile state
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile>(() =>
    loadFromStorage("salon_owner_profile", {
      name: "",
      title: "Salon Managing Director",
      email: "",
      phone: "",
      avatarUrl: "",
      bio: "",
      role: "Owner / Franchise Operator",
    })
  );

  // MFA & Security state
  const [mfaSettings, setMfaSettings] = useState<MFASettings>(() =>
    loadFromStorage("salon_mfa_settings", {
      isMFAEnabled: false,
      mfaMethod: "authenticator",
      backupPhone: "",
      backupEmail: "",
      pageProtection: {
        posPayments: false,
        payrollStructures: false,
        inventoryCosting: false,
        customerExport: false,
        branchPlatform: false,
        staffManagement: false,
      },
    })
  );

  // Customization state
  const [customizationSettings, setCustomizationSettings] = useState<SalonCustomization>(() =>
    loadFromStorage("salon_customization_settings", {
      salonName: "Salon Management System",
      tagline: "",
      logoUrl: "",
      monogram: "LM",
      brandColor: "#0284c7",
      accentPreset: "sky",
      currencySymbol: "₹",
      taxRatePct: 18,
      invoiceHeader: "Thank you for your visit",
      invoiceFooter: "All services include styling & professional care.",
      slotDuration: 30,
      bufferTime: 10,
      smsBookingConfirm: true,
      smsReminder2h: true,
      whatsappReceipt: true,
      onlineBookingOpen: true,
    })
  );

  // GST and Discount Settings state
  const [gstSettings, setGstSettings] = useState<GSTDiscountSettings>(() =>
    loadFromStorage("salon_gst_settings", {
      isGstEnabled: true,
      isDiscountEnabled: true,
      isSgstEnabled: true,
      isCgstEnabled: true,
      isIgstEnabled: false,
      gstRatePct: 18,
      cgstRatePct: 9,
      sgstRatePct: 9,
      igstRatePct: 18,
      gstin: "",
      hsnSacCode: "999721",
      taxPricingMode: "exclusive",
      defaultDiscountPresets: [0, 5, 10, 15, 20, 25],
      maxCashierDiscountPct: 30,
      applyDiscountBeforeTax: true,
      membershipDiscounts: {
        regular: 0,
        silver: 10,
        gold: 15,
        platinum: 20,
      },
    })
  );

  // Entities state - 100% Dynamic from PostgreSQL Backend
  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadFromStorage("salon_customers", [])
  );
  const [currentCustomer, setCurrentCustomer] = useState<Customer>(() =>
    loadFromStorage("salon_current_customer", {
      id: "",
      name: "",
      email: "",
      phone: "",
      avatar: "",
      gender: "female",
      joinedDate: new Date().toISOString().split("T")[0],
      preferredBranchId: "",
      walletBalance: 0,
      loyaltyPoints: 0,
      membershipTier: "Standard",
      packages: [],
      beautyProfile: {
        hairType: "",
        hairTexture: "",
        scalpCondition: "",
        skinType: "",
        skinConcerns: [],
        allergies: [],
        preferredBeverage: "",
        preferredMusic: "",
        lastConsultationDate: new Date().toISOString().split("T")[0],
      },
      totalSpent: 0,
      visitsCount: 0,
      segment: "New Customer",
      tags: [],
      notes: "",
    })
  );
  const [services, setServices] = useState<Service[]>(() =>
    loadFromStorage("salon_services", [])
  );
  const [stylists, setStylists] = useState<Stylist[]>(() =>
    loadFromStorage("salon_stylists", [])
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    loadFromStorage("salon_appointments", [])
  );
  const [inventory, setInventory] = useState<InventoryProduct[]>(() =>
    loadFromStorage("salon_inventory", [])
  );
  const [employees, setEmployees] = useState<Employee[]>(() =>
    loadFromStorage("salon_employees", [])
  );
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() =>
    loadFromStorage("salon_attendance", [])
  );
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() =>
    loadFromStorage("salon_leaves", [])
  );
  const [leads, setLeads] = useState<Lead[]>(() =>
    loadFromStorage("salon_leads", [])
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    loadFromStorage("salon_campaigns", [])
  );
  const [coupons, setCoupons] = useState<Coupon[]>(() =>
    loadFromStorage("salon_coupons", [])
  );
  const [expenses, setExpenses] = useState<FinancialExpense[]>(() =>
    loadFromStorage("salon_expenses", [])
  );
  const [tickets, setTickets] = useState<CustomerTicket[]>(() =>
    loadFromStorage("salon_tickets", [])
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadFromStorage("salon_invoices", [])
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlotConfig[]>(() => {
    const loaded = loadFromStorage<TimeSlotConfig[]>("salon_timeslots", DEFAULT_TIME_SLOTS);
    const base = Array.isArray(loaded) && loaded.length > 0 ? loaded : DEFAULT_TIME_SLOTS;
    return sortTimeSlots(
      base.map((slot) => ({
        ...slot,
        isAvailable: true,
        blockedReason: undefined,
        slotType: "regular",
        allowedGenders: ["women", "men", "kids", "unisex"],
        allowedCategories: ["all"],
      }))
    );
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Hydrate state from Backend API (PostgreSQL database)
  const hydrateFromBackend = async () => {
    try {
      const [
        remoteBranches,
        remoteServices,
        remoteStylists,
        remoteCustomers,
        remoteAppointments,
        remoteInventory,
        remoteEmployees,
        remoteInvoices,
        remoteOrgs,
        remoteApprovals,
        remoteAuditLogs,
        remoteAllocations,
      ] = await Promise.allSettled([
        BranchService.getBranches(),
        SalonCatalogService.getServices(),
        SalonCatalogService.getStylists(),
        CRMService.getCustomers(),
        AppointmentService.getAppointments(),
        InventoryService.getItems(),
        HRMSService.getStaffRoster(),
        ERPService.getInvoices(50),
        OrganizationService.getOrganizations(),
        ApprovalService.getApprovals(),
        AuditLogService.getAuditLogs(),
        AllocationService.getAllocations(),
      ]);

      if (remoteBranches.status === "fulfilled") {
        setBranches(remoteBranches.value || []);
      }
      if (remoteServices.status === "fulfilled") {
        const rawServices = remoteServices.value || [];
        const normalized = rawServices.map((s: any) => ({
          ...s,
          id: s.id,
          categoryId: s.categoryId || s.category_id || "",
          categoryName: s.categoryName || s.category_name || "",
          subcategory: s.subcategory || "",
          name: s.name || "",
          shortDesc: s.shortDesc || s.short_desc || "",
          fullDesc: s.fullDesc || s.full_desc || "",
          basePrice: s.basePrice ?? s.base_price ?? 0,
          memberPrice: s.memberPrice ?? s.member_price,
          durationMinutes: s.durationMinutes ?? s.duration_minutes ?? 45,
          gender: s.gender || ["unisex"],
          branchIds: s.branchIds || s.branch_ids || [],
          image: s.image || "",
          featured: s.featured ?? false,
          isPopular: s.isPopular ?? s.is_popular ?? false,
          variants: s.variants || [],
          branchPricing: s.branchPricing || s.branch_pricing || {},
          optionGroups: s.optionGroups || s.option_groups || [],
          addOns: s.addOns || s.add_ons || [],
          requiredSkills: s.requiredSkills || s.required_skills || [],
          consumedProducts: s.consumedProducts || s.consumed_products || [],
        }));
        setServices(normalized);
      }
      if (remoteStylists.status === "fulfilled") {
        const rawStylists = remoteStylists.value || [];
        const normalizedStylists = rawStylists.map((st: any) => ({
          ...st,
          id: String(st.id ?? ""),
          name: st.name || "",
          email: st.email || "",
          phone: st.phone || "",
          avatar: st.avatar || "",
          tier: st.tier || "Senior Artist",
          tierMultiplier: Number(st.tierMultiplier ?? st.tier_multiplier ?? 1.0),
          specialties: Array.isArray(st.specialties) ? st.specialties : [],
          branchId: st.branchId || st.branch_id || "",
          rating: Number(st.rating ?? 4.5),
          experienceYears: Number(st.experienceYears ?? st.experience_years ?? 1),
          bio: st.bio || "",
          isAvailableToday: Boolean(st.isAvailableToday ?? st.is_available_today ?? true),
          commissionRate: Number(st.commissionRate ?? st.commission_rate ?? 0.15),
        }));
        setStylists(normalizedStylists);
      }
      if (remoteCustomers.status === "fulfilled") {
        const rawCustomers = remoteCustomers.value || [];
        const normalizedCustomers = rawCustomers.map((c: any) => ({
          ...c,
          id: String(c.id ?? ""),
          name: c.name || "",
          email: c.email || "",
          phone: c.phone || "",
          avatar: c.avatar || "",
          gender: c.gender || "other",
          joinedDate: c.joinedDate || c.joined_date || c.createdAt || c.created_at || "",
          preferredBranchId: c.preferredBranchId || c.preferred_branch_id || "",
          preferredStylistId: c.preferredStylistId || c.preferred_stylist_id,
          walletBalance: Number(c.walletBalance ?? c.wallet_balance ?? 0),
          loyaltyPoints: Number(c.loyaltyPoints ?? c.loyalty_points ?? 0),
          totalSpent: Number(c.totalSpent ?? c.total_spent ?? c.totalSpend ?? 0),
          totalSpend: Number(c.totalSpend ?? c.total_spent ?? c.totalSpend ?? 0),
          visitsCount: Number(c.visitsCount ?? c.visits_count ?? c.totalVisits ?? 0),
          totalVisits: Number(c.totalVisits ?? c.visits_count ?? c.visitsCount ?? 0),
          segment: c.segment || "New Customer",
          membershipTier: c.membershipTier || c.membership_tier ||
            (typeof c.membership === "object" ? c.membership?.tierName : c.membership) ||
            undefined,
          membership: typeof c.membership === "object" ? c.membership : undefined,
          packages: Array.isArray(c.packages) ? c.packages : [],
          tags: Array.isArray(c.tags) ? c.tags.map(String) : [],
          notes: c.notes || "",
          allergies: Array.isArray(c.allergies) ? c.allergies.map(String) : [],
          beautyProfile: (typeof c.beautyProfile === "object" && c.beautyProfile !== null)
            ? c.beautyProfile
            : (typeof c.beauty_profile === "object" && c.beauty_profile !== null)
            ? c.beauty_profile
            : {
                hairType: "", hairTexture: "", scalpCondition: "",
                skinType: "", skinConcerns: [], allergies: [],
                preferredBeverage: "", preferredMusic: "", lastConsultationDate: "",
              },
        }));
        setCustomers(normalizedCustomers);
        if (normalizedCustomers.length > 0) {
          setCurrentCustomer((prev) => {
            if (!prev?.id || !normalizedCustomers.some((c: any) => c.id === prev.id)) {
              return normalizedCustomers[0];
            }
            return prev;
          });
        }
      }
      if (remoteAppointments.status === "fulfilled") {
        setAppointments(remoteAppointments.value || []);
      }
      if (remoteInventory.status === "fulfilled") {
        setInventory(remoteInventory.value || []);
      }
      if (remoteEmployees.status === "fulfilled") {
        setEmployees(remoteEmployees.value || []);
      }
      if (remoteInvoices.status === "fulfilled") {
        setInvoices(remoteInvoices.value || []);
      }
      if (remoteOrgs.status === "fulfilled") {
        const orgsList = remoteOrgs.value || [];
        setOrganizations(orgsList);
        if (orgsList.length > 0) {
          setCurrentOrganization(orgsList[0]);
          setPolicyConfig(orgsList[0].policy_config || DEFAULT_POLICY_CONFIG);
        } else {
          setCurrentOrganization(EMPTY_ORGANIZATION);
          setPolicyConfig(DEFAULT_POLICY_CONFIG);
        }
      }
      if (remoteApprovals.status === "fulfilled") {
        setApprovals(remoteApprovals.value || []);
      }
      if (remoteAuditLogs.status === "fulfilled") {
        setAuditLogs(remoteAuditLogs.value || []);
      }
      if (remoteAllocations.status === "fulfilled") {
        setServiceAllocations(remoteAllocations.value || []);
      }
    } catch (err) {
      console.debug("Backend offline, utilizing local reactive state.", err);
    }
  };

  useEffect(() => {
    hydrateFromBackend();
  }, []);

  // Persistent storage synchronizers
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_branches", JSON.stringify(branches));
      } catch (e) {
        console.error(e);
      }
    }
  }, [branches]);


  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_owner_profile", JSON.stringify(ownerProfile));
      } catch (e) {
        console.error(e);
      }
    }
  }, [ownerProfile]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_mfa_settings", JSON.stringify(mfaSettings));
      } catch (e) {
        console.error(e);
      }
    }
  }, [mfaSettings]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_customization_settings", JSON.stringify(customizationSettings));
      } catch (e) {
        console.error(e);
      }
    }
  }, [customizationSettings]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_gst_settings", JSON.stringify(gstSettings));
      } catch (e) {
        console.error(e);
      }
    }
  }, [gstSettings]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_customers", JSON.stringify(customers));
      } catch (e) {
        console.error(e);
      }
    }
  }, [customers]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_current_customer", JSON.stringify(currentCustomer));
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentCustomer]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_services", JSON.stringify(services));
      } catch (e) {
        console.error(e);
      }
    }
  }, [services]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_stylists", JSON.stringify(stylists));
      } catch (e) {
        console.error(e);
      }
    }
  }, [stylists]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_appointments", JSON.stringify(appointments));
      } catch (e) {
        console.error(e);
      }
    }
  }, [appointments]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_inventory", JSON.stringify(inventory));
      } catch (e) {
        console.error(e);
      }
    }
  }, [inventory]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_employees", JSON.stringify(employees));
      } catch (e) {
        console.error(e);
      }
    }
  }, [employees]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_attendance", JSON.stringify(attendance));
      } catch (e) {
        console.error(e);
      }
    }
  }, [attendance]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_leaves", JSON.stringify(leaves));
      } catch (e) {
        console.error(e);
      }
    }
  }, [leaves]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_leads", JSON.stringify(leads));
      } catch (e) {
        console.error(e);
      }
    }
  }, [leads]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_campaigns", JSON.stringify(campaigns));
      } catch (e) {
        console.error(e);
      }
    }
  }, [campaigns]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_coupons", JSON.stringify(coupons));
      } catch (e) {
        console.error(e);
      }
    }
  }, [coupons]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_expenses", JSON.stringify(expenses));
      } catch (e) {
        console.error(e);
      }
    }
  }, [expenses]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_tickets", JSON.stringify(tickets));
      } catch (e) {
        console.error(e);
      }
    }
  }, [tickets]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_invoices", JSON.stringify(invoices));
      } catch (e) {
        console.error(e);
      }
    }
  }, [invoices]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_timeslots", JSON.stringify(timeSlots));
      } catch (e) {
        console.error(e);
      }
    }
  }, [timeSlots]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_organizations", JSON.stringify(organizations));
      } catch (e) {
        console.error(e);
      }
    }
  }, [organizations]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_current_organization", JSON.stringify(currentOrganization));
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentOrganization]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_policy_config", JSON.stringify(policyConfig));
      } catch (e) {
        console.error(e);
      }
    }
  }, [policyConfig]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_current_user", JSON.stringify(currentUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_approvals", JSON.stringify(approvals));
      } catch (e) {
        console.error(e);
      }
    }
  }, [approvals]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_audit_logs", JSON.stringify(auditLogs));
      } catch (e) {
        console.error(e);
      }
    }
  }, [auditLogs]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_service_allocations", JSON.stringify(serviceAllocations));
      } catch (e) {
        console.error(e);
      }
    }
  }, [serviceAllocations]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("salon_active_role", activeRole);
      } catch (e) {
        console.error(e);
      }
    }
  }, [activeRole]);

  useEffect(() => {
    if (typeof window !== "undefined" && selectedBranchId) {
      try {
        localStorage.setItem("salon_selected_branch_id", selectedBranchId);
      } catch (e) {
        console.error(e);
      }
    }
  }, [selectedBranchId]);

  useEffect(() => {
    if (typeof window !== "undefined" && activeSubTab) {
      try {
        localStorage.setItem("salon_active_subtab", activeSubTab);
        const url = new URL(window.location.href);
        if (url.searchParams.get("tab") !== activeSubTab) {
          url.searchParams.set("tab", activeSubTab);
          window.history.replaceState(null, "", url.toString());
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [activeSubTab]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get("tab");
      if (tabFromUrl && tabFromUrl !== activeSubTab) {
        setActiveSubTab(tabFromUrl);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeSubTab]);

  const setOrganization = (org: Organization) => {
    setCurrentOrganization(org);
    if (org.policy_config) {
      setPolicyConfig(org.policy_config);
    }
    addToast("info", "Organization Switched", `Active profile: ${org.name} (${org.business_type.toUpperCase()})`);
  };

  const updatePolicyConfig = async (updates: Partial<PolicyConfig>) => {
    const updated = { ...policyConfig, ...updates };
    setPolicyConfig(updated);
    if (currentOrganization?.id) {
      const updatedOrg = { ...currentOrganization, policy_config: updated };
      setCurrentOrganization(updatedOrg);
      setOrganizations((prev) => prev.map((o) => (o.id === updatedOrg.id ? updatedOrg : o)));
      OrganizationService.updateOrganization(currentOrganization.id, { policy_config: updated }).catch(() => {});
    }
    addToast("success", "Policy Engine Updated", "Dynamic operational rules and module permissions applied.");
  };

  const addApprovalRequest = async (req: Partial<ApprovalRequest>) => {
    const newReq: ApprovalRequest = {
      id: generateId("appr"),
      organization_id: currentOrganization?.id || "org_default",
      branch_id: selectedBranchId,
      request_type: req.request_type || "service_eligibility",
      title: req.title || "Request for Authorization",
      description: req.description || "",
      requested_by: currentUser?.name || ownerProfile.name || "Staff Member",
      requested_by_id: currentUser?.id,
      beneficiary_name: req.beneficiary_name,
      beneficiary_id: req.beneficiary_id,
      department: req.department || policyConfig.departments?.[0] || "General",
      amount: req.amount || 0,
      status: "pending",
      metadata_payload: req.metadata_payload || {},
      created_at: new Date().toISOString(),
    };
    setApprovals((prev) => [newReq, ...prev]);
    ApprovalService.createApproval(newReq).catch(() => {});
    addToast("info", "Approval Request Submitted", `Request "${newReq.title}" queued for managerial review.`);
  };

  const decideApproval = async (id: string, status: "approved" | "rejected", notes?: string) => {
    const approverName = currentUser?.name || ownerProfile.name || "Administrator";
    setApprovals((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              approver_name: approverName,
              approver_id: currentUser?.id,
              approver_notes: notes || `Marked as ${status}`,
            }
          : item
      )
    );
    ApprovalService.decideApproval(id, {
      status,
      approver_name: approverName,
      approver_id: currentUser?.id,
      approver_notes: notes,
    }).catch(() => {});

    recordAuditLog({
      action: `APPROVAL_${status.toUpperCase()}`,
      module: "GOVERNANCE",
      entity_id: id,
      details: { status, notes, approver: approverName },
    });

    addToast(
      status === "approved" ? "success" : "warning",
      `Request ${status === "approved" ? "Approved" : "Rejected"}`,
      `Request decision recorded with compliance audit log.`
    );
  };

  const recordAuditLog = async (log: Partial<AuditLog>) => {
    const newLog: AuditLog = {
      id: generateId("aud"),
      organization_id: currentOrganization?.id || "org_default",
      user_id: currentUser?.id,
      user_name: currentUser?.name || ownerProfile.name || "System User",
      user_role: activeRole,
      action: log.action || "SYSTEM_EVENT",
      module: log.module || "WORKSPACE",
      entity_id: log.entity_id,
      ip_address: "127.0.0.1",
      details: log.details || {},
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    AuditLogService.recordAuditLog(newLog).catch(() => {});
  };

  const addServiceAllocation = async (alloc: Partial<ServiceAllocation>) => {
    const newAlloc: ServiceAllocation = {
      id: generateId("alloc"),
      organization_id: currentOrganization?.id || "org_default",
      beneficiary_id: alloc.beneficiary_id || generateId("ben"),
      beneficiary_name: alloc.beneficiary_name || "Beneficiary",
      department: alloc.department || policyConfig.departments?.[0] || "General",
      cost_center: alloc.cost_center || "CC-101",
      service_id: alloc.service_id || (services[0]?.id || "srv_default"),
      service_name: alloc.service_name || (services[0]?.name || "Standard Care"),
      quota_monthly: alloc.quota_monthly || 2,
      quota_used: 0,
      unit_entitlement_value: alloc.unit_entitlement_value || 0,
      valid_from: new Date().toISOString().split("T")[0],
      valid_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "active",
    };
    setServiceAllocations((prev) => [newAlloc, ...prev]);
    AllocationService.createAllocation(newAlloc).catch(() => {});
    addToast("success", "Entitlement Allocated", `Assigned ${newAlloc.quota_monthly} monthly quotas of ${newAlloc.service_name} to ${newAlloc.beneficiary_name}`);
  };

  const consumeAllocation = async (id: string) => {
    setServiceAllocations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quota_used: item.quota_used + 1 } : item))
    );
    AllocationService.consumeAllocation(id).catch(() => {});
    addToast("info", "Entitlement Consumed", "Service quota deducted from institutional cost center.");
  };

  const loginUser = (user: AuthUser, token?: string) => {
    setCurrentUser(user);
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem("auth_token", token);
      localStorage.setItem("salon_current_user", JSON.stringify(user));
      if (user.role) localStorage.setItem("salon_active_role", user.role);
    }
    if (user.role) {
      setActiveRole(user.role);
      setActiveSubTab((prev) => {
        if (prev && isValidSubTabForRole(user.role, prev)) {
          return prev;
        }
        return getDefaultSubTabForRole(user.role);
      });
    }
    if (user.organization_id) {
      const foundOrg = organizations.find((o) => o.id === user.organization_id);
      if (foundOrg) {
        setCurrentOrganization(foundOrg);
        if (foundOrg.policy_config) setPolicyConfig(foundOrg.policy_config);
      }
    }
    if (user.branch_id) {
      setSelectedBranchId(user.branch_id);
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("salon_current_user");
      localStorage.removeItem("salon_active_role");
      localStorage.removeItem("salon_selected_branch_id");
      localStorage.removeItem("salon_active_subtab");
      localStorage.removeItem("salon_settings_tab");
      localStorage.removeItem("salon_customers_tab");
      localStorage.removeItem("salon_inventory_tab");
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("tab");
        url.searchParams.delete("subtab");
        window.history.replaceState(null, "", url.pathname);
      } catch {}
    }
    addToast("info", "Signed Out", "You have successfully logged out.");
  };

  const selectedBranch = useMemo<Branch>(() => {
    return (
      branches.find((b) => b.id === selectedBranchId) ||
      branches[0] || {
        id: selectedBranchId || "",
        name: currentOrganization?.name || "",
        code: currentOrganization?.code || "",
        branchType: "",
        managerName: "",
        status: "active",
        phone: currentOrganization?.phone || "",
        email: currentOrganization?.email || "",
        whatsapp: currentOrganization?.phone || "",
        address: currentOrganization?.address || "",
        city: currentOrganization?.city || "",
        state: currentOrganization?.state || "",
        country: currentOrganization?.country || "",
        pinCode: "",
        mapLocation: "",
        currency: currentOrganization?.currency || "",
        taxRate: currentOrganization?.tax_rate || 0,
        rating: 0,
        totalReviews: 0,
        image: "",
        logo: currentOrganization?.logo || "",
        description: currentOrganization?.brand_tagline || "",
        chairsCount: 0,
        openingHours: "",
      }
    );
  }, [branches, selectedBranchId, currentOrganization]);

  const addBranch = (branchData: Partial<Branch>): Branch => {
    const newBranch: Branch = {
      id: generateId("br"),
      name: branchData.name || "",
      code: branchData.code || "",
      city: branchData.city || "",
      country: branchData.country || "",
      currency: branchData.currency || "",
      taxRate: branchData.taxRate ?? 0,
      phone: branchData.phone || "",
      email: branchData.email || "",
      address: branchData.address || "",
      rating: 0,
      totalReviews: 0,
      image: branchData.image || "",
      chairsCount: branchData.chairsCount || 0,
      openingHours: branchData.openingHours || "",
      status: branchData.status || "active",
    };
    setBranches((prev) => [...prev, newBranch]);

    // Asynchronously synchronize branch with Backend API & PostgreSQL
    BranchService.createBranch({
      name: newBranch.name,
      code: newBranch.code,
      city: newBranch.city,
      country: newBranch.country,
      currency: newBranch.currency,
      tax_rate: newBranch.taxRate,
      phone: newBranch.phone,
      email: newBranch.email,
      address: newBranch.address,
      image: newBranch.image,
      chairs_count: newBranch.chairsCount,
      opening_hours: newBranch.openingHours,
      status: newBranch.status,
    }).catch(() => {});

    addToast("success", "Salon Branch Created", `${newBranch.name || "Branch"} is now active.`);
    return newBranch;
  };


  const deleteBranch = (branchId: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== branchId));
    addToast("info", "Branch Removed", "The salon branch has been removed.");
  };

  const updateOwnerProfile = (updates: Partial<OwnerProfile>) => {
    setOwnerProfile((prev) => ({ ...prev, ...updates }));
    addToast("success", "Owner Profile Updated", "Your changes and profile avatar were saved successfully.");
  };

  const toggleMfaMaster = (enabled: boolean) => {
    setMfaSettings((prev) => ({ ...prev, isMFAEnabled: enabled }));
    addToast(
      enabled ? "success" : "warning",
      enabled ? "MFA Security Activated" : "MFA Security Disabled",
      enabled
        ? "Two-Factor Authentication is now actively protecting your account."
        : "Two-Factor Authentication was switched off."
    );
  };

  const togglePageMfa = (pageKey: keyof MFASettings["pageProtection"], enabled: boolean) => {
    setMfaSettings((prev) => ({
      ...prev,
      pageProtection: {
        ...prev.pageProtection,
        [pageKey]: enabled,
      },
    }));
    addToast(
      "info",
      "Page Protection Updated",
      `MFA requirement for this module was ${enabled ? "enabled (ON)" : "disabled (OFF)"}.`
    );
  };

  const updateCustomization = (updates: Partial<SalonCustomization>) => {
    setCustomizationSettings((prev) => ({ ...prev, ...updates }));
    addToast("success", "Customizations Saved", "Salon branding, receipt templates & scheduling rules updated.");
  };

  const updateGstSettings = (updates: Partial<GSTDiscountSettings>) => {
    setGstSettings((prev) => ({ ...prev, ...updates }));
    addToast("success", "Tax & Discount Updated", "GST and discount settings saved successfully.");
  };

  const currentStaff = useMemo<Employee>(() => {
    if (currentUser?.email) {
      const match = employees.find(
        (e) => e.email?.toLowerCase() === currentUser.email?.toLowerCase()
      );
      if (match) return match;
    }
    const branchStaff = employees.find((e) => e.branchId === selectedBranchId);
    if (branchStaff) return branchStaff;
    if (employees.length > 0) return employees[0];
    return {
      id: currentUser?.id || "",
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      phone: "",
      avatar: currentUser?.avatar || "",
      branchId: selectedBranchId || "",
      department: (currentUser?.department as any) || ("" as any),
      designation: currentUser?.role || "",
      tier: "" as StylistTier,
      joinDate: "",
      salaryBase: 0,
      commissionRate: 0,
      status: "active" as const,
      role: currentUser?.role || "",
      skills: [],
      documentsSubmitted: [],
      performanceRating: 0,
      monthlyCommission: 0,
      shiftsThisMonth: 0,
      leaveBalance: 0,
    };
  }, [employees, selectedBranchId, currentUser]);

  const filteredServices = useMemo(() => {
    return services.filter((s: any) => {
      const bIds = s.branchIds || s.branch_ids || [];
      if (!Array.isArray(bIds) || bIds.length === 0) return true;
      return bIds.includes(selectedBranchId) || bIds.includes("all");
    });
  }, [services, selectedBranchId]);

  const filteredStylists = useMemo(() => {
    return stylists.filter((s: any) => {
      const bId = s.branchId || s.branch_id;
      return !bId || bId === selectedBranchId || bId === "all";
    });
  }, [stylists, selectedBranchId]);

  const branchAppointments = useMemo(() => {
    return appointments.filter((a: any) => {
      const bId = a.branchId || a.branch_id;
      return !bId || bId === selectedBranchId || bId === "all";
    });
  }, [appointments, selectedBranchId]);

  // Toast Handler
  const addToast = (type: ToastMessage["type"], title: string, message: string) => {
    const id = generateId("toast");
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart operations
  const addToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
    addToast("success", "Item Added", `${item.name} added to cart.`);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Slot & Availability Management
  const toggleSlotAvailability = (slotId: string, isAvailable: boolean, reason?: string) => {
    setTimeSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              isAvailable,
              blockedReason: isAvailable ? undefined : (reason || "Blocked by salon management"),
            }
          : slot
      )
    );
    addToast(
      "info",
      "Slot Availability Updated",
      `Slot marked as ${isAvailable ? "Available" : "Blocked"}.`
    );
  };

  const updateSlotConfig = (slotId: string, updates: Partial<TimeSlotConfig>) => {
    setTimeSlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, ...updates } : slot))
    );
    addToast("info", "Slot Configuration Updated", "Target audience and service restrictions saved.");
  };

  const addCustomSlot = (
    time: string,
    branchId: string = "all",
    stylistId: string = "all",
    allowedGenders: any[] = ["women", "men", "kids", "unisex"],
    allowedCategories: string[] = ["all"],
    slotType: any = "regular"
  ) => {
    const formattedTime = normalizeSlotTime(time) || time;
    setTimeSlots((prev) => {
      const existingIndex = prev.findIndex(
        (s) => s.time.toLowerCase() === formattedTime.toLowerCase()
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          isAvailable: true,
          blockedReason: undefined,
          allowedGenders,
          allowedCategories,
          slotType,
        };
        return sortTimeSlots(updated);
      }
      const newSlot: TimeSlotConfig = {
        id: generateId("slot"),
        time: formattedTime,
        isAvailable: true,
        branchId,
        stylistId,
        allowedGenders,
        allowedCategories,
        slotType,
      };
      return sortTimeSlots([...prev, newSlot]);
    });
    addToast("success", "Custom Slot Added", `New time slot ${formattedTime} is now active and unblocked.`);
  };

  const deleteSlot = (slotId: string) => {
    setTimeSlots((prev) => prev.filter((slot) => slot.id !== slotId));
    addToast("info", "Slot Removed", "Time slot removed from booking calendar.");
  };

  const rescheduleAppointment = (
    id: string,
    newDate: string,
    newTimeSlot: string,
    newStylistId?: string
  ) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          const updatedStylist = newStylistId
            ? stylists.find((s) => s.id === newStylistId)
            : undefined;
          return {
            ...apt,
            date: newDate,
            timeSlot: newTimeSlot,
            stylistId: updatedStylist ? updatedStylist.id : apt.stylistId,
            stylistName: updatedStylist ? updatedStylist.name : apt.stylistName,
            status: "rescheduled" as AppointmentStatus,
          };
        }
        return apt;
      })
    );
    addToast(
      "success",
      "Appointment Rescheduled",
      `Appointment moved to ${newDate} at ${newTimeSlot}.`
    );
  };

  // Appointment Mutations
  const addAppointment = (appointmentData: Omit<Appointment, "id" | "bookingRef" | "createdAt">): Appointment => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newAppointment: Appointment = {
      ...appointmentData,
      id: generateId("apt"),
      bookingRef: `LM-${selectedBranch.code}-${randomCode}`,
      createdAt: new Date().toISOString(),
    };

    setAppointments((prev) => [newAppointment, ...prev]);

    // If customer booked, also link to recent customer
    addToast(
      "success",
      "Booking Confirmed",
      `Appointment ${newAppointment.bookingRef} has been scheduled for ${newAppointment.customerName} on ${newAppointment.date} at ${newAppointment.timeSlot}.`
    );

    return newAppointment;
  };

  const bookAppointment = (appointmentData: any): Appointment => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const branch = branches.find((b) => b.id === appointmentData.branchId) || selectedBranch;
    const stylist = stylists.find((s) => s.id === appointmentData.stylistId) || stylists[0];
    const primaryService = appointmentData.services?.[0];
    const service = primaryService
      ? services.find((s) => s.id === primaryService.serviceId) || services[0]
      : services.find((s) => s.id === appointmentData.serviceId) || services[0];

    const serviceNameDisplay = primaryService
      ? appointmentData.services.length > 1
        ? `${primaryService.serviceName} (+${appointmentData.services.length - 1} more)`
        : primaryService.serviceName
      : appointmentData.serviceName || service?.name || "Bespoke Service";

    const newAppointment: Appointment = {
      id: generateId("apt"),
      bookingRef: `LM-${branch.code}-${randomCode}`,
      customerId: appointmentData.customerId || currentCustomer.id,
      customerName: appointmentData.customerName || currentCustomer.name,
      customerPhone: appointmentData.customerPhone || currentCustomer.phone,
      customerEmail: appointmentData.customerEmail || currentCustomer.email,
      branchId: branch.id,
      branchName: branch.name,
      serviceId: service?.id || "srv_custom",
      serviceName: serviceNameDisplay,
      categoryName: service?.categoryName || "Haute Coiffure",
      stylistId: stylist.id,
      stylistName: stylist.name,
      stylistTier: stylist.tier,
      date: appointmentData.date || new Date().toISOString().split("T")[0],
      timeSlot: appointmentData.timeSlot || appointmentData.time || "11:00 AM",
      durationMinutes:
        appointmentData.durationMinutes ||
        (appointmentData.services
          ? appointmentData.services.reduce(
              (sum: number, s: any) => sum + (s.durationMinutes || 45),
              0
            )
          : 60),
      selectedOptions: appointmentData.selectedOptions || [],
      selectedAddOns: appointmentData.selectedAddOns || [],
      status: (appointmentData.status as AppointmentStatus) || "confirmed",
      basePrice: appointmentData.totalAmount || appointmentData.basePrice || service?.basePrice || 2500,
      optionsPrice: 0,
      addOnsPrice: 0,
      stylistTierMarkup: 0,
      subtotal: appointmentData.totalAmount || 2500,
      membershipDiscount: 0,
      packageCreditUsed: false,
      walletUsed: 0,
      loyaltyDiscount: 0,
      couponDiscount: 0,
      taxAmount:
        Math.round((appointmentData.totalAmount || 2500) * branch.taxRate * 100) / 100,
      finalTotal: appointmentData.totalAmount || 2500,
      paymentStatus: "unpaid",
      chairNumber: appointmentData.chairNumber || Math.floor(1 + Math.random() * 8),
      serviceNotes: appointmentData.notes || appointmentData.serviceNotes || "",
      createdAt: new Date().toISOString(),
    };

    setAppointments((prev) => [newAppointment, ...prev]);

    // Asynchronously synchronize with Backend API & PostgreSQL
    AppointmentService.bookAppointment({
      customer_id: newAppointment.customerId,
      customer_name: newAppointment.customerName,
      customer_phone: newAppointment.customerPhone,
      customer_email: newAppointment.customerEmail,
      branch_id: newAppointment.branchId,
      branch_name: newAppointment.branchName,
      service_id: newAppointment.serviceId,
      service_name: newAppointment.serviceName,
      category_name: newAppointment.categoryName,
      stylist_id: newAppointment.stylistId,
      stylist_name: newAppointment.stylistName,
      stylist_tier: newAppointment.stylistTier,
      date: newAppointment.date,
      time_slot: newAppointment.timeSlot,
      duration_minutes: newAppointment.durationMinutes,
      selected_options: newAppointment.selectedOptions,
      selected_add_ons: newAppointment.selectedAddOns,
      status: newAppointment.status,
      base_price: newAppointment.basePrice,
      subtotal: newAppointment.subtotal,
      tax_amount: newAppointment.taxAmount,
      final_total: newAppointment.finalTotal,
      payment_status: newAppointment.paymentStatus,
      chair_number: newAppointment.chairNumber,
      service_notes: newAppointment.serviceNotes,
    }).catch(() => {});

    addToast(
      "success",
      "Booking Confirmed",
      `Appointment ${newAppointment.bookingRef} has been scheduled for ${newAppointment.customerName} on ${newAppointment.date} at ${newAppointment.timeSlot}.`
    );

    return newAppointment;
  };


  const updateAppointmentStatus = (id: string, status: Appointment["status"]) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          // If completed, deduct product stock if any products were used
          if (status === "completed" && apt.productsUsed && apt.productsUsed.length > 0) {
            apt.productsUsed.forEach((p) => {
              deductInventory(p.productId, apt.branchId, p.quantity, `Service ${apt.serviceName}`);
            });
          }
          return { ...apt, status };
        }
        return apt;
      })
    );
    addToast("info", "Status Updated", `Appointment status changed to ${status.replace("_", " ")}.`);
  };

  const updateAppointmentDetails = (id: string, updates: Partial<Appointment>) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, ...updates } : apt))
    );
  };

  // Inventory Mutations
  const deductInventory = (productId: string, branchId: string, quantity: number, reason: string) => {
    setInventory((prev) =>
      prev.map((prod) => {
        if (prod.id === productId && prod.stocksByBranch[branchId]) {
          const currentStock = prod.stocksByBranch[branchId].current;
          const newStock = Math.max(0, currentStock - quantity);
          if (newStock <= prod.stocksByBranch[branchId].minThreshold) {
            addToast("warning", "Low Stock Alert", `${prod.name} in ${selectedBranch.name} is now at ${newStock} ${prod.unit} (Below threshold)!`);
          }
          return {
            ...prod,
            stocksByBranch: {
              ...prod.stocksByBranch,
              [branchId]: {
                ...prod.stocksByBranch[branchId],
                current: newStock,
              },
            },
          };
        }
        return prod;
      })
    );
  };

  const restockInventory = (productId: string, branchId: string, quantity: number) => {
    setInventory((prev) =>
      prev.map((prod) => {
        if (prod.id === productId && prod.stocksByBranch[branchId]) {
          return {
            ...prod,
            stocksByBranch: {
              ...prod.stocksByBranch,
              [branchId]: {
                ...prod.stocksByBranch[branchId],
                current: prod.stocksByBranch[branchId].current + quantity,
              },
            },
          };
        }
        return prod;
      })
    );
    addToast("success", "Stock Replenished", `Added ${quantity} units to inventory.`);
  };

  const transferStock = (productId: string, fromBranchId: string, toBranchId: string, quantity: number) => {
    setInventory((prev) =>
      prev.map((prod) => {
        if (prod.id === productId) {
          const fromCurrent = prod.stocksByBranch[fromBranchId]?.current || 0;
          const toCurrent = prod.stocksByBranch[toBranchId]?.current || 0;
          if (fromCurrent < quantity) {
            addToast("error", "Transfer Failed", "Insufficient stock in source branch.");
            return prod;
          }
          addToast("success", "Transfer Complete", `Transferred ${quantity} units between branches.`);
          return {
            ...prod,
            stocksByBranch: {
              ...prod.stocksByBranch,
              [fromBranchId]: {
                ...prod.stocksByBranch[fromBranchId],
                current: fromCurrent - quantity,
              },
              [toBranchId]: {
                ...prod.stocksByBranch[toBranchId],
                current: toCurrent + quantity,
              },
            },
          };
        }
        return prod;
      })
    );
  };

  // POS Checkout
  const processPOSCheckout = (
    customerId: string,
    payments: SplitPayment[],
    notes?: string
  ): Invoice => {
    const cust = customers.find((c) => c.id === customerId) || customers[0];
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxTotal = Math.round(subtotal * selectedBranch.taxRate * 100) / 100;
    const finalTotal = subtotal + taxTotal;

    const newInvoice: Invoice = {
      id: generateId("inv"),
      invoiceNumber: `INV-${selectedBranch.code}-${Math.floor(10000 + Math.random() * 90000)}`,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      items: [...cart],
      subtotal,
      discountTotal: 0,
      taxTotal,
      finalTotal,
      payments,
      paymentStatus: "paid",
      date: new Date().toISOString(),
      cashierName: currentStaff.name,
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Asynchronously synchronize POS transaction with Backend API & PostgreSQL
    POSService.createTransaction({
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      items: cart.map((i) => ({
        id: i.id || i.productId || i.serviceId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        type: i.type,
        stylistId: i.stylistId,
      })),
      subtotal,
      discountAmount: 0,
      gstAmount: taxTotal,
      tipAmount: 0,
      totalAmount: finalTotal,
      paymentMode: payments[0]?.method || "cash",
      payments: payments.map((p) => ({ method: p.method, amount: p.amount })),
      cashierName: currentStaff.name,
      notes,
    }).catch(() => {});

    // Deduct stock for any retail products in the cart
    cart.forEach((item) => {
      if (item.type === "product" && item.productId) {
        deductInventory(item.productId, selectedBranch.id, item.quantity, `POS Sale ${newInvoice.invoiceNumber}`);
      }
    });

    // Award loyalty points (1 point per 20 currency units)
    const earnedPoints = Math.floor(finalTotal / 20);
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === cust.id) {
          return {
            ...c,
            loyaltyPoints: c.loyaltyPoints + earnedPoints,
            totalSpent: c.totalSpent + finalTotal,
            visitsCount: c.visitsCount + 1,
          };
        }
        return c;
      })
    );

    clearCart();
    addToast("success", "Payment Completed", `Invoice ${newInvoice.invoiceNumber} generated for ${cust.name}.`);
    return newInvoice;
  };


  // CRM Leads
  const addLead = (leadData: Omit<Lead, "id" | "createdDate">) => {
    const newLead: Lead = {
      ...leadData,
      id: generateId("ld"),
      createdDate: new Date().toISOString().split("T")[0],
    };
    setLeads((prev) => [newLead, ...prev]);
    addToast("success", "Lead Added", `${newLead.name} captured into CRM pipeline.`);
  };

  const updateLeadStage = (id: string, stage: Lead["stage"]) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
  };

  // Leaves & Attendance
  const addLeaveRequest = (req: Omit<LeaveRequest, "id" | "status">) => {
    const newLeave: LeaveRequest = {
      ...req,
      id: generateId("lv"),
      status: "pending",
    };
    setLeaves((prev) => [newLeave, ...prev]);
    addToast("info", "Leave Request Submitted", "Pending manager approval.");
  };

  const updateLeaveStatus = (id: string, status: LeaveRequest["status"]) => {
    setLeaves((prev) => prev.map((lv) => (lv.id === id ? { ...lv, status } : lv)));
    addToast("success", "Leave Updated", `Leave request marked as ${status}.`);
  };

  const clockInEmployee = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newAtt: AttendanceRecord = {
      id: generateId("att"),
      employeeId,
      employeeName: emp.name,
      date: selectedDate,
      checkIn: timeStr,
      status: "present",
      workingHours: 8,
    };
    setAttendance((prev) => [newAtt, ...prev]);
    addToast("success", "Clocked In", `${emp.name} checked in at ${timeStr}.`);
  };

  const clockOutEmployee = (employeeId: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setAttendance((prev) =>
      prev.map((att) =>
        att.employeeId === employeeId && att.date === selectedDate
          ? { ...att, checkOut: timeStr }
          : att
      )
    );
    addToast("info", "Clocked Out", `Check-out recorded at ${timeStr}.`);
  };

  // Customer Service & Tickets
  const createTicket = (ticketData: Omit<CustomerTicket, "id" | "ticketNumber" | "createdAt">) => {
    const newTicket: CustomerTicket = {
      ...ticketData,
      id: generateId("tkt"),
      ticketNumber: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };
    setTickets((prev) => [newTicket, ...prev]);
    addToast("success", "Ticket Raised", `Support ticket ${newTicket.ticketNumber} opened.`);
  };

  const replyToTicket = (ticketId: string, text: string, senderRole: "customer" | "staff" | "manager") => {
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const senderName =
      senderRole === "customer"
        ? currentCustomer.name
        : senderRole === "staff"
          ? currentStaff.name
          : "Operations Manager";

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            messages: [
              ...t.messages,
              {
                sender: senderName,
                role: senderRole,
                text,
                time: nowStr,
              },
            ],
          };
        }
        return t;
      })
    );
    addToast("info", "Message Sent", "Ticket conversation updated.");
  };

  const addCustomer = (customerData: Partial<Customer>): Customer => {
    // Resolve preferred branch ID (ensure it exists in loaded branches, otherwise undefined)
    const branchCandidate = customerData.preferredBranchId || selectedBranchId || "";
    const validBranch = branches.find((b) => b.id === branchCandidate) || branches[0] || null;
    const resolvedBranchId = validBranch ? validBranch.id : undefined;

    const newCust: Customer = {
      id: generateId("cust"),
      name: customerData.name || "",
      email: customerData.email || "",
      phone: customerData.phone || "",
      avatar: customerData.avatar || "",
      gender: (customerData.gender as any) || "female",
      joinedDate: customerData.joinedDate || new Date().toISOString().split("T")[0],
      preferredBranchId: resolvedBranchId || "",
      walletBalance: customerData.walletBalance ?? 0,
      loyaltyPoints: customerData.loyaltyPoints ?? 0,
      membershipTier: customerData.membershipTier || "Standard",
      packages: customerData.packages || [],
      beautyProfile: customerData.beautyProfile || {
        hairType: "",
        hairTexture: "",
        scalpCondition: "",
        skinType: "",
        skinConcerns: [],
        allergies: [],
        preferredBeverage: "",
        preferredMusic: "",
        lastConsultationDate: "",
      },
      totalSpent: customerData.totalSpent ?? 0,
      totalSpend: customerData.totalSpend ?? 0,
      visitsCount: customerData.visitsCount ?? 0,
      totalVisits: customerData.totalVisits ?? 0,
      segment: customerData.segment || "New Customer",
      tags: customerData.tags || [],
      notes: customerData.notes || "",
    };
    setCustomers((prev) => [newCust, ...prev]);

    // Asynchronously synchronize customer with Backend API & PostgreSQL
    CRMService.createCustomer({
      name: newCust.name,
      phone: newCust.phone,
      gender: newCust.gender as any,
      email: newCust.email || undefined,
      tier: newCust.membershipTier,
      notes: newCust.notes,
      preferred_branch_id: resolvedBranchId,
    }).catch((err) => {
      console.error("[CRM] Customer creation sync error:", err);
    });

    addToast("success", "Customer Created", `${newCust.name} has been enrolled in the Salon CRM.`);
    return newCust;
  };

  const addEmployee = (empData: Partial<Employee>): Employee => {
    const branchCandidate = empData.branchId || selectedBranchId || "";
    const validBranch = branches.find((b) => b.id === branchCandidate) || branches[0] || null;
    const resolvedBranchId = validBranch ? validBranch.id : (branches[0]?.id || "");

    const newEmp: Employee = {
      id: generateId("emp"),
      name: empData.name || "",
      code: empData.code || "",
      email: empData.email || "",
      phone: empData.phone || "",
      avatar: empData.avatar || "",
      branchId: resolvedBranchId,
      department: empData.department || "",
      designation: empData.designation || "",
      tier: empData.tier || ("" as any),
      joinDate: empData.joinDate || new Date().toISOString().split("T")[0],
      salaryBase: empData.salaryBase ?? 0,
      basicSalary: empData.basicSalary ?? 0,
      hra: empData.hra ?? 0,
      allowances: empData.allowances ?? 0,
      statutoryDed: empData.statutoryDed ?? 0,
      netTakeHome: empData.netTakeHome ?? 0,
      commissionRate: empData.commissionRate ?? 0,
      status: empData.status || "active",
      employmentType: empData.employmentType || "",
      skills: empData.skills || [],
      documentsSubmitted: empData.documentsSubmitted || [],
      performanceRating: empData.performanceRating ?? 0,
      monthlyCommission: empData.monthlyCommission ?? 0,
      shiftsThisMonth: empData.shiftsThisMonth ?? 0,
      leaveBalance: empData.leaveBalance ?? 0,
    };
    setEmployees((prev) => [newEmp, ...prev]);

    // Asynchronously synchronize employee with Backend API & PostgreSQL
    HRMSService.createEmployee({
      name: newEmp.name,
      email: newEmp.email,
      phone: newEmp.phone,
      branch_id: newEmp.branchId,
      department: newEmp.department,
      designation: newEmp.designation,
      tier: newEmp.tier,
      join_date: newEmp.joinDate,
      salary_base: newEmp.salaryBase,
      basic_salary: newEmp.basicSalary,
      hra: newEmp.hra,
      allowances: newEmp.allowances,
      statutory_ded: newEmp.statutoryDed,
      net_take_home: newEmp.netTakeHome,
      commission_rate: newEmp.commissionRate / 100,
      status: newEmp.status,
      code: newEmp.code,
      employment_type: newEmp.employmentType,
      skills: newEmp.skills,
    }).catch(() => {});

    addToast("success", "Artisan Onboarded", `${newEmp.name} has joined the team.`);
    return newEmp;
  };

  const addService = (serviceData: Partial<Service>): Service => {
    const newService: Service = {
      id: generateId("srv"),
      name: serviceData.name || "New Treatment",
      categoryId: serviceData.categoryId || "cat_hair",
      categoryName: serviceData.categoryName || "Hair Couture & Styling",
      basePrice: serviceData.basePrice || 0,
      durationMinutes: serviceData.durationMinutes || 45,
      shortDesc: serviceData.shortDesc || "",
      fullDesc: serviceData.fullDesc || serviceData.shortDesc || "",
      gender: serviceData.gender || ["women", "unisex"],
      branchIds: serviceData.branchIds || (selectedBranchId ? [selectedBranchId] : []),
      image: serviceData.image || "",
      requiredSkills: serviceData.requiredSkills || [],
    };
    setServices((prev) => [newService, ...prev]);

    // Asynchronously synchronize service with Backend API & PostgreSQL
    SalonCatalogService.createService({
      name: newService.name,
      category_id: newService.categoryId,
      category_name: newService.categoryName,
      base_price: newService.basePrice,
      duration_minutes: newService.durationMinutes,
      short_desc: newService.shortDesc,
      full_desc: newService.fullDesc,
      gender: newService.gender,
      branch_ids: newService.branchIds,
      image: newService.image,
      required_skills: newService.requiredSkills,
    }).catch(() => {});

    addToast("success", "Service Added", `${newService.name} added to catalog.`);
    return newService;
  };


  const bulkAddServices = (newItems: Partial<Service>[], replace: boolean = false) => {
    const prepared: Service[] = newItems.map((item) => ({
      id: item.id || generateId("srv"),
      name: item.name || "",
      categoryId: item.categoryId || "",
      categoryName: item.categoryName || "",
      basePrice: item.basePrice || 0,
      durationMinutes: item.durationMinutes || 0,
      shortDesc: item.shortDesc || "",
      fullDesc: item.fullDesc || item.shortDesc || "",
      gender: item.gender || [],
      branchIds: item.branchIds || (selectedBranchId ? [selectedBranchId] : []),
      image: item.image || "",
      requiredSkills: item.requiredSkills || [],
      ...item,
    }));

    if (replace) {
      setServices(prepared);
    } else {
      setServices((prev) => [...prepared, ...prev]);
    }
    addToast("success", "Bulk Import Done", `Imported ${prepared.length} services.`);
  };

  const bulkAddCustomers = (newItems: Partial<Customer>[], replace: boolean = false) => {
    const prepared: Customer[] = newItems.map((item) => ({
      id: item.id || generateId("cust"),
      name: item.name || "",
      phone: item.phone || "",
      email: item.email || "",
      avatar: item.avatar || "",
      gender: item.gender || "female",
      joinedDate: item.joinedDate || new Date().toISOString().split("T")[0],
      preferredBranchId: item.preferredBranchId || selectedBranchId || "",
      walletBalance: item.walletBalance ?? 0,
      loyaltyPoints: item.loyaltyPoints ?? 0,
      membershipTier: item.membershipTier || "Standard",
      packages: item.packages || [],
      beautyProfile: item.beautyProfile || {
        hairType: "",
        hairTexture: "",
        scalpCondition: "",
        skinType: "",
        skinConcerns: [],
        allergies: [],
        preferredBeverage: "",
        preferredMusic: "",
        lastConsultationDate: "",
      },
      totalSpent: item.totalSpent ?? 0,
      totalSpend: item.totalSpend ?? 0,
      visitsCount: item.visitsCount ?? 0,
      totalVisits: item.totalVisits ?? 0,
      segment: item.segment || "New Customer",
      tags: item.tags || [],
      notes: item.notes || "",
      ...item,
    }));

    if (replace) {
      setCustomers(prepared);
    } else {
      setCustomers((prev) => [...prepared, ...prev]);
    }
    addToast("success", "Bulk Import Done", `Imported ${prepared.length} customer records.`);
  };

  const bulkAddInventory = (newItems: Partial<InventoryProduct>[], replace: boolean = false) => {
    const prepared: InventoryProduct[] = newItems.map((item) => ({
      id: item.id || generateId("prod"),
      sku: item.sku || "",
      name: item.name || "",
      brand: item.brand || "",
      category: item.category || ("" as any),
      unit: item.unit || ("" as any),
      costPrice: item.costPrice || 0,
      retailPrice: item.retailPrice || 0,
      stocksByBranch: item.stocksByBranch || (selectedBranchId ? {
        [selectedBranchId]: { current: item.currentStock || 0, minThreshold: item.reorderThreshold || 0, optimal: (item.currentStock || 0) * 2 },
      } : {}),
      currentStock: item.currentStock || 0,
      reorderThreshold: item.reorderThreshold || 0,
      supplier: item.supplier || "",
      lastRestocked: new Date().toISOString().split("T")[0],
      isRetail: item.isRetail ?? true,
      ...item,
    }));

    if (replace) {
      setInventory(prepared);
    } else {
      setInventory((prev) => [...prepared, ...prev]);
    }
    addToast("success", "Bulk Import Done", `Imported ${prepared.length} inventory products.`);
  };

  return (
    <SalonContext.Provider
      value={{
        activeRole,
        setActiveRole,
        currentUser,
        setCurrentUser,
        loginUser,
        logoutUser,
        currentOrganization,
        organizations,
        setOrganization,
        policyConfig,
        updatePolicyConfig,
        approvals,
        addApprovalRequest,
        decideApproval,
        auditLogs,
        recordAuditLog,
        serviceAllocations,
        addServiceAllocation,
        consumeAllocation,
        selectedBranchId,
        setSelectedBranchId,
        selectedBranch,
        branches,
        setBranches,
        addBranch,
        deleteBranch,
        activeModule,
        setActiveModule,
        activeSubTab,
        setActiveSubTab,
        selectedDate,
        setSelectedDate,
        currentCustomer,
        setCurrentCustomer,
        currentStaff,
        ownerProfile,
        setOwnerProfile,
        updateOwnerProfile,
        mfaSettings,
        setMfaSettings,
        toggleMfaMaster,
        togglePageMfa,
        customizationSettings,
        setCustomizationSettings,
        updateCustomization,
        gstSettings,
        setGstSettings,
        updateGstSettings,
        categories: MOCK_CATEGORIES,
        hydrateFromBackend,
        services,
        setServices,
        filteredServices,
        stylists,
        filteredStylists,
        customers,
        setCustomers,
        appointments,
        branchAppointments,
        inventory,
        setInventory,
        employees,
        setEmployees,
        attendance,
        leaves,
        leads,
        campaigns,
        coupons,
        expenses,
        tickets,
        memberships: MOCK_MEMBERSHIPS,
        invoices,
        timeSlots,
        setTimeSlots,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        processPOSCheckout,
        addAppointment,
        bookAppointment,
        rescheduleAppointment,
        toggleSlotAvailability,
        updateSlotConfig,
        addCustomSlot,
        deleteSlot,
        addCustomer,
        bulkAddCustomers,
        addService,
        bulkAddServices,
        bulkAddInventory,
        addEmployee,
        updateAppointmentStatus,
        updateAppointmentDetails,
        deductInventory,
        restockInventory,
        transferStock,
        addLead,
        updateLeadStage,
        addLeaveRequest,
        updateLeaveStatus,
        clockInEmployee,
        clockOutEmployee,
        createTicket,
        replyToTicket,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </SalonContext.Provider>
  );
}

export function useSalon() {
  const context = useContext(SalonContext);
  return context || defaultSalonContext;
}
