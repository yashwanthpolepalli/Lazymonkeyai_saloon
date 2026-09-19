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
import { generateId } from "@/lib/utils";
import {
  BranchService,
  SalonCatalogService,
  AppointmentService,
  CRMService,
  POSService,
  HRMSService,
  InventoryService,
  ERPService,
  SettingsService
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
  | "system";

export interface ToastMessage {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
}

interface SalonContextType {
  // Navigation & Role State
  activeRole: Role;
  setActiveRole: (role: Role) => void;
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

  // Feedback Toasts
  toasts: ToastMessage[];
  addToast: (type: ToastMessage["type"], title: string, message: string) => void;
  removeToast: (id: string) => void;
}

export const defaultSalonContext: SalonContextType = {
  activeRole: "owner",
  setActiveRole: () => {},
  selectedBranchId: "br_mumbai",
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
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

export function SalonProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRole] = useState<Role>("owner");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("br_mumbai");
  const [activeModule, setActiveModule] = useState<OwnerModule>("workspace");
  const [activeSubTab, setActiveSubTab] = useState<string>("overview");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Branches state
  const [branches, setBranches] = useState<Branch[]>(() =>
    loadFromStorage("salon_branches", MOCK_BRANCHES)
  );

  // Owner Profile state
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile>(() =>
    loadFromStorage("salon_owner_profile", {
      name: "Alexander Vance",
      title: "Salon Managing Director & Founder",
      email: "alexander.vance@lazymonkeyai.luxury",
      phone: "+91 98200 12345",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      bio: "Visionary owner behind LazyMonkey AI luxury salon chain. Overseeing 8 premier flagship salons globally.",
      role: "Owner / Franchise Operator",
    })
  );

  // MFA & Security state
  const [mfaSettings, setMfaSettings] = useState<MFASettings>(() =>
    loadFromStorage("salon_mfa_settings", {
      isMFAEnabled: true,
      mfaMethod: "authenticator",
      backupPhone: "+91 98200 12345",
      backupEmail: "security@lazymonkeyai.luxury",
      pageProtection: {
        posPayments: true,
        payrollStructures: true,
        inventoryCosting: false,
        customerExport: true,
        branchPlatform: true,
        staffManagement: false,
      },
    })
  );

  // Customization state
  const [customizationSettings, setCustomizationSettings] = useState<SalonCustomization>(() =>
    loadFromStorage("salon_customization_settings", {
      salonName: "LAZYMONKEY AI LUXURY SALON",
      tagline: "The Pinnacle of Haute Coiffure & Bespoke Esthetics",
      logoUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80",
      monogram: "LM",
      brandColor: "#0284c7",
      accentPreset: "sky",
      currencySymbol: "₹",
      taxRatePct: 18,
      invoiceHeader: "Thank you for visiting LazyMonkey Luxury Atelier",
      invoiceFooter: "All services include complimentary champagne & organic styling products. Returns valid within 14 days with original receipt.",
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
      gstin: "29AAAAA0000A1Z5",
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

  // Entities state
  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadFromStorage("salon_customers", MOCK_CUSTOMERS)
  );
  const [currentCustomer, setCurrentCustomer] = useState<Customer>(() =>
    loadFromStorage("salon_current_customer", MOCK_CUSTOMERS[0])
  );
  const [services, setServices] = useState<Service[]>(() =>
    loadFromStorage("salon_services", MOCK_SERVICES)
  );
  const [stylists, setStylists] = useState<Stylist[]>(() =>
    loadFromStorage("salon_stylists", MOCK_STYLISTS)
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    loadFromStorage("salon_appointments", MOCK_APPOINTMENTS)
  );
  const [inventory, setInventory] = useState<InventoryProduct[]>(() =>
    loadFromStorage("salon_inventory", MOCK_INVENTORY)
  );
  const [employees, setEmployees] = useState<Employee[]>(() =>
    loadFromStorage("salon_employees", MOCK_EMPLOYEES)
  );
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() =>
    loadFromStorage("salon_attendance", MOCK_ATTENDANCE)
  );
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() =>
    loadFromStorage("salon_leaves", MOCK_LEAVES)
  );
  const [leads, setLeads] = useState<Lead[]>(() =>
    loadFromStorage("salon_leads", MOCK_LEADS)
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    loadFromStorage("salon_campaigns", MOCK_CAMPAIGNS)
  );
  const [coupons, setCoupons] = useState<Coupon[]>(() =>
    loadFromStorage("salon_coupons", MOCK_COUPONS)
  );
  const [expenses, setExpenses] = useState<FinancialExpense[]>(() =>
    loadFromStorage("salon_expenses", MOCK_EXPENSES)
  );
  const [tickets, setTickets] = useState<CustomerTicket[]>(() =>
    loadFromStorage("salon_tickets", MOCK_TICKETS)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadFromStorage("salon_invoices", [])
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlotConfig[]>(() =>
    loadFromStorage("salon_timeslots", DEFAULT_TIME_SLOTS)
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Hydrate state from Backend API (PostgreSQL database)
  useEffect(() => {
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
        ] = await Promise.allSettled([
          BranchService.getBranches(),
          SalonCatalogService.getServices(),
          SalonCatalogService.getStylists(),
          CRMService.getCustomers(),
          AppointmentService.getAppointments(),
          InventoryService.getItems(),
          HRMSService.getStaffRoster(),
          ERPService.getInvoices(50),
        ]);

        if (remoteBranches.status === "fulfilled" && remoteBranches.value?.length) {
          setBranches(remoteBranches.value);
        }
        if (remoteServices.status === "fulfilled" && remoteServices.value?.length) {
          setServices(remoteServices.value);
        }
        if (remoteStylists.status === "fulfilled" && remoteStylists.value?.length) {
          setStylists(remoteStylists.value);
        }
        if (remoteCustomers.status === "fulfilled" && remoteCustomers.value?.length) {
          setCustomers(remoteCustomers.value);
        }
        if (remoteAppointments.status === "fulfilled" && remoteAppointments.value?.length) {
          setAppointments(remoteAppointments.value);
        }
        if (remoteInventory.status === "fulfilled" && remoteInventory.value?.length) {
          setInventory(remoteInventory.value);
        }
        if (remoteEmployees.status === "fulfilled" && remoteEmployees.value?.length) {
          setEmployees(remoteEmployees.value);
        }
        if (remoteInvoices.status === "fulfilled" && remoteInvoices.value?.length) {
          setInvoices(remoteInvoices.value);
        }
      } catch (err) {
        console.debug("Backend offline, utilizing local reactive state.", err);
      }
    };

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

  const selectedBranch = useMemo(() => {
    return branches.find((b) => b.id === selectedBranchId) || branches[0] || MOCK_BRANCHES[0];
  }, [branches, selectedBranchId]);

  const addBranch = (branchData: Partial<Branch>): Branch => {
    const newBranch: Branch = {
      id: generateId("br"),
      name: branchData.name || "New Flagship Branch",
      code: branchData.code || `LM-0${branches.length + 1}`,
      city: branchData.city || "Mumbai",
      country: branchData.country || "India",
      currency: branchData.currency || "INR",
      taxRate: branchData.taxRate ?? 0.18,
      phone: branchData.phone || "+91 22 4580 9900",
      email: branchData.email || "branch@lazymonkeyai.luxury",
      address: branchData.address || "Flagship Avenue, Suite 100",
      rating: 5.0,
      totalReviews: 0,
      image:
        branchData.image ||
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
      chairsCount: branchData.chairsCount || 10,
      openingHours: branchData.openingHours || "09:00 AM - 09:30 PM",
      status: "active",
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

    addToast("success", "Salon Branch Created", `${newBranch.name} is now active.`);
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

  const currentStaff = useMemo(() => {
    return (
      employees.find((e) => e.branchId === selectedBranchId) ||
      employees[0]
    );
  }, [employees, selectedBranchId]);

  const filteredServices = useMemo(() => {
    return services.filter(
      (s) => s.branchIds.includes(selectedBranchId) || s.branchIds.includes("all") || s.branchIds.length === 0
    );
  }, [services, selectedBranchId]);

  const filteredStylists = useMemo(() => {
    return stylists.filter((s) => s.branchId === selectedBranchId);
  }, [stylists, selectedBranchId]);

  const branchAppointments = useMemo(() => {
    return appointments.filter((a) => a.branchId === selectedBranchId);
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
    const newSlot: TimeSlotConfig = {
      id: generateId("slot"),
      time,
      isAvailable: true,
      branchId,
      stylistId,
      allowedGenders,
      allowedCategories,
      slotType,
    };
    setTimeSlots((prev) => [...prev, newSlot]);
    addToast("success", "Custom Slot Added", `New time slot ${time} is now active.`);
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
    const newCust: Customer = {
      id: generateId("cust"),
      name: customerData.name || "Guest Customer",
      email: customerData.email || "",
      phone: customerData.phone || "",
      avatar: customerData.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
      gender: (customerData.gender as any) || "female",
      joinedDate: new Date().toISOString().split("T")[0],
      preferredBranchId: selectedBranchId,
      walletBalance: customerData.walletBalance || 0,
      loyaltyPoints: customerData.loyaltyPoints || 100,
      membershipTier: customerData.membershipTier || "Rose Silver",
      packages: [],
      beautyProfile: {
        hairType: "Straight / Fine",
        hairTexture: "Silky",
        scalpCondition: "Normal",
        skinType: "Hydrated",
        skinConcerns: [],
        allergies: [],
        preferredBeverage: "Cappuccino",
        preferredMusic: "Lounge Jazz",
        lastConsultationDate: new Date().toISOString().split("T")[0],
      },
      totalSpent: 0,
      totalSpend: 0,
      visitsCount: 1,
      totalVisits: 1,
      segment: "New Customer",
      tags: ["Walk-in"],
      notes: customerData.notes || "",
    };
    setCustomers((prev) => [newCust, ...prev]);

    // Asynchronously synchronize customer with Backend API & PostgreSQL
    CRMService.createCustomer({
      name: newCust.name,
      phone: newCust.phone,
      gender: newCust.gender as any,
      email: newCust.email,
      tier: newCust.membershipTier,
      notes: newCust.notes,
      preferred_branch_id: newCust.preferredBranchId,
    }).catch(() => {});

    addToast("success", "Customer Created", `${newCust.name} has been enrolled in the Salon CRM.`);
    return newCust;
  };

  const addEmployee = (empData: Partial<Employee>): Employee => {
    const newEmp: Employee = {
      id: generateId("emp"),
      name: empData.name || "New Artisan",
      code: empData.code || `EMP-000${employees.length + 1}`,
      email: empData.email || "staff@saloon.luxury",
      phone: empData.phone || "+91 98000 11223",
      avatar: empData.avatar || "",
      branchId: empData.branchId || selectedBranchId,
      department: empData.department || "Hair Styling",
      designation: empData.designation || "—",
      tier: empData.tier || "senior",
      joinDate: empData.joinDate || new Date().toISOString().split("T")[0],
      salaryBase: empData.salaryBase || 45000,
      basicSalary: empData.basicSalary || 25000,
      hra: empData.hra || 10000,
      allowances: empData.allowances || 10000,
      statutoryDed: empData.statutoryDed || 3000,
      netTakeHome: empData.netTakeHome || 42000,
      commissionRate: empData.commissionRate || 15,
      status: "active",
      employmentType: empData.employmentType || "Full-Time",
      skills: empData.skills || ["Balayage", "Styling"],
      documentsSubmitted: ["Identity Proof", "Stylist Certification"],
      performanceRating: 5.0,
      monthlyCommission: 0,
      shiftsThisMonth: 0,
      leaveBalance: 12,
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
      basePrice: serviceData.basePrice || 2500,
      durationMinutes: serviceData.durationMinutes || 45,
      shortDesc: serviceData.shortDesc || "Luxury salon treatment.",
      fullDesc: serviceData.fullDesc || serviceData.shortDesc || "Luxury salon treatment.",
      gender: serviceData.gender || ["women", "unisex"],
      branchIds: serviceData.branchIds || ["br_mumbai", "br_delhi", "br_bengaluru", "br_dubai", "br_london"],
      image:
        serviceData.image ||
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400",
      requiredSkills: ["Styling"],
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
    const prepared: Service[] = newItems.map((item, idx) => ({
      id: item.id || generateId("srv"),
      name: item.name || `Service ${idx + 1}`,
      categoryId: item.categoryId || "cat_hair",
      categoryName: item.categoryName || "Hair Couture & Styling",
      basePrice: item.basePrice || 2000,
      durationMinutes: item.durationMinutes || 45,
      shortDesc: item.shortDesc || "Luxury salon service.",
      fullDesc: item.fullDesc || item.shortDesc || "Luxury salon service.",
      gender: item.gender || ["women", "unisex"],
      branchIds: item.branchIds || ["br_mumbai", "br_delhi", "br_bengaluru", "br_dubai", "br_london"],
      image:
        item.image ||
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400",
      requiredSkills: ["Styling"],
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
    const prepared: Customer[] = newItems.map((item, idx) => ({
      id: item.id || generateId("cust"),
      name: item.name || `Client ${idx + 1}`,
      phone: item.phone || "+91 98000 00000",
      email: item.email || `client${idx + 1}@example.com`,
      avatar: item.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
      gender: item.gender || "female",
      joinedDate: item.joinedDate || new Date().toISOString().split("T")[0],
      preferredBranchId: selectedBranchId,
      walletBalance: item.walletBalance || 0,
      loyaltyPoints: item.loyaltyPoints || 100,
      membershipTier: item.membershipTier || "Rose Silver",
      packages: [],
      beautyProfile: {
        hairType: "Normal",
        hairTexture: "Silky",
        scalpCondition: "Normal",
        skinType: "Hydrated",
        skinConcerns: [],
        allergies: [],
        preferredBeverage: "Cappuccino",
        preferredMusic: "Lounge Jazz",
        lastConsultationDate: new Date().toISOString().split("T")[0],
      },
      totalSpent: item.totalSpent || 0,
      totalSpend: item.totalSpend || 0,
      visitsCount: item.visitsCount || 1,
      totalVisits: item.totalVisits || 1,
      segment: item.segment || "Regular Loyalist",
      tags: item.tags || ["Imported"],
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
    const prepared: InventoryProduct[] = newItems.map((item, idx) => ({
      id: item.id || generateId("prod"),
      sku: item.sku || `SKU-IMP-00${idx + 1}`,
      name: item.name || `Product ${idx + 1}`,
      brand: item.brand || "Luxury Brand",
      category: item.category || "Hair Care",
      unit: item.unit || "bottles",
      costPrice: item.costPrice || 1000,
      retailPrice: item.retailPrice || 1800,
      stocksByBranch: item.stocksByBranch || {
        br_mumbai: { current: item.currentStock || 25, minThreshold: 5, optimal: 50 },
      },
      currentStock: item.currentStock || 25,
      reorderThreshold: item.reorderThreshold || 5,
      supplier: item.supplier || "Official Supplier",
      lastRestocked: new Date().toISOString().split("T")[0],
      isRetail: true,
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
