"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Calendar as CalendarIcon,
  Clock,
  Scissors,
  CheckCircle2,
  ListOrdered,
  PlusCircle,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

export function OperationsModule() {
  const {
    selectedBranch,
    branchAppointments,
    categories,
    filteredServices,
    filteredStylists,
    activeSubTab,
    updateAppointmentStatus,
  } = useSalon();

  const [viewMode, setViewMode] = useState<"chairs" | "timeline">("chairs");
  const [selectedStylistFilter, setSelectedStylistFilter] = useState<string>("all");

  const filteredAppointments = branchAppointments.filter((a) => {
    if (selectedStylistFilter === "all") return true;
    return a.stylistId === selectedStylistFilter;
  });

  return (
    <div className="space-y-6">
      {/* Subtab: Interactive Calendar & Queue */}
      {(activeSubTab === "calendar" || activeSubTab === "bookings" || activeSubTab === "overview") && (
        <div className="space-y-4">
          {/* Calendar Toolbar */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-800">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-stone-900">
                  Salon Floor Scheduling Grid
                </h3>
                <p className="text-xs text-stone-500">{selectedBranch.name} • {selectedBranch.openingHours}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Stylist Filter */}
              <select
                value={selectedStylistFilter}
                onChange={(e) => setSelectedStylistFilter(e.target.value)}
                className="text-xs p-2 rounded-xl border border-stone-300 bg-white"
              >
                <option value="all">All Artisans</option>
                {filteredStylists.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.tier})
                  </option>
                ))}
              </select>

              {/* View toggle */}
              <div className="flex p-1 bg-stone-100 rounded-xl">
                <button
                  onClick={() => setViewMode("chairs")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                    viewMode === "chairs" ? "bg-white text-stone-900 shadow-xs font-semibold" : "text-stone-600"
                  }`}
                >
                  By Station Chairs
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                    viewMode === "timeline" ? "bg-white text-stone-900 shadow-xs font-semibold" : "text-stone-600"
                  }`}
                >
                  Timeline Queue
                </button>
              </div>
            </div>
          </div>

          {/* View 1: By Chairs Grid */}
          {viewMode === "chairs" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: selectedBranch.chairsCount }).map((_, idx) => {
                const chairNum = idx + 1;
                const chairAppointments = filteredAppointments.filter(
                  (a) => a.chairNumber === chairNum
                );

                return (
                  <Card key={chairNum} className="p-4 border-stone-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="font-mono text-xs font-bold text-stone-900">
                        Station Chair #{chairNum}
                      </span>
                      <Badge
                        variant={chairAppointments.some((a) => a.status === "in_service") ? "gold" : "outline"}
                        size="sm"
                      >
                        {chairAppointments.some((a) => a.status === "in_service") ? "Active" : "Open"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {chairAppointments.length > 0 ? (
                        chairAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-stone-900">{apt.customerName}</span>
                              <Badge
                                variant={
                                  apt.status === "completed"
                                    ? "success"
                                    : apt.status === "in_service"
                                    ? "gold"
                                    : "warning"
                                }
                                size="sm"
                              >
                                {apt.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-stone-600 truncate">{apt.serviceName}</p>
                            <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono pt-1 border-t border-stone-200/60">
                              <span>{apt.timeSlot} ({apt.durationMinutes}m)</span>
                              <span>{apt.stylistName}</span>
                            </div>

                            <div className="flex gap-1 pt-1">
                              {apt.status === "confirmed" && (
                                <Button
                                  size="sm"
                                  variant="gold"
                                  className="w-full text-[10px] h-6 py-0"
                                  onClick={() => updateAppointmentStatus(apt.id, "in_service")}
                                >
                                  Seat Client
                                </Button>
                              )}
                              {apt.status === "in_service" && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  className="w-full text-[10px] h-6 py-0"
                                  onClick={() => updateAppointmentStatus(apt.id, "completed")}
                                >
                                  Done
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-stone-400 text-center py-4">No bookings scheduled</p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* View 2: Timeline Queue */
            <Card className="p-6 space-y-4">
              <div className="space-y-3">
                {filteredAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-stone-100 font-mono font-bold text-stone-900 text-xs text-center shrink-0">
                        {apt.timeSlot}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-stone-900">
                            {apt.customerName}
                          </h4>
                          <span className="font-mono text-[10px] text-stone-400">({apt.customerPhone})</span>
                        </div>
                        <p className="text-stone-600 mt-0.5">
                          {apt.serviceName} • Chair #{apt.chairNumber || 1} • Artisan: <strong>{apt.stylistName}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900">
                        {formatCurrency(apt.finalTotal, selectedBranch.currency)}
                      </span>
                      <Badge
                        variant={
                          apt.status === "completed"
                            ? "success"
                            : apt.status === "in_service"
                            ? "gold"
                            : "warning"
                        }
                        size="sm"
                      >
                        {apt.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Subtab: Service Catalog & Inventory Mapping */}
      {activeSubTab === "catalog" && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <CardTitle>Service Catalog & Inventory Consumption Formula</CardTitle>
              <p className="text-xs text-stone-500 mt-0.5">
                Every service automatically computes required skills and product consumption per execution.
              </p>
            </div>
            <Badge variant="gold" size="sm">
              {filteredServices.length} Active Services
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                className="p-4 rounded-xl border border-stone-200 bg-white space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900">{srv.name}</h4>
                    <span className="text-[10px] text-stone-500">{srv.categoryName} • {srv.durationMinutes} mins</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-stone-900">
                    {formatCurrency(srv.basePrice, selectedBranch.currency)}
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">{srv.shortDesc}</p>

                {/* Consumed Products Mapping */}
                {srv.consumedProducts && srv.consumedProducts.length > 0 && (
                  <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-mono text-amber-800 font-semibold block">
                      Auto-Deducted Stock Per Session
                    </span>
                    {srv.consumedProducts.map((p) => (
                      <div key={p.productId} className="flex justify-between text-stone-600 text-[11px]">
                        <span>{p.productName}</span>
                        <span className="font-mono font-bold">{p.quantity} {p.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
