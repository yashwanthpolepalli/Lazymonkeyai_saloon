"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  TrendingUp,
  Users,
  Armchair,
  DollarSign,
  Clock,
  Sparkles,
  UserPlus,
  PlusCircle,
  MapPin,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export function WorkspaceModule() {
  const {
    selectedBranch,
    branchAppointments,
    customers,
    employees,
    activeSubTab,
    setActiveModule,
    setActiveSubTab,
    addAppointment,
    updateAppointmentStatus,
    filteredServices,
    filteredStylists,
  } = useSalon();

  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInClientName, setWalkInClientName] = useState("");
  const [walkInClientPhone, setWalkInClientPhone] = useState("");
  const [walkInServiceId, setWalkInServiceId] = useState(filteredServices[0]?.id || "");
  const [walkInStylistId, setWalkInStylistId] = useState(filteredStylists[0]?.id || "");
  const [walkInChair, setWalkInChair] = useState<number>(4);

  // Computed live metrics for the active branch
  const todayRevenue = branchAppointments
    .filter((a) => a.paymentStatus === "paid" || a.status === "completed")
    .reduce((sum, a) => sum + a.finalTotal, 0);

  const activeInService = branchAppointments.filter((a) => a.status === "in_service").length;
  const occupiedChairs = Math.min(activeInService, selectedBranch.chairsCount);
  const totalBookingsToday = branchAppointments.length;

  const handleCreateWalkIn = () => {
    const srv = filteredServices.find((s) => s.id === walkInServiceId) || filteredServices[0];
    const sty = filteredStylists.find((s) => s.id === walkInStylistId) || filteredStylists[0];
    if (!srv || !sty || !walkInClientName) return;

    addAppointment({
      customerId: "cst_walkin",
      customerName: walkInClientName,
      customerPhone: walkInClientPhone || "+91 98000 00000",
      customerEmail: "walkin@guest.com",
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      serviceId: srv.id,
      serviceName: srv.name,
      categoryName: srv.categoryName,
      stylistId: sty.id,
      stylistName: sty.name,
      stylistTier: sty.tier,
      date: new Date().toISOString().split("T")[0],
      timeSlot: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      durationMinutes: srv.durationMinutes,
      selectedOptions: [],
      selectedAddOns: [],
      status: "in_service",
      chairNumber: walkInChair,
      basePrice: srv.basePrice,
      optionsPrice: 0,
      addOnsPrice: 0,
      stylistTierMarkup: Math.round(srv.basePrice * (sty.tierMultiplier - 1)),
      subtotal: srv.basePrice * sty.tierMultiplier,
      membershipDiscount: 0,
      packageCreditUsed: false,
      walletUsed: 0,
      loyaltyDiscount: 0,
      couponDiscount: 0,
      taxAmount: Math.round(srv.basePrice * sty.tierMultiplier * selectedBranch.taxRate),
      finalTotal: Math.round(srv.basePrice * sty.tierMultiplier * (1 + selectedBranch.taxRate)),
      paymentStatus: "unpaid",
    });

    setIsWalkInModalOpen(false);
    setWalkInClientName("");
    setWalkInClientPhone("");
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-neutral-900 text-stone-100 border border-stone-800 shadow-lg">
        <div>
          <span className="text-[10px] text-amber-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>Active Command Center: {selectedBranch.name}</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold text-stone-100 mt-1">
            Salon Floor & Real-Time Performance
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="gold"
            size="sm"
            onClick={() => setIsWalkInModalOpen(true)}
            className="cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Fast Walk-in Check-in</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveModule("pos");
              setActiveSubTab("newsale");
            }}
            className="text-stone-200 border-stone-700 hover:bg-stone-800 cursor-pointer"
          >
            <span>Open POS Terminal</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(todayRevenue, selectedBranch.currency)}
          change="18.4%"
          isPositive={true}
          icon={DollarSign}
          subtext="vs. yesterday at same hour"
          variant="gold"
        />
        <StatCard
          title="Active Salon Chairs"
          value={`${occupiedChairs} / ${selectedBranch.chairsCount}`}
          change="84% Occupancy"
          isPositive={true}
          icon={Armchair}
          subtext="Peak velocity right now"
        />
        <StatCard
          title="Appointments Today"
          value={totalBookingsToday}
          change="+4 vs avg"
          isPositive={true}
          icon={Calendar}
          subtext="1 in service • 1 confirmed"
        />
        <StatCard
          title="Active Stylists on Floor"
          value={`${employees.length} Artisans`}
          change="100% On-time"
          isPositive={true}
          icon={Users}
          subtext="0 unscheduled absences"
        />
      </div>

      {/* Main Floor Visualizer & Active Appointments Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Salon Chairs Visualizer Floor Plan */}
        <Card className="p-5 lg:col-span-1 border-stone-200/80">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
            <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <Armchair className="w-4 h-4 text-amber-600" />
              <span>Live Salon Chairs Map</span>
            </h3>
            <Badge variant="gold" size="sm">
              {selectedBranch.chairsCount} Stations
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
            {Array.from({ length: selectedBranch.chairsCount }).map((_, idx) => {
              const chairNum = idx + 1;
              const matchingApt = branchAppointments.find(
                (a) => a.chairNumber === chairNum && a.status === "in_service"
              );
              const isOccupied = !!matchingApt;

              return (
                <div
                  key={chairNum}
                  className={`p-3 rounded-xl border transition-all text-xs ${
                    isOccupied
                      ? "bg-amber-50/50 border-amber-400/80 shadow-xs"
                      : "bg-stone-50 border-stone-200 text-stone-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[11px] text-stone-700">Chair #{chairNum}</span>
                    <Badge variant={isOccupied ? "gold" : "outline"} size="sm">
                      {isOccupied ? "In Service" : "Available"}
                    </Badge>
                  </div>

                  {matchingApt ? (
                    <div className="mt-2 text-stone-800">
                      <div className="font-semibold truncate">{matchingApt.customerName}</div>
                      <div className="text-[11px] text-stone-500 truncate">{matchingApt.serviceName}</div>
                      <div className="text-[10px] text-amber-700 font-mono mt-1">
                        Artisan: {matchingApt.stylistName}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] text-stone-400">Ready for walk-in</div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Real-time Schedule & Operations Queue */}
        <Card className="p-5 lg:col-span-2 border-stone-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Today&apos;s Live Appointments Queue</span>
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveModule("operations");
                setActiveSubTab("calendar");
              }}
            >
              Full Calendar →
            </Button>
          </div>

          <div className="space-y-3">
            {branchAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                    #{apt.chairNumber || 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-stone-900">
                        {apt.customerName}
                      </h4>
                      <Badge
                        variant={
                          apt.status === "in_service"
                            ? "gold"
                            : apt.status === "completed"
                            ? "success"
                            : "warning"
                        }
                        size="sm"
                      >
                        {apt.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {apt.serviceName} • Stylist: <strong>{apt.stylistName}</strong>
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-stone-400 font-mono mt-1">
                      <span>{apt.timeSlot} ({apt.durationMinutes} mins)</span>
                      <span>•</span>
                      <span>Ref: {apt.bookingRef}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  {apt.status === "confirmed" && (
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => updateAppointmentStatus(apt.id, "in_service")}
                    >
                      Start Service
                    </Button>
                  )}
                  {apt.status === "in_service" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateAppointmentStatus(apt.id, "completed")}
                    >
                      Complete Service
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveModule("pos");
                      setActiveSubTab("newsale");
                    }}
                  >
                    POS Bill
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Fast Walk-in Modal */}
      <Modal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        title="Express Walk-in Check-in"
        subtitle="Instantly seat a walk-in guest and start service"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Guest Name</label>
            <input
              type="text"
              value={walkInClientName}
              onChange={(e) => setWalkInClientName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Phone Number</label>
            <input
              type="text"
              value={walkInClientPhone}
              onChange={(e) => setWalkInClientPhone(e.target.value)}
              placeholder="+91 98000 00000"
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Service Ritual</label>
            <select
              value={walkInServiceId}
              onChange={(e) => setWalkInServiceId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            >
              {filteredServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatCurrency(s.basePrice, selectedBranch.currency)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Available Stylist</label>
            <select
              value={walkInStylistId}
              onChange={(e) => setWalkInStylistId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            >
              {filteredStylists.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.tier})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Assign Chair Station</label>
            <input
              type="number"
              min={1}
              max={selectedBranch.chairsCount}
              value={walkInChair}
              onChange={(e) => setWalkInChair(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <Button variant="gold" className="w-full" onClick={handleCreateWalkIn}>
            Seat Client & Begin Service
          </Button>
        </div>
      </Modal>
    </div>
  );
}
