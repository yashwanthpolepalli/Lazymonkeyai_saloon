/**
 * BusinessOSAI API Integration Client & Type-safe Service Layer
 * Directly mapped to BusinessOSAI Backend Routers:
 * - /api/v1/auth (Login, Register, User profile)
 * - /api/v1/branches (Branches CRUD)
 * - /api/v1/services & /api/v1/categories (Services & Categories catalog)
 * - /api/v1/stylists (Stylists & time slots)
 * - /api/v1/appointments (Booking lifecycle, rescheduling)
 * - /api/v1/crm (Customers, Memberships, Wallet, Loyalty, WhatsApp)
 * - /api/v1/pos (Transactions, Products, Billing)
 * - /api/v1/hrms (Employees, Attendance, Payroll)
 * - /api/v1/inventory (Master Catalog, Stock Movements, Adjustments)
 * - /api/v1/erp (Invoices, Tax, GST, Organizations)
 * - /api/v1/marketing (Campaigns, Coupons, Leads)
 * - /api/v1/finance (Expenses, Financial summaries)
 * - /api/v1/tickets (Customer support tickets & chat)
 * - /api/v1/settings (Customization, GST, MFA, Profile)
 */

export const API_BASE_URL: string =
  ((import.meta as any).env?.VITE_API_URL as string) ||
  ((import.meta as any).env?.PROD ? "/api/v1" : "http://localhost:8000/api/v1");

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Request helper with JWT Bearer token support and graceful offline handling
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.warn(`[BusinessOSAI API] Request to ${endpoint} fallback:`, error);
    throw error;
  }
}

