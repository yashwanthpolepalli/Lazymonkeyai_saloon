import {
  Salon,
  Branch,
  ServiceCategory,
  Service,
  Stylist,
  MembershipTier,
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
  TimeSlotConfig,
} from "@/types";

// Zero Hardcoded Default Collections - All Data Hydrates Dynamically from PostgreSQL REST API
export const MOCK_BRANCHES: Branch[] = [];

export const MOCK_SALON: Salon = {
  id: "salon_root",
  name: "SalonOS Multi-Tenant Platform",
  brandName: "SalonOS",
  tagline: "Enterprise Luxury Operating System",
  logo: "",
  branches: [],
};

export const MOCK_CATEGORIES: ServiceCategory[] = [];
export const MOCK_SERVICES: Service[] = [];
export const MOCK_STYLISTS: Stylist[] = [];
export const MOCK_MEMBERSHIPS: MembershipTier[] = [];
export const MOCK_CUSTOMERS: Customer[] = [];
export const MOCK_APPOINTMENTS: Appointment[] = [];
export const MOCK_INVENTORY: InventoryProduct[] = [];
export const MOCK_EMPLOYEES: Employee[] = [];
export const MOCK_ATTENDANCE: AttendanceRecord[] = [];
export const MOCK_LEAVES: LeaveRequest[] = [];
export const MOCK_LEADS: Lead[] = [];
export const MOCK_CAMPAIGNS: Campaign[] = [];
export const MOCK_COUPONS: Coupon[] = [];
export const MOCK_EXPENSES: FinancialExpense[] = [];
export const MOCK_TICKETS: CustomerTicket[] = [];

// Standard Dynamic Operational Business Time Slots (9:00 AM - 8:30 PM)
export const DEFAULT_TIME_SLOTS: TimeSlotConfig[] = [
  { id: "ts_0900", time: "09:00 AM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_0930", time: "09:30 AM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1000", time: "10:00 AM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1030", time: "10:30 AM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1100", time: "11:00 AM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1130", time: "11:30 AM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1200", time: "12:00 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1230", time: "12:30 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1300", time: "01:00 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1330", time: "01:30 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1400", time: "02:00 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1430", time: "02:30 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1500", time: "03:00 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1530", time: "03:30 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1600", time: "04:00 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1630", time: "04:30 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1700", time: "05:00 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1730", time: "05:30 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1800", time: "06:00 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1830", time: "06:30 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1900", time: "07:00 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_1930", time: "07:30 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_2000", time: "08:00 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
  { id: "ts_2030", time: "08:30 PM", isAvailable: true, allowedGenders: ["women", "men", "kids", "unisex"], allowedCategories: ["all"], slotType: "regular" },
];
