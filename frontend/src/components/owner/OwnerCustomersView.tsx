"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  Calendar,
  Crown,
  Tag,
  DollarSign,
  Plus,
  CheckCircle2,
  X,
  CreditCard,
  MessageCircle,
  Filter,
  FileSpreadsheet,
  Download,
  Sparkles,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Customer } from "@/types";
import { DataImportModal } from "@/components/common/DataImportModal";
import { downloadCsvFile, SAMPLE_CUSTOMERS_CSV } from "@/lib/csvHelper";
import { CRMService } from "@/services/apiClient";

export function OwnerCustomersView() {
  const { customers, setCustomers, addCustomer, addToast, setActiveModule, setActiveSubTab, setCurrentCustomer, selectedBranch } =
    useSalon();

  const [activeTab, setActiveTab] = useState<"directory" | "formulas" | "vouchers">("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // New Customer Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"female" | "male" | "other">("female");
  const [email, setEmail] = useState("");
  const [membershipTier, setMembershipTier] = useState<"silver" | "gold" | "platinum" | "none">("gold");
  const [notes, setNotes] = useState("");

  // Customer selection & deletion state
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const toggleSelectCustomer = (id: string) => {
    setSelectedCustomerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedCustomerIds.size === filteredCustomers.length && filteredCustomers.length > 0) {
      setSelectedCustomerIds(new Set());
    } else {
      setSelectedCustomerIds(new Set(filteredCustomers.map((c) => c.id)));
    }
  };

  const handleDeleteSingleCustomer = async (cust: Customer) => {
    setIsDeleting(true);
    try {
      await CRMService.deleteCustomer(cust.id);
      setCustomers((prev) => prev.filter((c) => c.id !== cust.id));
      setSelectedCustomerIds((prev) => {
        const next = new Set(prev);
        next.delete(cust.id);
        return next;
      });
      addToast("success", "Customer Deleted", `${cust.name} was removed from the database.`);
    } catch (err: any) {
      addToast("error", "Deletion Failed", err.message || "Failed to delete customer");
    } finally {
      setIsDeleting(false);
      setCustomerToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomerIds.size === 0) return;
    setIsDeleting(true);
    try {
      const idsToDelete = Array.from(selectedCustomerIds);
      await CRMService.bulkDeleteCustomers(idsToDelete);
      setCustomers((prev) => prev.filter((c) => !selectedCustomerIds.has(c.id)));
      addToast("success", "Customers Deleted", `Successfully deleted ${idsToDelete.length} customer(s).`);
      setSelectedCustomerIds(new Set());
    } catch (err: any) {
      addToast("error", "Bulk Deletion Failed", err.message || "Failed to delete selected customers");
    } finally {
      setIsDeleting(false);
      setIsBulkDeleteModalOpen(false);
    }
  };

  // Formula Cards State
  const [formulaRecords, setFormulaRecords] = useState<any[]>([]);

  // New Formula Form State
  const [selectedCustForFormula, setSelectedCustForFormula] = useState(customers[0]?.name || "");
  const [formulaServiceType, setFormulaServiceType] = useState("Balayage & Hair Color");
  const [formulaRoots, setFormulaRoots] = useState("");
  const [formulaEnds, setFormulaEnds] = useState("");
  const [formulaProcessingTime, setFormulaProcessingTime] = useState(30);
  const [formulaPatchTest, setFormulaPatchTest] = useState("Passed");
  const [formulaNotes, setFormulaNotes] = useState("");

  // Gift Vouchers State
  const [giftVouchers, setGiftVouchers] = useState<any[]>([]);

  // New Voucher Form State
  const [voucherTitle, setVoucherTitle] = useState("");
  const [voucherAmount, setVoucherAmount] = useState(0);
  const [voucherRecipient, setVoucherRecipient] = useState("");
  const [voucherPhone, setVoucherPhone] = useState("");
  const [voucherExpiry, setVoucherExpiry] = useState(new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0]);

  const handleCreateFormula = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = {
      id: `fc_${Date.now()}`,
      customer_name: selectedCustForFormula,
      service_type: formulaServiceType,
      date: new Date().toISOString().split("T")[0],
      formula_details: {
        roots: formulaRoots,
        lengths_and_ends: formulaEnds,
      },
      processing_time_mins: Number(formulaProcessingTime),
      patch_test_date: new Date().toISOString().split("T")[0],
      patch_test_result: formulaPatchTest,
      technique_notes: formulaNotes,
      stylist_name: "Lead Colorist",
    };
    setFormulaRecords([newRecord, ...formulaRecords]);
    addToast("success", "Formula Card Saved", `Color recipe logged for ${selectedCustForFormula}.`);
    setIsFormulaModalOpen(false);
  };

  const handleIssueVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `GV-${Math.floor(100000 + Math.random() * 900000)}`;
    const newVoucher = {
      id: `gv_${Date.now()}`,
      code,
      title: voucherTitle,
      initial_amount: Number(voucherAmount),
      remaining_balance: Number(voucherAmount),
      recipient_name: voucherRecipient || "Guest",
      recipient_phone: voucherPhone,
      expiry_date: voucherExpiry,
      status: "active",
    };
    setGiftVouchers([newVoucher, ...giftVouchers]);
    addToast("success", "Gift Voucher Issued", `Generated voucher code ${code} for ₹${voucherAmount}.`);
    setIsVoucherModalOpen(false);
    setVoucherRecipient("");
    setVoucherPhone("");
  };


  const filteredCustomers = customers.filter((c) => {
    if (genderFilter !== "all" && c.gender?.toLowerCase() !== genderFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      addToast("warning", "Missing Details", "Please enter customer Name and Phone Number.");
      return;
    }

    addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, "")}@example.com`,
      gender: gender as any,
      avatar: "",
      membershipTier: membershipTier === "none" ? "Rose Silver" : (membershipTier as any),
      notes: notes.trim(),
    });
    addToast("success", "Customer Created!", `${name} (${phone}) registered successfully.`);

    // Reset
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setIsCreateModalOpen(false);
  };

  const handleDownloadCustomerSample = () => {
    downloadCsvFile("Sample_Salon_Customers_Directory.csv", SAMPLE_CUSTOMERS_CSV);
    addToast("success", "Sample CSV Downloaded", "Customer directory sample template saved with columns & dummy data.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
              CRM & Guest Intelligence
            </span>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              Invoay & Boulevard Workflows
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Customer Relationship & Styling Studio
          </h1>
          <p className="text-xs text-slate-500">
            Guest directory, color formula cards, before/after records, and gift voucher vault.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeTab === "directory" && (
            <>
              <button
                onClick={handleDownloadCustomerSample}
                title="Download formatted sample CSV template with demo customer rows"
                className="px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all hover:scale-[1.01]"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sample CSV</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-[1.01]"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Create Customer</span>
              </button>
            </>
          )}

          {activeTab === "formulas" && (
            <button
              onClick={() => setIsFormulaModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
            >
              <Sparkles className="w-4 h-4" />
              <span>+ Record Color Formula</span>
            </button>
          )}

          {activeTab === "vouchers" && (
            <button
              onClick={() => setIsVoucherModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Issue Gift Voucher</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("directory")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "directory"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Guests & VIP Directory ({filteredCustomers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("formulas")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "formulas"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Formula Cards & Color Recipes ({formulaRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("vouchers")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "vouchers"
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-emerald-300" />
          <span>Gift Vouchers & Prepaid Vault ({giftVouchers.length})</span>
        </button>
      </div>

      {/* TAB 1: GUESTS DIRECTORY */}
      {activeTab === "directory" && (
        <>
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, phone number, email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
              {["all", "female", "male", "other"].map((g) => (
                <button
                  key={g}
                  onClick={() => setGenderFilter(g)}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    genderFilter === g
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {g === "all" ? "All Genders" : g}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Actions Banner */}
          {selectedCustomerIds.size > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {selectedCustomerIds.size}
                </span>
                <div>
                  <p className="text-xs font-bold text-rose-950">
                    {selectedCustomerIds.size} customer{selectedCustomerIds.size > 1 ? "s" : ""} selected
                  </p>
                  <p className="text-[11px] text-rose-700">
                    You can delete all selected records in bulk or clear the selection.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomerIds(new Set())}
                  className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 bg-white hover:bg-rose-50 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Clear Selection
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  disabled={isDeleting}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer shadow-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedCustomerIds.size})</span>
                </button>
              </div>
            </div>
          )}

          {/* Customers Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        aria-label="Select all customers"
                        checked={
                          filteredCustomers.length > 0 &&
                          selectedCustomerIds.size === filteredCustomers.length
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600"
                      />
                    </th>
                    <th className="py-3 px-4">Customer Name & Contact</th>
                    <th className="py-3 px-4">Gender</th>
                    <th className="py-3 px-4">VIP Membership</th>
                    <th className="py-3 px-4">Total Visits</th>
                    <th className="py-3 px-4">Total Spend</th>
                    <th className="py-3 px-4">Wallet Balance</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((c) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        selectedCustomerIds.has(c.id) ? "bg-rose-50/30" : ""
                      }`}
                    >
                      <td className="py-3.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Select ${c.name}`}
                          checked={selectedCustomerIds.has(c.id)}
                          onChange={() => toggleSelectCustomer(c.id)}
                          className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {c.avatar ? (
                            <img
                              src={c.avatar}
                              alt={c.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                              {c.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900">{c.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                              <span>{c.phone}</span>
                              <span>&bull;</span>
                              <span>{c.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            c.gender?.toLowerCase() === "female"
                              ? "bg-rose-100 text-rose-800"
                              : c.gender?.toLowerCase() === "male"
                              ? "bg-sky-100 text-sky-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {c.gender || "Female"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {c.membershipTier ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                            <Crown className="w-3 h-3 text-amber-600" />
                            {c.membershipTier}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Standard Guest</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {c.totalVisits || 1} visits
                      </td>

                      <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                        ₹{(c.totalSpend || 4500).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-bold font-mono text-emerald-700">
                        ₹{(c.walletBalance || 1000).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentCustomer(c);
                            setActiveModule("pos");
                            setActiveSubTab("newsale");
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] cursor-pointer inline-flex items-center gap-1 shadow-xs"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>New Bill</span>
                        </button>
                        <a
                          href={`tel:${c.phone}`}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer inline-flex items-center"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          title="Delete Customer"
                          onClick={() => setCustomerToDelete(c)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 cursor-pointer inline-flex items-center transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: FORMULA CARDS & COLOR RECIPES */}
      {activeTab === "formulas" && (
        <div className="space-y-4">
          {formulaRecords.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
                🧪
              </div>
              <h3 className="font-bold text-slate-900 text-sm">No Color Formula Cards Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click &quot;New Formula Card&quot; to log custom hair color recipes, processing timers, and patch test records.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formulaRecords.map((formula) => (
                <div
                  key={formula.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        {formula.service_type}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 mt-1">
                        {formula.customer_name}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Logged on {formula.date} by {formula.stylist_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          formula.patch_test_result === "Passed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        Patch Test: {formula.patch_test_result}
                      </span>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">
                        {formula.processing_time_mins} mins timer
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/60 font-mono">
                    <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-1">
                      Formula Breakdown & Mixing Ratios
                    </div>
                    {Object.entries(formula.formula_details).map(([key, val]) => (
                      <div key={key} className="flex items-start justify-between text-slate-800">
                        <span className="capitalize font-semibold text-slate-600">{key.replace(/_/g, " ")}:</span>
                        <span className="text-right font-medium text-slate-900">{String(val)}</span>
                      </div>
                    ))}
                  </div>

                  {formula.technique_notes && (
                    <p className="text-xs text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-200/50 italic">
                      &ldquo;{formula.technique_notes}&rdquo;
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => {
                        addToast("info", "Formula Loaded", `Loaded color formula for ${formula.customer_name}.`);
                        setActiveModule("pos");
                        setActiveSubTab("newsale");
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Apply to Next Service</span>
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono">ID: {formula.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GIFT VOUCHERS */}
      {activeTab === "vouchers" && (
        <div className="space-y-4">
          {giftVouchers.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                🎁
              </div>
              <h3 className="font-bold text-slate-900 text-sm">No Gift Cards or Vouchers Issued Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click &quot;Issue Gift Voucher&quot; to generate prepaid gift cards and promotional balance passes for clients.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {giftVouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {voucher.status}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-1">
                      {voucher.title}
                    </h3>
                  </div>
                  <div className="font-mono font-bold text-lg text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    ₹{voucher.remaining_balance.toLocaleString()}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Voucher Code:</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md tracking-wider">
                      {voucher.code}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Recipient:</span>
                    <span className="font-semibold text-slate-800">
                      {voucher.recipient_name} {voucher.recipient_phone && `(${voucher.recipient_phone})`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Expiry Date:</span>
                    <span className="font-mono text-slate-700">{voucher.expiry_date}</span>
                  </div>
                </div>

                {/* Balance Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                    <span>Remaining Balance</span>
                    <span>{Math.round((voucher.remaining_balance / voucher.initial_amount) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(voucher.remaining_balance / voucher.initial_amount) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      addToast("success", "Voucher Code Copied", `Voucher code ${voucher.code} copied for checkout.`);
                      navigator.clipboard?.writeText(voucher.code);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
                  >
                    Copy Code
                  </button>
                  <button
                    onClick={() => {
                      setActiveModule("pos");
                      setActiveSubTab("newsale");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer shadow-xs"
                  >
                    Redeem at POS
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* Customer Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Create New Customer</h3>
                  <p className="text-[11px] text-slate-400">Add guest profile with phone and gender</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Deepika Padukone"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other / Unisex</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assign Membership Tier</label>
                  <select
                    value={membershipTier}
                    onChange={(e) => setMembershipTier(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  >
                    <option value="none">Standard (No Tier)</option>
                    <option value="silver">Silver Prestige</option>
                    <option value="gold">Gold Royalty Club</option>
                    <option value="platinum">Diamond VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Preferences / Styling Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Prefers organic hair dyes, coffee with almond milk..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer shadow-sm"
                >
                  Save Customer Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formula Card Creator Modal (Boulevard / Invoay) */}
      {isFormulaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Record Color Formula Recipe</h3>
                  <p className="text-[11px] text-slate-400">Attach mixing ratios, developer vol, and patch tests</p>
                </div>
              </div>
              <button
                onClick={() => setIsFormulaModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFormula} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Select Guest *</label>
                  <select
                    value={selectedCustForFormula}
                    onChange={(e) => setSelectedCustForFormula(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Service Type *</label>
                  <select
                    value={formulaServiceType}
                    onChange={(e) => setFormulaServiceType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="Balayage & Hair Color">Balayage & Hair Color</option>
                    <option value="Global Highlights & Toner">Global Highlights & Toner</option>
                    <option value="Keratin Smoothing Complex">Keratin Smoothing Complex</option>
                    <option value="HydraFacial Glow Peel">HydraFacial Glow Peel</option>
                    <option value="Scalp Detox Therapy">Scalp Detox Therapy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Roots Formula (Dye + Developer + Ratio) *</label>
                <input
                  type="text"
                  required
                  value={formulaRoots}
                  onChange={(e) => setFormulaRoots(e.target.value)}
                  placeholder="e.g. Matrix 5.0 (30g) + 20 Vol (45g)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mid-Lengths & Ends Formula</label>
                <input
                  type="text"
                  value={formulaEnds}
                  onChange={(e) => setFormulaEnds(e.target.value)}
                  placeholder="e.g. Matrix 7.32 (40g) + 10 Vol (60g)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Processing Time (Minutes)</label>
                  <input
                    type="number"
                    value={formulaProcessingTime}
                    onChange={(e) => setFormulaProcessingTime(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Skin Patch Test Status</label>
                  <select
                    value={formulaPatchTest}
                    onChange={(e) => setFormulaPatchTest(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="Passed">Passed (No Reaction)</option>
                    <option value="Pending">Pending / First Time</option>
                    <option value="Sensitive">Mild Sensitivity Observed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Stylist Technique Notes</label>
                <textarea
                  rows={2}
                  value={formulaNotes}
                  onChange={(e) => setFormulaNotes(e.target.value)}
                  placeholder="e.g. Feathered root smudge, leave ends for last 10 minutes..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormulaModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer shadow-sm"
                >
                  Save Formula Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gift Voucher Issuer Modal (Invoay / Vagaro) */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Issue Gift Voucher / Pass</h3>
                  <p className="text-[11px] text-slate-400">Generate redeemable prepaid credits</p>
                </div>
              </div>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueVoucher} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Voucher Title *</label>
                <input
                  type="text"
                  required
                  value={voucherTitle}
                  onChange={(e) => setVoucherTitle(e.target.value)}
                  placeholder="e.g. Festive Beauty Glow Pass"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Denomination Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={voucherAmount}
                    onChange={(e) => setVoucherAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={voucherExpiry}
                    onChange={(e) => setVoucherExpiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={voucherRecipient}
                    onChange={(e) => setVoucherRecipient(e.target.value)}
                    placeholder="e.g. Aisha Khan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Recipient Phone</label>
                  <input
                    type="tel"
                    value={voucherPhone}
                    onChange={(e) => setVoucherPhone(e.target.value)}
                    placeholder="+91 98000 11223"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-sm"
                >
                  Issue Gift Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV / Excel Data Importer Modal */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        dataType="customers"
      />

      {/* Delete Single Customer Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Customer</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-slate-800">{customerToDelete.name}</span>? This will remove their record from your salon database.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSingleCustomer(customerToDelete)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? "Deleting..." : "Yes, Delete Customer"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Customers Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Bulk Delete Customers</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete{" "}
                <span className="font-bold text-rose-600">{selectedCustomerIds.size}</span> selected customer(s)? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? "Deleting..." : `Delete ${selectedCustomerIds.size} Customers`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
