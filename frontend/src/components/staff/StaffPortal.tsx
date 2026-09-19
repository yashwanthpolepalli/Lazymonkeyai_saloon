"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import { formatCurrency } from "@/lib/utils";
import { Appointment } from "@/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import {
  Scissors,
  Calendar,
  Clock,
  User,
  Star,
  DollarSign,
  Camera,
  CheckCircle2,
  Layers,
  Sparkles,
  Award,
} from "lucide-react";

export function StaffPortal() {
  const {
    currentStaff,
    selectedBranch,
    branchAppointments,
    updateAppointmentStatus,
    updateAppointmentDetails,
    addToast,
  } = useSalon();

  // Active appointment for the 7-Step Service Flow Drawer
  const [activeAptFlow, setActiveAptFlow] = useState<Appointment | null>(null);
  const [serviceStep, setServiceStep] = useState<number>(1);
  const [consultationNotes, setConsultationNotes] = useState("");
  const [productsLogged, setProductsLogged] = useState("Kérastase Bain Satin (30ml), Olaplex No.1 (15ml)");

  const staffAppointments = branchAppointments.filter(
    (a) => a.stylistId === currentStaff.id || a.stylistName.toLowerCase().includes(currentStaff.name.toLowerCase().split(" ")[0])
  );

  const handleOpenServiceDrawer = (apt: Appointment) => {
    setActiveAptFlow(apt);
    setConsultationNotes(apt.serviceNotes || "Client requested glossy layers and dimensional warmth.");
    if (apt.status === "confirmed") setServiceStep(1);
    else if (apt.status === "in_service") setServiceStep(3);
    else if (apt.status === "completed") setServiceStep(7);
  };

  const handleProgressFlow = (nextStep: number) => {
    if (!activeAptFlow) return;

    if (nextStep === 3) {
      updateAppointmentStatus(activeAptFlow.id, "in_service");
      updateAppointmentDetails(activeAptFlow.id, { serviceNotes: consultationNotes });
    }

    if (nextStep === 7) {
      updateAppointmentStatus(activeAptFlow.id, "completed");
      addToast("success", "Service Completed", `Commission logged for ${currentStaff.name}.`);
    }

    setServiceStep(nextStep);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Staff Header */}
      <div className="p-6 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentStaff.avatar}
            alt={currentStaff.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-100">{currentStaff.name}</h1>
              <Badge variant="gold" size="sm">
                {currentStaff.tier} Artisan
              </Badge>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              {currentStaff.department} • {selectedBranch.name} • Commission: {currentStaff.commissionRate}%
            </p>
          </div>
        </div>

        {/* Quick Earnings */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-right">
            <span className="text-[10px] uppercase font-mono text-emerald-400 block">This Month Commission</span>
            <div className="text-lg font-bold text-emerald-400">
              {formatCurrency(currentStaff.monthlyCommission, selectedBranch.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* My Day Appointments Queue */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <CardTitle>My Day Appointments & Workflow Launcher</CardTitle>
          </div>
          <Badge variant="gold" size="sm">
            {staffAppointments.length} Clients Today
          </Badge>
        </div>

        <div className="space-y-3">
          {staffAppointments.map((apt) => (
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
                  <p className="text-stone-600 mt-0.5">
                    {apt.serviceName} • Chair #{apt.chairNumber || 1}
                  </p>
                  <span className="text-[10px] text-stone-400 font-mono">Ref: {apt.bookingRef}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => handleOpenServiceDrawer(apt)}
                >
                  <Scissors className="w-3.5 h-3.5 mr-1.5" />
                  <span>
                    {apt.status === "confirmed"
                      ? "Start 7-Step Service Flow"
                      : apt.status === "in_service"
                      ? "Resume Flow in Progress"
                      : "View Service Record"}
                  </span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 7-Step Appointment Execution Drawer */}
      <Drawer
        isOpen={!!activeAptFlow}
        onClose={() => setActiveAptFlow(null)}
        title={
          activeAptFlow
            ? `Client Service Flow: ${activeAptFlow.customerName}`
            : "Artisan Service Execution"
        }
        subtitle={activeAptFlow ? `${activeAptFlow.serviceName} • Step ${serviceStep} of 7` : ""}
        width="lg"
      >
        {activeAptFlow && (
          <div className="space-y-6">
            {/* Step Indicators */}
            <div className="grid grid-cols-7 gap-1">
              {[
                "1. Check-In",
                "2. Consult",
                "3. Start",
                "4. Products",
                "5. Before",
                "6. After",
                "7. Done",
              ].map((label, idx) => {
                const stepNum = idx + 1;
                const isCurrent = serviceStep === stepNum;
                const isPassed = serviceStep > stepNum;
                return (
                  <div
                    key={label}
                    className={`text-center py-1 rounded text-[10px] font-mono font-semibold ${
                      isCurrent
                        ? "bg-amber-600 text-white"
                        : isPassed
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {stepNum}
                  </div>
                );
              })}
            </div>

            {/* Step Content */}
            {serviceStep === 1 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-stone-900">
                  Step 1: Seat Client & Verify Booking
                </h4>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                  <div><strong>Client:</strong> {activeAptFlow.customerName} ({activeAptFlow.customerPhone})</div>
                  <div><strong>Service:</strong> {activeAptFlow.serviceName}</div>
                  <div><strong>Station Chair:</strong> Chair #{activeAptFlow.chairNumber || 3}</div>
                </div>
                <Button variant="gold" className="w-full" onClick={() => handleProgressFlow(2)}>
                  Proceed to Consultation Dossier →
                </Button>
              </div>
            )}

            {serviceStep === 2 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-stone-900">
                  Step 2: Consultation & Formula Notes
                </h4>
                <textarea
                  rows={4}
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  placeholder="Record hair texture, desired tone, or skin sensitivity notes..."
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-white"
                />
                <Button variant="gold" className="w-full" onClick={() => handleProgressFlow(3)}>
                  Save Notes & Start Ritual (Seat in Chair) →
                </Button>
              </div>
            )}

            {serviceStep === 3 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-stone-900">
                  Step 3: Service In Progress (Timer Running)
                </h4>
                <div className="p-6 rounded-2xl bg-stone-900 text-stone-100 text-center space-y-2">
                  <div className="font-mono text-3xl font-bold text-amber-400">45:00</div>
                  <span className="text-xs text-stone-400">Elapsed Service Duration</span>
                </div>
                <Button variant="gold" className="w-full" onClick={() => handleProgressFlow(4)}>
                  Log Product Formulas Used →
                </Button>
              </div>
            )}

            {serviceStep === 4 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-stone-900">
                  Step 4: Auto-Deduct Inventory Products Used
                </h4>
                <input
                  type="text"
                  value={productsLogged}
                  onChange={(e) => setProductsLogged(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
                />
                <p className="text-[11px] text-stone-500">
                  Stocks will be automatically deducted from {selectedBranch.name} dispensary upon completion.
                </p>
                <Button variant="gold" className="w-full" onClick={() => handleProgressFlow(5)}>
                  Upload Before/After Photos →
                </Button>
              </div>
            )}

            {serviceStep === 5 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-stone-900">
                  Step 5: Before Transformation Photo
                </h4>
                <div className="p-8 border-2 border-dashed border-stone-300 rounded-2xl text-center space-y-2 bg-stone-50">
                  <Camera className="w-8 h-8 text-stone-400 mx-auto" />
                  <span className="text-xs text-stone-600 block">Photo successfully attached to client dossier</span>
                </div>
                <Button variant="gold" className="w-full" onClick={() => handleProgressFlow(6)}>
                  Finalize Thermal Finishing & After Photo →
                </Button>
              </div>
            )}

            {serviceStep === 6 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-stone-900">
                  Step 6: After Transformation Photo & Client Feedback
                </h4>
                <div className="p-8 border-2 border-dashed border-amber-300 rounded-2xl text-center space-y-2 bg-amber-50/20">
                  <Camera className="w-8 h-8 text-amber-600 mx-auto" />
                  <span className="text-xs text-amber-900 font-semibold block">Haute Couture Result Captured</span>
                </div>
                <Button variant="gold" className="w-full" onClick={() => handleProgressFlow(7)}>
                  Complete Service & Send to POS Cashier →
                </Button>
              </div>
            )}

            {serviceStep === 7 && (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-stone-900">
                  Ritual Successfully Completed
                </h4>
                <p className="text-xs text-stone-500">
                  Your commission has been added to your HRMS monthly earnings tally.
                </p>
                <Button variant="primary" onClick={() => setActiveAptFlow(null)}>
                  Close Service Drawer
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