// 1. Auth Service
export const AuthService = {
  login: (credentials: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string; expires_in: number; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData: { email: string; password: string; name: string; phone?: string; role?: string }) =>
    request<{ access_token: string; token_type: string; expires_in: number; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getMe: () => request<any>("/auth/me"),
};

// 2. Branches Service
export const BranchService = {
  getBranches: () => request<any[]>("/branches"),
  createBranch: (branchData: any) =>
    request<any>("/branches", {
      method: "POST",
      body: JSON.stringify(branchData),
    }),
  updateBranch: (branchId: string, branchData: any) =>
    request<any>(`/branches/${branchId}`, {
      method: "PUT",
      body: JSON.stringify(branchData),
    }),
  deleteBranch: (branchId: string) =>
    request<void>(`/branches/${branchId}`, {
      method: "DELETE",
    }),
};

// 3. Services & Categories Catalog Service
export const SalonCatalogService = {
  getCategories: () => request<any[]>("/categories"),
  createCategory: (catData: any) =>
    request<any>("/categories", {
      method: "POST",
      body: JSON.stringify(catData),
    }),
  getServices: (params?: { category_id?: string; gender?: string; branch_id?: string; search?: string }) =>
    request<any[]>(`/services?${new URLSearchParams(params as any).toString()}`),
  createService: (serviceData: any) =>
    request<any>("/services", {
      method: "POST",
      body: JSON.stringify(serviceData),
    }),
  updateService: (serviceId: string, serviceData: any) =>
    request<any>(`/services/${serviceId}`, {
      method: "PUT",
      body: JSON.stringify(serviceData),
    }),
  deleteService: (serviceId: string) =>
    request<void>(`/services/${serviceId}`, {
      method: "DELETE",
    }),
  getStylists: (branchId?: string) =>
    request<any[]>(`/stylists${branchId ? `?branch_id=${branchId}` : ""}`),
  createStylist: (stylistData: any) =>
    request<any>("/stylists", {
      method: "POST",
      body: JSON.stringify(stylistData),
    }),
  getTimeSlots: (branchId?: string) =>
    request<any[]>(`/stylists/time_slots/all${branchId ? `?branch_id=${branchId}` : ""}`),
};

// 4. Appointments Service
export const AppointmentService = {
  getAppointments: (params?: { branch_id?: string; customer_id?: string; stylist_id?: string; date?: string; status_filter?: string }) =>
    request<any[]>(`/appointments?${new URLSearchParams(params as any).toString()}`),
  bookAppointment: (appointmentData: any) =>
    request<any>("/appointments", {
      method: "POST",
      body: JSON.stringify(appointmentData),
    }),
  updateAppointment: (appointmentId: string, updates: any) =>
    request<any>(`/appointments/${appointmentId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  rescheduleAppointment: (appointmentId: string, newDate: string, newTimeSlot: string, newStylistId?: string) =>
    request<any>(`/appointments/${appointmentId}/reschedule`, {
      method: "POST",
      body: JSON.stringify({ new_date: newDate, new_time_slot: newTimeSlot, new_stylist_id: newStylistId }),
    }),
};

// 5. CRM & Customer 360 API Service
export const CRMService = {
  getCustomers: (params?: { search?: string; tier?: string; segment?: string; branch_id?: string }) =>
    request<any[]>(`/crm/customers?${new URLSearchParams(params as any).toString()}`),
  
  createCustomer: (customerData: {
    name: string;
    phone: string;
    gender?: "male" | "female" | "unspecified";
    email?: string;
    tier?: string;
    notes?: string;
    preferred_branch_id?: string;
  }) =>
    request<any>("/crm/customers", {
      method: "POST",
      body: JSON.stringify(customerData),
    }),

  updateCustomer: (customerId: string, customerData: any) =>
    request<any>(`/crm/customers/${customerId}`, {
      method: "PUT",
      body: JSON.stringify(customerData),
    }),

  getMemberships: () =>
    request<any[]>("/crm_modules/memberships"),

  getWalletBalance: (customerId: string) =>
    request<{ balance: number; currency: string; history: any[] }>(`/crm_modules/wallet/${customerId}`),

  topUpWallet: (customerId: string, amount: number, bonus: number, paymentMethod: string) =>
    request<{ newBalance: number; txId: string }>("/crm_modules/wallet/topup", {
      method: "POST",
      body: JSON.stringify({ customer_id: customerId, amount, bonus, payment_method: paymentMethod }),
    }),

  sendWhatsAppNotification: (phone: string, template: string, variables: Record<string, string>) =>
    request<{ status: string; messageId: string }>("/crm_modules/whatsapp/send", {
      method: "POST",
      body: JSON.stringify({ phone, template, variables }),
    }),
  
  getLeads: () => request<any[]>("/crm/leads"),
};

// 6. POS & Billing API Service
export const POSService = {
  getProductsAndServices: (category?: string) =>
    request<any[]>(`/pos/products${category ? `?category=${category}` : ""}`),

  createTransaction: (orderData: {
    customerId?: string;
    customerName: string;
    customerPhone?: string;
    branchId?: string;
    branchName?: string;
    items: Array<any>;
    subtotal: number;
    discountAmount: number;
    gstAmount: number;
    tipAmount: number;
    totalAmount: number;
    paymentMode: "cash" | "card" | "upi" | "wallet" | "split" | string;
    payments?: Array<any>;
    cashierName?: string;
    notes?: string;
  }) =>
    request<{ invoice_id: string; invoice_number: string; receipt_url: string }>("/pos/transactions", {
      method: "POST",
      body: JSON.stringify({
        customer_id: orderData.customerId,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        branch_id: orderData.branchId,
        branch_name: orderData.branchName,
        items: orderData.items,
        subtotal: orderData.subtotal,
        discount_amount: orderData.discountAmount,
        gst_amount: orderData.gstAmount,
        tip_amount: orderData.tipAmount,
        total_amount: orderData.totalAmount,
        payment_mode: orderData.paymentMode,
        payments: orderData.payments,
        cashier_name: orderData.cashierName,
        notes: orderData.notes,
      }),
    }),
};

// 7. HRMS & Staff API Service
export const HRMSService = {
  getStaffRoster: (branchId?: string) =>
    request<any[]>(`/hrms/employees${branchId ? `?branch_id=${branchId}` : ""}`),

  createEmployee: (employeeData: any) =>
    request<any>("/hrms/employees", {
      method: "POST",
      body: JSON.stringify(employeeData),
    }),

  clockAttendance: (staffId: string, action: "clock_in" | "clock_out" | "tea_break") =>
    request<{ status: string; timestamp: string; active_shift_hours: number }>("/hrms/attendance/clock", {
      method: "POST",
      body: JSON.stringify({ staff_id: staffId, action }),
    }),

  getPayrollSlips: (staffId?: string, month?: string) =>
    request<any[]>(`/hrms/payroll?${new URLSearchParams({ ...(staffId ? { employee_id: staffId } : {}), ...(month ? { month } : {}) }).toString()}`),

  getLeaves: () => request<any[]>("/hrms/leaves"),
  applyLeave: (leaveData: any) =>
    request<any>("/hrms/leaves", {
      method: "POST",
      body: JSON.stringify(leaveData),
    }),
};

// 8. Inventory API Service
export const InventoryService = {
  getItems: (lowStockOnly: boolean = false) =>
    request<any[]>(`/inventory/master_catalog${lowStockOnly ? "?low_stock=true" : ""}`),

  createItem: (productData: any) =>
    request<any>("/inventory/products", {
      method: "POST",
      body: JSON.stringify(productData),
    }),

  adjustStock: (itemId: string, adjustmentQty: number, reason: string) =>
    request<{ newStock: number }>(`/inventory/stock_adjustment`, {
      method: "POST",
      body: JSON.stringify({ item_id: itemId, adjustment_qty: adjustmentQty, reason }),
    }),

  getMovements: (productId?: string) =>
    request<any[]>(`/inventory/movements${productId ? `?product_id=${productId}` : ""}`),
};

// 9. Invoicing & ERP Accounting Service
export const ERPService = {
  getInvoices: (limit: number = 20) =>
    request<any[]>(`/erp/invoices?limit=${limit}`),

  getTaxSummary: (fiscalQuarter?: string) =>
    request<{ total_gst: number; cgst: number; sgst: number; igst: number; taxable_turnover: number }>("/erp/tax/summary"),

  getFinancialSummary: () =>
    request<{ total_revenue: number; total_expenses: number; net_profit: number; profit_margin_pct: number }>("/erp/accounting/financial_summary"),
};

// 10. System Settings & Customization Service
export const SettingsService = {
  getOwnerProfile: () => request<any>("/settings/owner_profile"),
  updateOwnerProfile: (data: any) =>
    request<any>("/settings/owner_profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getCustomization: () => request<any>("/settings/customization"),
  updateCustomization: (data: any) =>
    request<any>("/settings/customization", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getGstSettings: () => request<any>("/settings/gst"),
  updateGstSettings: (data: any) =>
    request<any>("/settings/gst", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getMfaSettings: () => request<any>("/settings/mfa"),
  updateMfaSettings: (data: any) =>
    request<any>("/settings/mfa", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
