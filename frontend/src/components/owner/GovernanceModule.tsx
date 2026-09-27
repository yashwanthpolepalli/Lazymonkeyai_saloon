"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  FileText,
  Sliders,
  Users,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  History,
  Lock,
  Layers,
  Award,
  Wallet,
  Check,
  RefreshCw,
} from "lucide-react";
import { ApprovalRequest, ServiceAllocation, BusinessType } from "@/types";

export const GovernanceModule: React.FC = () => {
  const {
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
    addToast,
  } = useSalon();

  const [activeTab, setActiveTab] = useState<"approvals" | "audit" | "allocations" | "policy">("approvals");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showNewAllocationModal, setShowNewAllocationModal] = useState(false);

  // New Request Form State
  const [reqTitle, setReqTitle] = useState("");
  const [reqType, setReqType] = useState("service_eligibility");
  const [reqBeneficiary, setReqBeneficiary] = useState("");
  const [reqDept, setReqDept] = useState(policyConfig.departments?.[0] || "Executive Grooming");
  const [reqAmount, setReqAmount] = useState<number>(0);
  const [reqDesc, setReqDesc] = useState("");

  // New Allocation Form State
  const [allocBeneficiary, setAllocBeneficiary] = useState("");
  const [allocDept, setAllocDept] = useState(policyConfig.departments?.[0] || "Executive Grooming");
  const [allocCostCenter, setAllocCostCenter] = useState("CC-101");
  const [allocServiceName, setAllocServiceName] = useState("Executive Grooming & Spa Session");
  const [allocQuota, setAllocQuota] = useState<number>(2);

  const filteredApprovals = approvals.filter((appr) => {
    const matchesStatus = statusFilter === "all" || appr.status === statusFilter;
    const matchesSearch =
      appr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (appr.beneficiary_name && appr.beneficiary_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      appr.requested_by.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    return (
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim()) return;
    await addApprovalRequest({
      title: reqTitle,
      request_type: reqType,
      beneficiary_name: reqBeneficiary || undefined,
      department: reqDept,
      amount: Number(reqAmount) || 0,
      description: reqDesc,
    });
    setShowNewRequestModal(false);
    setReqTitle("");
    setReqBeneficiary("");
    setReqDesc("");
    setReqAmount(0);
  };

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocBeneficiary.trim()) return;
    await addServiceAllocation({
      beneficiary_name: allocBeneficiary,
      department: allocDept,
      cost_center: allocCostCenter,
      service_name: allocServiceName,
      quota_monthly: Number(allocQuota) || 2,
    });
    setShowNewAllocationModal(false);
    setAllocBeneficiary("");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 md:p-8 border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {currentOrganization.business_type.replace("_", " ").toUpperCase()} MODEL
              </span>
              <span className="text-xs text-slate-400">Organization: <strong className="text-white">{currentOrganization.name}</strong></span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Enterprise Governance & Policy Engine
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl">
              Configurable approval workflows, institutional service allocations, and compliance audit trail dynamically adapted for {currentOrganization.name}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold text-xs transition shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Approval Request
            </button>
            {policyConfig.internal_entitlement_mode && (
              <button
                onClick={() => setShowNewAllocationModal(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                Assign Quota
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-700/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab("approvals")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "approvals"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Clock className="w-4 h-4" />
            Approvals Queue
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300">
              {approvals.filter((a) => a.status === "pending").length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "audit"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <History className="w-4 h-4" />
            Audit Trail & Logs
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-700 text-slate-300">
              {auditLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("allocations")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "allocations"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Award className="w-4 h-4" />
            Beneficiary Entitlements
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-700 text-slate-300">
              {serviceAllocations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("policy")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "policy"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Sliders className="w-4 h-4" />
            Policy Engine Rules
          </button>
        </div>
      </div>

      {/* TAB 1: APPROVALS QUEUE */}
      {activeTab === "approvals" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {["all", "pending", "approved", "rejected"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                    statusFilter === st
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search requests, beneficiaries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {filteredApprovals.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Approvals Pending</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All authorization and eligibility workflows are up to date. You can click "New Approval Request" to submit a requirement.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApprovals.map((appr) => (
                <div
                  key={appr.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 transition shadow-sm space-y-4 relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        appr.status === "pending"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : appr.status === "approved"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-rose-100 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {appr.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {appr.created_at ? new Date(appr.created_at).toLocaleDateString() : "Recent"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{appr.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{appr.description || "No description provided."}</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Type:</span>
                      <span className="font-medium text-slate-800">{appr.request_type.replace("_", " ").toUpperCase()}</span>
                    </div>
                    {appr.beneficiary_name && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Beneficiary:</span>
                        <span className="font-semibold text-slate-900">{appr.beneficiary_name}</span>
                      </div>
                    )}
                    {appr.department && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Department:</span>
                        <span>{appr.department}</span>
                      </div>
                    )}
                    {appr.amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Estimated Cost:</span>
                        <span className="font-bold text-slate-900">₹{appr.amount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Requested By:</span>
                      <span>{appr.requested_by}</span>
                    </div>
                  </div>

                  {appr.status === "pending" && (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => decideApproval(appr.id, "approved", "Approved by Manager")}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => decideApproval(appr.id, "rejected", "Declined per policy")}
                        className="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}

                  {appr.approver_name && (
                    <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
                      <span>Decided by: <strong>{appr.approver_name}</strong></span>
                      {appr.approver_notes && <span className="italic text-slate-500">"{appr.approver_notes}"</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AUDIT TRAIL */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Compliance & Operations Audit Trail</h3>
              <p className="text-xs text-slate-500">Tamper-evident system activity log for regulatory governance.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit actions, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[10px] border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Details / Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : "Just now"}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {log.user_name} <span className="text-[10px] text-slate-400">({log.user_role})</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-semibold text-indigo-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-500">{log.module}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                        {JSON.stringify(log.details || {})}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BENEFICIARY ALLOCATIONS */}
      {activeTab === "allocations" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Institutional Service Entitlements</h3>
              <p className="text-xs text-slate-500">Departmental quota balances and direct welfare service issue register.</p>
            </div>
            <button
              onClick={() => setShowNewAllocationModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Assign New Quota
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceAllocations.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <Award className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Active Entitlements</h4>
                <p className="text-xs text-slate-500">Click "Assign New Quota" to allocate service credits to department beneficiaries.</p>
              </div>
            ) : (
              serviceAllocations.map((alloc) => {
                const remaining = Math.max(0, alloc.quota_monthly - alloc.quota_used);
                return (
                  <div key={alloc.id} className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold">
                        {alloc.cost_center || "COST-CENTER"}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{alloc.department}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{alloc.beneficiary_name}</h4>
                      <p className="text-xs text-slate-500">{alloc.service_name}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-100">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-500">Monthly Usage:</span>
                        <span className="text-slate-900 font-bold">
                          {alloc.quota_used} / {alloc.quota_monthly} Sessions
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            remaining === 0 ? "bg-rose-500" : "bg-indigo-600"
                          }`}
                          style={{
                            width: `${Math.min(100, (alloc.quota_used / alloc.quota_monthly) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => consumeAllocation(alloc.id)}
                      disabled={remaining === 0}
                      className={`w-full py-2 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        remaining > 0
                          ? "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {remaining > 0 ? `Redeem Session (${remaining} Left)` : "Quota Exhausted"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: POLICY ENGINE RULES */}
      {activeTab === "policy" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Operating Model & Dynamic Policy Configuration</h3>
              <p className="text-xs text-slate-500">
                Toggle feature flags and operational rules in real-time. No code redeployment needed.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              Active Mode: {currentOrganization.business_type.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Multi-Branch Mode</span>
                <input
                  type="checkbox"
                  checked={policyConfig.multi_branch_enabled}
                  onChange={(e) => updatePolicyConfig({ multi_branch_enabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500">Enables branch switcher, central consolidated HQ dashboard, and regional tax support.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Manager Approval Workflows</span>
                <input
                  type="checkbox"
                  checked={policyConfig.approval_required}
                  onChange={(e) => updatePolicyConfig({ approval_required: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500">Requires supervisor sign-off on purchase orders, discount overrides, and eligibility requests.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Central Warehouse & Transfers</span>
                <input
                  type="checkbox"
                  checked={policyConfig.central_warehouse_enabled}
                  onChange={(e) => updatePolicyConfig({ central_warehouse_enabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500">Enables master inventory warehouse with inter-branch stock transfer slips and GRN tracking.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Institutional Entitlement Mode</span>
                <input
                  type="checkbox"
                  checked={policyConfig.internal_entitlement_mode}
                  onChange={(e) => updatePolicyConfig({ internal_entitlement_mode: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500">Replaces commercial cash checkout with cost-center and employee welfare quota deductions.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Tiered Staff Commissions</span>
                <input
                  type="checkbox"
                  checked={policyConfig.commission_enabled}
                  onChange={(e) => updatePolicyConfig({ commission_enabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500">Computes stylist service commissions dynamically during checkout and payslip generation.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Regulatory Audit Logging</span>
                <input
                  type="checkbox"
                  checked={policyConfig.audit_enabled}
                  onChange={(e) => updatePolicyConfig({ audit_enabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500">Records full chronological transaction histories and managerial changes for external compliance.</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Approval Request */}
      {showNewRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Submit Approval Authorization Request
              </h3>
              <button
                onClick={() => setShowNewRequestModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Request Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Wellness Session Authorization"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Workflow Type</label>
                  <select
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    <option value="service_eligibility">Service Eligibility</option>
                    <option value="purchase_order">Purchase Order</option>
                    <option value="expense_claim">Expense Claim</option>
                    <option value="price_override">Price Override</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={reqDept}
                    onChange={(e) => setReqDept(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    {policyConfig.departments?.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Beneficiary Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Officer John Doe"
                    value={reqBeneficiary}
                    onChange={(e) => setReqBeneficiary(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount / Cost (₹)</label>
                  <input
                    type="number"
                    value={reqAmount}
                    onChange={(e) => setReqAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description & Justification</label>
                <textarea
                  rows={3}
                  placeholder="State the operational reason or eligibility clause..."
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewRequestModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer shadow-md"
                >
                  Queue Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Service Allocation */}
      {showNewAllocationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                Assign Beneficiary Service Quota
              </h3>
              <button
                onClick={() => setShowNewAllocationModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAllocation} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Beneficiary Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspector R. Sharma"
                  value={allocBeneficiary}
                  onChange={(e) => setAllocBeneficiary(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={allocDept}
                    onChange={(e) => setAllocDept(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    {policyConfig.departments?.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cost Center Code</label>
                  <input
                    type="text"
                    value={allocCostCenter}
                    onChange={(e) => setAllocCostCenter(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Entitlement Service</label>
                  <input
                    type="text"
                    value={allocServiceName}
                    onChange={(e) => setAllocServiceName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Monthly Quota Sessions</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={allocQuota}
                    onChange={(e) => setAllocQuota(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewAllocationModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer shadow-md"
                >
                  Assign Entitlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
