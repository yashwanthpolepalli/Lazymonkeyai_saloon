"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  Building2,
  Server,
  Cpu,
  CreditCard,
  ToggleRight,
  Activity,
  Globe,
  Database,
  Lock,
} from "lucide-react";

export function SuperAdminPortal() {
  const { branches, employees, customers, services } = useSalon();

  const [activeTab, setActiveTab] = useState<"organizations" | "health" | "billing" | "features">("organizations");

  const organizations = [
    {
      id: "org_01",
      name: "LazyMonkey Luxury Beauty Group",
      tier: "Enterprise Unlimited",
      chains: 4,
      totalSalons: 18,
      status: "Active",
      mrr: "₹1,450,000 / mo",
    },
    {
      id: "org_02",
      name: "Maison De Beauté Paris-London",
      tier: "Enterprise Global",
      chains: 2,
      totalSalons: 8,
      status: "Active",
      mrr: "£18,500 / mo",
    },
    {
      id: "org_03",
      name: "Beverly Hills Haute Aesthetics LLC",
      tier: "Elite Studio",
      chains: 1,
      totalSalons: 3,
      status: "Active",
      mrr: "$12,000 / mo",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Super Admin Top Header */}
      <div className="p-6 rounded-2xl bg-neutral-950 text-stone-100 border border-neutral-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-600 to-yellow-600 text-stone-950 font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-stone-100">
                LazyMonkey AI Platform Cloud Orchestrator
              </h1>
              <Badge variant="gold" size="sm">
                Super Admin Root
              </Badge>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Multi-Tenant Architecture • Global Node Clusters • AI Gateway
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" size="md">
            All 4 Regions Operational
          </Badge>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex p-1 bg-stone-100 rounded-xl gap-1">
        {[
          { id: "organizations", label: "Tenant Organizations & Chains", icon: <Building2 className="w-3.5 h-3.5" /> },
          { id: "health", label: "Cloud Health & AI Telemetry", icon: <Activity className="w-3.5 h-3.5" /> },
          { id: "billing", label: "SaaS Subscriptions & MRR", icon: <CreditCard className="w-3.5 h-3.5" /> },
          { id: "features", label: "Feature Flags & LLM Gateway", icon: <Cpu className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Organizations */}
      {activeTab === "organizations" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <CardTitle>Enterprise Tenants & Chains Registry</CardTitle>
            <Button variant="gold" size="sm">
              Provision New Tenant
            </Button>
          </div>

          <div className="space-y-3">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="p-4 rounded-xl border border-stone-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-stone-900">{org.name}</h4>
                    <Badge variant="gold" size="sm">
                      {org.tier}
                    </Badge>
                  </div>
                  <p className="text-stone-500 mt-0.5">
                    Chains: {org.chains} • Total Branches: {org.totalSalons}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 uppercase block font-mono">Plan MRR</span>
                    <span className="font-mono font-bold text-stone-900 text-sm">{org.mrr}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage Tenant
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 2: Health & AI Telemetry */}
      {activeTab === "health" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 space-y-2 border-stone-200">
            <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
              <span>Cloud API Latency</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-stone-900">24ms</div>
            <span className="text-[11px] text-emerald-700">99.99% Uptime (Global Edge)</span>
          </Card>

          <Card className="p-5 space-y-2 border-stone-200">
            <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
              <span>AI Styling Tokens / Sec</span>
              <Cpu className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-stone-900">1,420 t/s</div>
            <span className="text-[11px] text-stone-500">Neural Pricing Engine v4.2</span>
          </Card>

          <Card className="p-5 space-y-2 border-stone-200">
            <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
              <span>Active POS Connections</span>
              <Server className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-stone-900">284 Terminals</div>
            <span className="text-[11px] text-stone-500">Zero packet drops</span>
          </Card>
        </div>
      )}
    </div>
  );
}
