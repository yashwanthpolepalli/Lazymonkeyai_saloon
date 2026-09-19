"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import {
  Sparkles,
  Calendar,
  Crown,
  Package,
  Wallet,
  Coins,
  Receipt,
  Star,
  LifeBuoy,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Upload,
} from "lucide-react";

export function CustomerPortal() {
  const {
    currentCustomer,
    selectedBranch,
    appointments,
    invoices,
    tickets,
    createTicket,
    addToast,
  } = useSalon();

  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Wallet top-up modal state
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(5000);

  // New ticket modal
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState<
    "Service Quality" | "Billing / Refund" | "Booking Reschedule" | "Stylist Feedback" | "Product Allergy"
  >("Booking Reschedule");
  const [ticketMessage, setTicketMessage] = useState("");

  const customerAppointments = appointments.filter(
    (a) => a.customerId === currentCustomer.id || a.customerPhone === currentCustomer.phone
  );

  const tabs = [
    { id: "dashboard", label: "Dashboard & Overview", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "appointments", label: "Appointments", count: customerAppointments.length, icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: "membership", label: "VIP Membership", icon: <Crown className="w-3.5 h-3.5" /> },
    { id: "packages", label: "Package Passes", count: currentCustomer.packages.length, icon: <Package className="w-3.5 h-3.5" /> },
    { id: "wallet_loyalty", label: "Wallet & Loyalty", icon: <Wallet className="w-3.5 h-3.5" /> },
    { id: "beauty_profile", label: "Beauty Profile & AI", icon: <Star className="w-3.5 h-3.5" /> },
    { id: "invoices", label: "Invoices & Receipts", icon: <Receipt className="w-3.5 h-3.5" /> },
    { id: "support", label: "Concierge & Support", icon: <LifeBuoy className="w-3.5 h-3.5" /> },
  ];

  const handleCreateTicket = () => {
    if (!ticketSubject || !ticketMessage) return;
    createTicket({
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone,
      branchId: selectedBranch.id,
      subject: ticketSubject,
      category: ticketCategory,
      priority: "medium",
      status: "open",
      slaMinutesRemaining: 60,
      assignedTo: "Concierge Desk",
      messages: [
        {
          sender: currentCustomer.name,
          role: "customer",
          text: ticketMessage,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    });
    setIsTicketModalOpen(false);
    setTicketSubject("");
    setTicketMessage("");
    addToast("success", "Ticket Submitted", "Our concierge will respond within 30 minutes.");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Customer Header Bar */}
      <div className="p-6 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentCustomer.avatar}
            alt={currentCustomer.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-stone-100">
                {currentCustomer.name}
              </h1>
              {currentCustomer.membership?.active && (
                <Badge variant="gold" size="sm">
                  {currentCustomer.membership.tierName}
                </Badge>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-1">
              {currentCustomer.phone} • {currentCustomer.email} • Client since {currentCustomer.joinedDate}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {currentCustomer.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Balance Cards */}
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-left min-w-[120px]">
            <div className="text-[10px] uppercase font-mono text-emerald-400 flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              <span>Wallet Cash</span>
            </div>
            <div className="text-lg font-bold text-stone-100 mt-0.5">
              {formatCurrency(currentCustomer.walletBalance, selectedBranch.currency)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-left min-w-[120px]">
            <div className="text-[10px] uppercase font-mono text-purple-400 flex items-center gap-1">
              <Coins className="w-3 h-3" />
              <span>Loyalty Points</span>
            </div>
            <div className="text-lg font-bold text-stone-100 mt-0.5">
              {currentCustomer.loyaltyPoints} pts
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Dashboard */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Upcoming Appointment */}
            <Card variant="luxury" className="p-5 md:col-span-2">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Next Appointment</span>
                </h3>
                {customerAppointments[0] && (
                  <Badge variant="gold" size="sm">
                    {customerAppointments[0].status.replace("_", " ")}
                  </Badge>
                )}
              </div>

              {customerAppointments[0] ? (
                <div className="pt-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-stone-900">
                        {customerAppointments[0].serviceName}
                      </h4>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        {customerAppointments[0].branchName} • Chair #{customerAppointments[0].chairNumber || 3}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-amber-700">
                        {customerAppointments[0].date}
                      </div>
                      <div className="text-xs text-stone-500">{customerAppointments[0].timeSlot}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-stone-500">Reserved Stylist:</span>
                      <strong className="text-stone-900 ml-1.5">{customerAppointments[0].stylistName}</strong>
                    </div>
                    <span className="font-mono text-[11px] text-amber-800 font-semibold">
                      Ref: {customerAppointments[0].bookingRef}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-500 py-6 text-center">No upcoming appointments.</p>
              )}
            </Card>

            {/* AI Skin & Beauty Score */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-amber-700 font-semibold">
                    AI Skin Health Index
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-stone-900">
                    {currentCustomer.beautyProfile.aiSkinScore || 92}
                  </span>
                  <span className="text-xs text-stone-400">/ 100</span>
                </div>
                <p className="text-xs text-stone-600 mt-2">
                  Skin Hydration is optimal. Recommended next ritual: <strong>Hydra-Glow Infusion</strong> in 14 days.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => setActiveTab("beauty_profile")}
              >
                View Full Beauty Profile
              </Button>
            </Card>
          </div>

          {/* Membership & Package Quick Glance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* VIP Card */}
            {currentCustomer.membership && (
              <Card className="p-5 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 text-stone-100 border-amber-500/40">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-amber-300 uppercase tracking-widest font-mono">
                      VIP Privilège Member
                    </span>
                    <h4 className="text-lg font-bold text-stone-100 mt-1">
                      {currentCustomer.membership.tierName}
                    </h4>
                  </div>
                  <Crown className="w-6 h-6 text-amber-400" />
                </div>

                <div className="my-4 pt-3 border-t border-stone-800 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-400 text-[10px]">Valid Until</span>
                    <div className="font-semibold text-stone-200">{currentCustomer.membership.expiresAt}</div>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px]">Total Saved</span>
                    <div className="font-semibold text-amber-300">
                      {formatCurrency(currentCustomer.membership.totalSaved, selectedBranch.currency)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-amber-200/90 pt-2 border-t border-stone-800/80">
                  <span>{currentCustomer.membership.remainingBlowouts} Free Blowouts Remaining</span>
                  <button
                    onClick={() => setActiveTab("membership")}
                    className="underline hover:text-white cursor-pointer"
                  >
                    View Benefits →
                  </button>
                </div>
              </Card>
            )}

            {/* Packages Passes */}
            <Card className="p-5 border-stone-200">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest font-mono">
                    Service Credit Passes
                  </span>
                  <h4 className="text-base font-semibold text-stone-900 mt-1">
                    {currentCustomer.packages[0]?.name || "No Active Package"}
                  </h4>
                </div>
                <Package className="w-6 h-6 text-amber-600" />
              </div>

              {currentCustomer.packages[0] && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Credits Remaining:</span>
                    <span className="font-bold text-stone-900 font-mono">
                      {currentCustomer.packages[0].remainingCredits} of {currentCustomer.packages[0].totalCredits}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className="h-full bg-amber-600"
                      style={{
                        width: `${(currentCustomer.packages[0].remainingCredits / currentCustomer.packages[0].totalCredits) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Appointments */}
      {activeTab === "appointments" && (
        <Card className="p-6 space-y-4">
          <CardHeader className="px-0 pt-0">
            <CardTitle>My Appointment History & Schedule</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {customerAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-stone-900">
                      {apt.serviceName}
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
                  <p className="text-xs text-stone-500 mt-1">
                    Stylist: <strong>{apt.stylistName}</strong> • {apt.branchName}
                  </p>
                  <div className="text-[11px] text-stone-400 font-mono mt-1">Ref: {apt.bookingRef}</div>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-1">
                  <div className="text-right">
                    <span className="text-sm font-bold text-stone-900">
                      {apt.date} at {apt.timeSlot}
                    </span>
                    <span className="text-xs text-stone-500 block font-mono">
                      {formatCurrency(apt.finalTotal, selectedBranch.currency)} ({apt.paymentStatus})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 3: Membership Full */}
      {activeTab === "membership" && currentCustomer.membership && (
        <Card variant="luxury" className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <span className="text-xs font-mono uppercase text-amber-700 font-semibold">
                Membership Privileges
              </span>
              <h3 className="text-xl font-bold text-stone-900">
                {currentCustomer.membership.tierName}
              </h3>
            </div>
            <Badge variant="gold" size="md">
              Active Member
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-xs text-stone-500">Service Discount</span>
              <div className="text-2xl font-bold text-stone-900 mt-1">25% OFF</div>
              <p className="text-[11px] text-stone-500 mt-1">Worldwide at all Atelier branches</p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-xs text-stone-500">Remaining Blowouts</span>
              <div className="text-2xl font-bold text-amber-700 mt-1">
                {currentCustomer.membership.remainingBlowouts} Passes
              </div>
              <p className="text-[11px] text-stone-500 mt-1">Complimentary luxury finishing</p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-xs text-stone-500">Cumulative Savings</span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                {formatCurrency(currentCustomer.membership.totalSaved, selectedBranch.currency)}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">Direct member bill credits</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 4: Wallet & Loyalty */}
      {activeTab === "wallet_loyalty" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wallet Cash */}
          <Card className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-emerald-700 font-semibold">
                  Atelier Prepaid Wallet
                </span>
                <h3 className="text-2xl font-bold text-stone-900 mt-1">
                  {formatCurrency(currentCustomer.walletBalance, selectedBranch.currency)}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-stone-500">
              Wallet cash never expires and can be seamlessly applied to online reservations and POS salon checkout.
            </p>
            <Button
              variant="gold"
              className="w-full"
              onClick={() => setIsTopUpModalOpen(true)}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              <span>Top Up Wallet (+10% Bonus Credit)</span>
            </Button>
          </Card>

          {/* Loyalty Points */}
          <Card className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-purple-700 font-semibold">
                  Crown Loyalty Points
                </span>
                <h3 className="text-2xl font-bold text-stone-900 mt-1">
                  {currentCustomer.loyaltyPoints} Points
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                <Coins className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-stone-500">
              Earn 1 point per 20 currency units spent. Redeem at any time during checkout for direct bill discounts.
            </p>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
              <span className="text-stone-500">Redemption Value: </span>
              <strong className="text-stone-900 font-mono">
                {formatCurrency((currentCustomer.loyaltyPoints / 100) * 50, selectedBranch.currency)}
              </strong>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 5: Beauty Profile */}
      {activeTab === "beauty_profile" && (
        <Card className="p-6 space-y-6">
          <CardHeader className="px-0 pt-0">
            <div>
              <CardTitle>Bespoke Beauty & AI Consultation Dossier</CardTitle>
              <p className="text-xs text-stone-500 mt-0.5">
                Our master artisans consult this profile before every ritual to formulate custom hair toners and skincare protocols.
              </p>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-stone-400 uppercase font-mono text-[10px]">Hair Texture & Type</span>
              <div className="font-semibold text-stone-900 text-sm mt-0.5">
                {currentCustomer.beautyProfile.hairType}
              </div>
              <p className="text-stone-500 mt-1">{currentCustomer.beautyProfile.hairTexture}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-stone-400 uppercase font-mono text-[10px]">Skin Condition</span>
              <div className="font-semibold text-stone-900 text-sm mt-0.5">
                {currentCustomer.beautyProfile.skinType}
              </div>
              <p className="text-stone-500 mt-1">{currentCustomer.beautyProfile.scalpCondition}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-stone-400 uppercase font-mono text-[10px]">Complimentary Beverage</span>
              <div className="font-semibold text-stone-900 text-sm mt-0.5">
                {currentCustomer.beautyProfile.preferredBeverage}
              </div>
              <p className="text-stone-500 mt-1">Music: {currentCustomer.beautyProfile.preferredMusic}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 6: Support & Concierge */}
      {activeTab === "support" && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <CardTitle>Private Concierge & Support Desk</CardTitle>
              <p className="text-xs text-stone-500 mt-0.5">
                Reach your dedicated atelier concierge for rescheduling, private suite bookings, or feedback.
              </p>
            </div>
            <Button variant="gold" size="sm" onClick={() => setIsTicketModalOpen(true)}>
              Raise Support Request
            </Button>
          </div>

          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-700">{t.ticketNumber}</span>
                    <Badge variant={t.status === "resolved" ? "success" : "warning"} size="sm">
                      {t.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-stone-400">{t.category}</span>
                </div>
                <h4 className="text-sm font-semibold text-stone-900">{t.subject}</h4>
                <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg">
                  {t.messages[t.messages.length - 1]?.text}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Up Modal */}
      <Modal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        title="Top Up Atelier Wallet"
        subtitle="Enjoy instant 10% bonus credit on all deposits"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[2000, 5000, 10000].map((amt) => (
              <button
                key={amt}
                onClick={() => setTopUpAmount(amt)}
                className={`p-3 rounded-xl border text-center font-mono font-bold text-xs ${
                  topUpAmount === amt ? "border-amber-600 bg-amber-50 text-amber-900" : "border-stone-200"
                }`}
              >
                {formatCurrency(amt, selectedBranch.currency)}
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex justify-between">
            <span>Bonus Credit (10%):</span>
            <strong className="font-mono">+{formatCurrency(topUpAmount * 0.1, selectedBranch.currency)}</strong>
          </div>

          <Button
            variant="gold"
            className="w-full"
            onClick={() => {
              setIsTopUpModalOpen(false);
              addToast("success", "Wallet Topped Up", `Added ${formatCurrency(topUpAmount * 1.1, selectedBranch.currency)} to your wallet.`);
            }}
          >
            Confirm & Pay {formatCurrency(topUpAmount, selectedBranch.currency)}
          </Button>
        </div>
      </Modal>

      {/* New Ticket Modal */}
      <Modal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        title="Contact Concierge"
        subtitle="Submit your inquiry or reschedule request"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Subject</label>
            <input
              type="text"
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              placeholder="e.g. Reschedule appointment to Sunday 2 PM"
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Category</label>
            <select
              value={ticketCategory}
              onChange={(e) => setTicketCategory(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            >
              <option value="Booking Reschedule">Booking Reschedule</option>
              <option value="Service Quality">Service Quality</option>
              <option value="Billing / Refund">Billing / Refund</option>
              <option value="Stylist Feedback">Stylist Feedback</option>
              <option value="Product Allergy">Product Allergy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Message</label>
            <textarea
              rows={4}
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              placeholder="Please provide details for the concierge team..."
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <Button variant="gold" className="w-full" onClick={handleCreateTicket}>
            Submit Ticket
          </Button>
        </div>
      </Modal>
    </div>
  );
}
