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
} from "lucide-react";
import { Customer } from "@/types";
import { DataImportModal } from "@/components/common/DataImportModal";
import { downloadCsvFile, SAMPLE_CUSTOMERS_CSV } from "@/lib/csvHelper";

export function OwnerCustomersView() {
  const { customers, addCustomer, addToast, setActiveModule, setActiveSubTab, setCurrentCustomer } =
    useSalon();

  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // New Customer Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"female" | "male" | "other">("female");
  const [email, setEmail] = useState("");
  const [membershipTier, setMembershipTier] = useState<"silver" | "gold" | "platinum" | "none">("gold");
  const [notes, setNotes] = useState("");

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
      avatar: `https://images.unsplash.com/photo-${gender === "male"
          ? "1507003211169-0a1dd7228f2d"
          : "1534528741775-53994a69daeb"
        }?auto=format&fit=crop&w=200&q=80`,
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
              CRM & Guest Database
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Customer Management
          </h1>
          <p className="text-xs text-slate-500">
            Create guests with Name, Number, and Gender &bull; View loyalty points, VIP tiers, and spend.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sample CSV Download Button */}
          <button
            onClick={handleDownloadCustomerSample}
            title="Download formatted sample CSV template with demo customer rows"
            className="px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all hover:scale-[1.01]"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sample CSV</span>
          </button>

          {/* Import CSV / Excel Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-[1.01]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Import CSV / Excel</span>
          </button>

          {/* Create New Customer Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Create New Customer</span>
          </button>
        </div>
      </div>

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
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${genderFilter === g
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              {g === "all" ? "All Genders" : g}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">
            Registered Salon Guests ({filteredCustomers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
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
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
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
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${c.gender?.toLowerCase() === "female"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
              {/* Name */}
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

              {/* Phone & Gender Row */}
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

              {/* Email & Membership Tier */}
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

              {/* Notes */}
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

              {/* Buttons */}
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

      {/* CSV / Excel Data Importer Modal */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        dataType="customers"
      />
    </div>
  );
}
