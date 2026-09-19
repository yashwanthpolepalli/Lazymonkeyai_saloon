export type Role = "customer" | "owner" | "staff" | "admin";

export type GenderType = "women" | "men" | "kids" | "unisex";

export type StylistTier = "master" | "senior" | "executive" | "director";

export interface Branch {
  id: string;
  name: string;
  code: string;
  branchType?: "Flagship Studio" | "Express Bar" | "Luxury Suite" | "Franchise Partner" | "Resort Spa" | string;
  managerName?: string;
  status: "active" | "maintenance" | "opening_soon" | "under_renovation" | string;
  phone: string;
  email: string;
  whatsapp?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  pinCode?: string;
  mapLocation?: string;
  currency: string;
  taxRate: number; // e.g. 0.18 for 18% GST
  rating: number;
  totalReviews: number;
  image: string;
  logo?: string;
  description?: string;
  chairsCount: number;
  openingHours: string;
}

export interface Salon {
  id: string;
  name: string;
  brandName: string;
  tagline: string;
  logo: string;
  branches: Branch[];
}

export interface ServiceOptionGroup {
  id: string;
  name: string; // e.g. "Hair Length", "Skin Type", "Occasion"
  required: boolean;
  options: {
    id: string;
    label: string; // e.g. "Short", "Medium", "Long", "Sensitive Skin", "Bridal"
    priceDelta: number;
    durationDeltaMinutes: number;
  }[];
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

export type MasterCategoryName =
  | "Hair"
  | "Beard & Grooming"
  | "Facial & Skin"
  | "Threading"
  | "Waxing"
  | "Nails"
  | "Spa & Massage"
  | "Makeup"
  | "Bridal"
  | "Mehendi"
  | "Body Care"
  | "Hair Removal";

export interface ServiceVariant {
  audience: GenderType;
  price: number;
  memberPrice?: number;
  durationMinutes: number;
  isActive?: boolean;
}

export interface BranchPricingConfig {
  price: number;
  memberPrice?: number;
  durationMinutes?: number;
  isActive?: boolean;
}

export interface Service {
  id: string;
  categoryId: string;
  categoryName: string;
  subcategory?: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  basePrice: number;
  memberPrice?: number;
  durationMinutes: number;
  gender: GenderType[];
  branchIds: string[]; // which branches offer this
  image: string;
  featured?: boolean;
  isPopular?: boolean;
  variants?: ServiceVariant[];
  branchPricing?: Record<string, BranchPricingConfig>; // branchId -> override price
  optionGroups?: ServiceOptionGroup[];
  addOns?: AddOn[];
  requiredSkills: string[];
  consumedProducts?: {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
  }[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  image: string;
  gender: GenderType[];
  subcategories?: string[];
}

export interface Stylist {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  tier: StylistTier;
  tierMultiplier: number; // e.g. 1.0, 1.25, 1.5
  specialties: string[];
  branchId: string;
  rating: number;
  experienceYears: number;
  bio: string;
  isAvailableToday: boolean;
  commissionRate: number; // e.g. 0.15 for 15%
}

export interface MembershipTier {
  id: string;
  name: string; // "Black Diamond VIP", "Gold Elite", "Rose Silver"
  price: number;
  validityDays: number;
  discountPercentage: number; // e.g. 20 for 20%
  color: string;
  bgGradient: string;
  benefits: string[];
  eligibleCategories: string[];
  eligibleBranches: string[];
  freeMonthlyBlowouts: number;
  priorityBooking: boolean;
}

export interface CustomerMembership {
  tierId: string;
  tierName: string;
  active: boolean;
  expiresAt: string;
  remainingBlowouts: number;
  totalSaved: number;
}

export interface CustomerPackage {
  id: string;
  name: string;
  totalCredits: number;
  remainingCredits: number;
  serviceCategory: string;
  expiresAt: string;
}

export interface BeautyProfile {
  hairType: string;
  hairTexture: string;
  scalpCondition: string;
  skinType: string;
  skinConcerns: string[];
  allergies: string[];
  preferredBeverage: string;
  preferredMusic: string;
  lastConsultationDate: string;
  aiSkinScore?: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  gender: "female" | "male" | "other";
  joinedDate: string;
  preferredBranchId: string;
  preferredStylistId?: string;
  walletBalance: number;
  loyaltyPoints: number;
  membership?: CustomerMembership;
  membershipTier?: string; // alias for tierName
  packages: CustomerPackage[];
  beautyProfile: BeautyProfile;
  totalSpent: number;
  totalSpend?: number; // alias for totalSpent
  visitsCount: number;
  totalVisits?: number; // alias for visitsCount
  segment: "VIP High Spender" | "Regular Loyalist" | "Occasional" | "New Customer" | "At Risk";
  tags: string[];
  notes: string;
  allergies?: string[];
  hairProfile?: any;
  createdAt?: string;
  updatedAt?: string;
}

export type AppointmentStatus =
  | "confirmed"
  | "checked_in"
  | "in_service"
  | "completed"
  | "cancelled"
  | "rescheduled"
  | "no_show";

export interface BookingSelectedOption {
  groupId: string;
  groupName: string;
  optionId: string;
  optionLabel: string;
  priceDelta: number;
}

export interface TimeSlotConfig {
  id: string;
  time: string; // e.g. "10:00 AM"
  isAvailable: boolean;
  blockedReason?: string; // e.g. "Staff Break", "Private VIP Suite", "Sanitization"
  branchId?: string; // "all" or specific branch
  stylistId?: string; // "all" or specific stylist
  allowedGenders?: GenderType[]; // ["women"], ["men"], ["kids"], ["unisex"]
  allowedCategories?: string[]; // category IDs or "all"
  slotType?: "regular" | "women_exclusive" | "men_grooming" | "kids_special" | "bridal_suite" | "express_only" | "break";
}

export interface CustomScheduleRule {
  id: string;
  name: string;
  fromTime: string;
  toTime: string;
  audience: GenderType | "all";
  category: string;
  action: "apply_rule" | "block_range" | "unblock_range";
  customReason?: string;
}

export interface Appointment {
  id: string;
  bookingRef: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  branchId: string;
  branchName: string;
  serviceId: string;
  serviceName: string;
  categoryName: string;
  stylistId: string;
  stylistName: string;
  stylistTier: StylistTier;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM e.g. "14:30"
  durationMinutes: number;
  selectedOptions: BookingSelectedOption[];
  selectedAddOns: AddOn[];
  status: AppointmentStatus;

