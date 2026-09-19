"use client";

import React from "react";
import { useSalon } from "@/context/SalonContext";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Building, Shield, FileCode, ToggleLeft } from "lucide-react";

export function SystemModule() {
  const { branches } = useSalon();

  const auditLogs = [
    { time: "Today 09:12 AM", user: "Isabella Moreau", action: "Completed Signature Sculptural Haircut for Ananya Deshmukh", ip: "192.168.1.42" },
    { time: "Today 08:58 AM", user: "Arjun Singhania", action: "Clocked in at Atelier Mumbai Flagship", ip: "192.168.1.18" },
    { time: "Yesterday 06:30 PM", user: "Rohan Kapoor", action: "Processed POS Invoice INV-BOM-8820 for ₹6,659.62", ip: "192.168.1.10" },
    { time: "Yesterday 04:15 PM", user: "Operations Manager", action: "Transferred 100 units Olaplex No.1 from Mumbai to Beverly Hills", ip: "10.0.0.5" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Multi-Branch Nodes */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Building className="w-5 h-5 text-amber-600" />
            <CardTitle>Global Atelier Salon Nodes</CardTitle>
          </div>

          <div className="space-y-3">
            {branches.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl border border-stone-200 bg-white flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-stone-900">{b.name}</div>
                  <div className="text-[11px] text-stone-500">{b.address}</div>
                </div>
                <Badge variant="gold" size="sm">
                  {b.chairsCount} Stations
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Security & Access Control */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Shield className="w-5 h-5 text-purple-600" />
            <CardTitle>Security Roles & Permissions Matrix</CardTitle>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 flex justify-between">
              <span className="font-semibold text-stone-900">Salon Owner / Partner</span>
              <span className="text-stone-500">Full Unrestricted Multi-Branch ERP Access</span>
            </div>
            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 flex justify-between">
              <span className="font-semibold text-stone-900">Front Desk / Cashier</span>
              <span className="text-stone-500">POS, Appointments Queue & Ticket Desk</span>
            </div>
            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 flex justify-between">
              <span className="font-semibold text-stone-900">Artisan Stylist</span>
              <span className="text-stone-500">Staff Portal, My Day, 7-Step Service Flow & Commission</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Audit Logs */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <FileCode className="w-5 h-5 text-amber-600" />
          <CardTitle>Tamper-Evident System Audit Trail</CardTitle>
        </div>

        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500 uppercase font-mono text-[10px]">
              <th className="py-2.5">Timestamp</th>
              <th className="py-2.5">User</th>
              <th className="py-2.5">Action Executed</th>
              <th className="py-2.5 text-right">Node IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-mono">
            {auditLogs.map((log, i) => (
              <tr key={i}>
                <td className="py-3 text-stone-500">{log.time}</td>
                <td className="py-3 font-sans font-semibold text-stone-900">{log.user}</td>
                <td className="py-3 font-sans text-stone-700">{log.action}</td>
                <td className="py-3 text-right text-stone-400">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
