"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import { formatCurrency } from "@/lib/utils";
import { Lead, Customer } from "@/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Users,
  Kanban,
  Crown,
  Package,
  Wallet,
  Coins,
  PlusCircle,
  Phone,
  Mail,
  Star,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export function CRMModule() {
  const {
    customers,
    leads,
    memberships,
    selectedBranch,
    activeSubTab,
    addLead,
    updateLeadStage,
  } = useSalon();

  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSource, setLeadSource] = useState<Lead["source"]>("Instagram Ad");
  const [leadService, setLeadService] = useState("Parisian Sunlit French Balayage");
  const [leadValue, setLeadValue] = useState<number>(8000);

  // Selected customer for 360 view drawer
  const [selectedCust360, setSelectedCust360] = useState<Customer | null>(customers[0] || null);

  const pipelineStages: Lead["stage"][] = [
    "New",
    "Contacted",
    "Consultation Booked",
    "Converted",
    "Lost",
  ];

  const handleCreateLead = () => {
    if (!leadName || !leadPhone) return;
    addLead({
      name: leadName,
      phone: leadPhone,
      email: leadEmail || "lead@client.com",
      source: leadSource,
      stage: "New",
      interestedService: leadService,
      estimatedValue: leadValue,
      assignedStaff: "Front Desk Concierge",
    });
    setIsNewLeadModalOpen(false);
    setLeadName("");
    setLeadPhone("");
  };

  return (
    <div className="space-y-6">
      {/* Subtab 1: Customer 360 Database */}
      {(activeSubTab === "customers" || activeSubTab === "overview") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Customer List */}
          <Card className="p-5 lg:col-span-1 border-stone-200 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Customer Registry ({customers.length})</span>
              </h3>
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {customers.map((c) => {
                const isSelected = selectedCust360?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCust360(c)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? "bg-amber-50/40 border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
                        : "bg-white border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-stone-900 truncate">{c.name}</div>
                      <div className="text-[11px] text-stone-500">{c.phone}</div>
                      <Badge variant={c.membership?.active ? "gold" : "slate"} size="sm" className="mt-1">
                        {c.segment}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Customer 360 Full Profile Dossier */}
          {selectedCust360 && (
            <Card variant="luxury" className="p-6 lg:col-span-2 border-stone-200/80 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedCust360.avatar}
                    alt={selectedCust360.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-stone-900">
                        {selectedCust360.name}
                      </h3>
                      <Badge variant="gold" size="sm">
                        {selectedCust360.segment}
                      </Badge>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {selectedCust360.phone} • {selectedCust360.email} • Client since {selectedCust360.joinedDate}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-stone-400 block">Lifetime Spend</span>
                  <span className="text-xl font-bold text-stone-900">
                    {formatCurrency(selectedCust360.totalSpent, selectedBranch.currency)}
                  </span>
                  <span className="text-[11px] text-stone-500 block">({selectedCust360.visitsCount} visits)</span>
                </div>
              </div>

              {/* Financial & Balances Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-stone-200">
                  <span className="text-[10px] uppercase font-mono text-emerald-700 font-semibold block">
                    Wallet Balance
                  </span>
                  <div className="text-lg font-bold text-stone-900 mt-0.5">
                    {formatCurrency(selectedCust360.walletBalance, selectedBranch.currency)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-stone-200">
                  <span className="text-[10px] uppercase font-mono text-purple-700 font-semibold block">
                    Loyalty Points
                  </span>
                  <div className="text-lg font-bold text-stone-900 mt-0.5">
                    {selectedCust360.loyaltyPoints} pts
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-stone-200">
                  <span className="text-[10px] uppercase font-mono text-amber-700 font-semibold block">
                    VIP Membership
                  </span>
                  <div className="text-sm font-bold text-stone-900 mt-0.5 truncate">
                    {selectedCust360.membership?.tierName || "Non-Member"}
                  </div>
                </div>
              </div>

              {/* Beauty & Consultation Notes */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                  Artisan Service & Preference Notes
                </h4>
                <p className="text-stone-700 leading-relaxed">{selectedCust360.notes}</p>
                <div className="grid grid-cols-2 gap-2 text-stone-600 pt-2 border-t border-stone-200/80">
                  <div>
                    <span className="text-stone-400">Preferred Drink:</span> {selectedCust360.beautyProfile.preferredBeverage}
                  </div>
                  <div>
                    <span className="text-stone-400">Hair Type:</span> {selectedCust360.beautyProfile.hairType}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Subtab 2: Leads & Deals Pipeline Kanban */}
      {(activeSubTab === "pipeline" || activeSubTab === "opportunities") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-stone-900">
                Haute Beauty Inquiries & Deals Pipeline
              </h3>
              <p className="text-xs text-stone-500">
                Track client inquiries from Instagram, Google, referrals into booked consultations.
              </p>
            </div>
            <Button variant="gold" size="sm" onClick={() => setIsNewLeadModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>Capture Lead</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {pipelineStages.map((stage) => {
              const stageLeads = leads.filter((l) => l.stage === stage);
              const stageValue = stageLeads.reduce((sum, l) => sum + l.estimatedValue, 0);

              return (
                <div key={stage} className="p-3.5 rounded-2xl bg-stone-100/80 border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-900">{stage}</span>
                    <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 rounded-full border">
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-500 font-mono">
                    Val: {formatCurrency(stageValue, selectedBranch.currency)}
                  </div>

                  <div className="space-y-2">
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1.5 text-xs"
                      >
                        <div className="font-semibold text-stone-900">{lead.name}</div>
                        <div className="text-[10px] text-stone-500">{lead.interestedService}</div>
                        <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-stone-600">
                          <span className="text-amber-800 font-bold">
                            {formatCurrency(lead.estimatedValue, selectedBranch.currency)}
                          </span>
                          <span className="text-stone-400">{lead.source}</span>
                        </div>

                        {/* Stage Mover */}
                        <div className="pt-2 flex justify-between border-t border-stone-100">
                          <select
                            value={lead.stage}
                            onChange={(e) => updateLeadStage(lead.id, e.target.value as Lead["stage"])}
                            className="text-[10px] p-1 rounded bg-stone-50 border border-stone-200"
                          >
                            {pipelineStages.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab 3: VIP Memberships */}
      {activeSubTab === "memberships" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-stone-900">
                VIP Membership Tiers & Privileges
              </h3>
              <p className="text-xs text-stone-500">
                Global membership tiers recognized at all Atelier salon locations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {memberships.map((mem) => (
              <Card key={mem.id} variant="luxury" className="p-5 space-y-4 border-amber-900/20">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-stone-900">{mem.name}</h4>
                  <Crown className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-stone-900">
                  {formatCurrency(mem.price, selectedBranch.currency)}
                  <span className="text-xs font-normal text-stone-500 font-sans"> / {mem.validityDays} days</span>
                </div>

                <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-200">
                  {mem.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* New Lead Modal */}
      <Modal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        title="Capture Client Inquiry"
        subtitle="Add prospective VIP client to the pipeline"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Lead Full Name</label>
            <input
              type="text"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              placeholder="e.g. Kiara Advani"
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Phone Number</label>
            <input
              type="text"
              value={leadPhone}
              onChange={(e) => setLeadPhone(e.target.value)}
              placeholder="+91 98000 00000"
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Lead Source</label>
            <select
              value={leadSource}
              onChange={(e) => setLeadSource(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            >
              <option value="Instagram Ad">Instagram Ad</option>
              <option value="Google Search">Google Search</option>
              <option value="Walk-in Inquiry">Walk-in Inquiry</option>
              <option value="Referral">Referral</option>
              <option value="Influencer Campaign">Influencer Campaign</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Interested Service</label>
            <input
              type="text"
              value={leadService}
              onChange={(e) => setLeadService(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Estimated Value</label>
            <input
              type="number"
              value={leadValue}
              onChange={(e) => setLeadValue(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <Button variant="gold" className="w-full" onClick={handleCreateLead}>
            Save Lead to Pipeline
          </Button>
        </div>
      </Modal>
    </div>
  );
}