  // Pricing breakdown
  basePrice: number;
  optionsPrice: number;
  addOnsPrice: number;
  stylistTierMarkup: number;
  subtotal: number;
  membershipDiscount: number;
  packageCreditUsed: boolean;
  walletUsed: number;
  loyaltyDiscount: number;
  couponDiscount: number;
  couponCode?: string;
  taxAmount: number;
  finalTotal: number;

  paymentStatus: "unpaid" | "partially_paid" | "paid" | "refunded";
  paymentMethod?: string;
  chairNumber?: number;
  serviceNotes?: string;
  beforePhoto?: string;
  afterPhoto?: string;
  productsUsed?: { productId: string; name: string; quantity: number }[];
  clientFeedbackRating?: number;
  clientFeedbackReview?: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  serviceId?: string;
  productId?: string;
  type: "service" | "product";
  name: string;
  category?: string;
  price: number;
  basePrice?: number;
  finalPrice?: number;
  durationMinutes?: number;
  quantity: number;
  stylistId?: string;
  stylistName?: string;
  selectedOptions?: BookingSelectedOption[];
  selectedAddOns?: AddOn[];
}

export interface SplitPayment {
  method: "cash" | "upi" | "card" | "wallet" | "loyalty";
  amount: number;
  reference?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  appointmentId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  branchId: string;
  branchName: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  finalTotal: number;
  payments: SplitPayment[];
  paymentStatus: "paid" | "partial" | "pending";
  date: string;
  cashierName: string;
}

// HRMS Entities
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  branchId: string;
  department: "Hair Styling" | "Esthetics & Spa" | "Nail Art" | "Management" | "Front Desk";
  designation: string;
  tier: StylistTier;
  joinDate: string;
  salaryBase: number;
  commissionRate: number; // percentage
  status: "active" | "on_leave" | "probation";
  code?: string;
  reportingManager?: string;
  employmentType?: "Full-Time" | "Part-Time" | "Contract";
  basicSalary?: number;
  hra?: number;
  allowances?: number;
  statutoryDed?: number;
  netTakeHome?: number;
  role?: string;
  skills: string[];
  documentsSubmitted: string[];
  performanceRating: number;
  monthlyCommission: number;
  shiftsThisMonth: number;
  leaveBalance: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: "present" | "late" | "absent" | "half_day";
  workingHours: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  type: "casual" | "sick" | "paid" | "emergency";
  reason: string;
  status: "pending" | "approved" | "rejected";
}

// Inventory Entities
export interface InventoryProduct {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: "Hair Care" | "Skin Care" | "Colorants" | "Nail Polish" | "Styling Tools" | "Spa Oils";
  unit: "ml" | "grams" | "bottles" | "tubes" | "units";
  costPrice: number;
  retailPrice: number;
  stocksByBranch: Record<string, { current: number; minThreshold: number; optimal: number }>;
  currentStock?: number;
  reorderThreshold?: number;
  image?: string;
  supplier: string;
  lastRestocked: string;
  isRetail: boolean; // available for POS sale to clients
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: "consumption" | "purchase" | "transfer" | "wastage" | "pos_sale";
  branchId: string;
  quantity: number;
  unit: string;
  reference: string;
  date: string;
  performedBy: string;
}

// CRM Entities
export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: "Instagram Ad" | "Google Search" | "Walk-in Inquiry" | "Referral" | "Influencer Campaign";
  stage: "New" | "Contacted" | "Consultation Booked" | "Converted" | "Lost";
  interestedService: string;
  estimatedValue: number;
  assignedStaff: string;
  createdDate: string;
}

// Marketing Entities
export interface Campaign {
  id: string;
  title: string;
  channel: "WhatsApp" | "SMS" | "Email" | "Instagram";
  status: "active" | "draft" | "completed";
  targetSegment: string;
  audienceCount: number;
  sentCount: number;
  openedRate: number;
  conversions: number;
  revenueGenerated: number;
  discountCode?: string;
  startDate: string;
  endDate: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent?: number;
  flatDiscount?: number;
  minSpend: number;
  maxDiscount?: number;
  validUntil: string;
  timesUsed: number;
  maxUsage: number;
  applicableBranches: string[];
}

// Finance Entities
export interface FinancialExpense {
  id: string;
  branchId: string;
  category: "Rent & Lease" | "Staff Payroll" | "Inventory Stock" | "Utilities & Power" | "Marketing" | "Salon Maintenance";
  amount: number;
  date: string;
  paidTo: string;
  paymentMethod: string;
  receiptUrl?: string;
  status: "approved" | "pending";
}

// Customer Service Entities
export interface CustomerTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  branchId: string;
  subject: string;
  category: "Service Quality" | "Billing / Refund" | "Booking Reschedule" | "Stylist Feedback" | "Product Allergy";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "escalated";
  slaMinutesRemaining: number;
  assignedTo: string;
  createdAt: string;
  messages: {
    sender: string;
    role: "customer" | "staff" | "manager";
    text: string;
    time: string;
  }[];
}

// Settings, Profile & Security Entities
export interface OwnerProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  avatarUrl: string;
  bio: string;
  role: string;
}

export interface MFASettings {
  isMFAEnabled: boolean;
  mfaMethod: "authenticator" | "sms" | "email";
  backupPhone: string;
  backupEmail: string;
  pageProtection: {
    posPayments: boolean;
    payrollStructures: boolean;
    inventoryCosting: boolean;
    customerExport: boolean;
    branchPlatform: boolean;
    staffManagement: boolean;
  };
}

export interface SalonCustomization {
  salonName: string;
  tagline: string;
  logoUrl?: string;
  monogram?: string;
  brandColor: string;
  accentPreset: "sky" | "amber" | "rose" | "emerald" | "violet";
  currencySymbol: string;
  taxRatePct: number;
  invoiceHeader: string;
  invoiceFooter: string;
  slotDuration: number;
  bufferTime: number;
  smsBookingConfirm: boolean;
  smsReminder2h: boolean;
  whatsappReceipt: boolean;
  onlineBookingOpen: boolean;
}

export interface GSTDiscountSettings {
  isGstEnabled: boolean;
  isDiscountEnabled: boolean;
  isSgstEnabled: boolean;
  isCgstEnabled: boolean;
  isIgstEnabled: boolean;
  gstRatePct: number;
  cgstRatePct: number;
  sgstRatePct: number;
  igstRatePct: number;
  gstin: string;
  hsnSacCode: string;
  taxPricingMode: "exclusive" | "inclusive";
  defaultDiscountPresets: number[];
  maxCashierDiscountPct: number;
  applyDiscountBeforeTax: boolean;
  membershipDiscounts: {
    regular: number;
    silver: number;
    gold: number;
    platinum: number;
  };
}


