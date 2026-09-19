"use client";

import React, { useState, useMemo } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  Scissors,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  DollarSign,
  Heart,
  User,
  Phone,
  Timer,
  Play,
  Pause,
  ArrowRight,
  Settings,
  Plus,
  Trash2,
  Lock,
  Unlock,
  AlertCircle,
  X,
  Edit3,
  CalendarRange,
  Sliders,
  RefreshCw,
  BookmarkPlus,
  PlayCircle,
  CheckSquare,
  Square,
  Zap,
} from "lucide-react";
import { AppointmentStatus, GenderType, TimeSlotConfig, CustomScheduleRule } from "@/types";
import { generateId } from "@/lib/utils";

export function StaffDashboardView() {
  const {
    currentStaff,
    selectedBranch,
    appointments,
    updateAppointmentStatus,
    rescheduleAppointment,
    timeSlots,
    toggleSlotAvailability,
    updateSlotConfig,
    addCustomSlot,
    deleteSlot,
    addToast,
    stylists,
    categories,
  } = useSalon();

  // Active in-chair timer state
  const [activeAptId, setActiveAptId] = useState<string | null>(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTargetApt, setRescheduleTargetApt] = useState<any>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [newRescheduleTime, setNewRescheduleTime] = useState("02:00 PM");
  const [newSlotTimeInput, setNewSlotTimeInput] = useState("");
  const [newSlotGender, setNewSlotGender] = useState<string>("all");
  const [filterTab, setFilterTab] = useState<"all" | "in_service" | "confirmed" | "completed">("all");

  // Dynamic Batch Range Rule Builder state
  const [batchFromTime, setBatchFromTime] = useState(timeSlots[0]?.time || "10:00 AM");
  const [batchToTime, setBatchToTime] = useState(timeSlots[4]?.time || "01:00 PM");
  const [batchAudience, setBatchAudience] = useState<GenderType | "all">("women");
  const [batchCategory, setBatchCategory] = useState<string>("all");
  const [batchAction, setBatchAction] = useState<"apply_rule" | "block_range" | "unblock_range">("apply_rule");
  const [batchReason, setBatchReason] = useState("");
  const [newRuleName, setNewRuleName] = useState("");

  // Configurable saved rules list
  const [savedRules, setSavedRules] = useState<CustomScheduleRule[]>([
    {
      id: "staff_rule_1",
      name: "Lunch & Personal Break",
      fromTime: "01:00 PM",
      toTime: "02:00 PM",
      audience: "all",
      category: "all",
      action: "block_range",
      customReason: "Staff Lunch Break",
    },
    {
      id: "staff_rule_2",
      name: "Morning Women Exclusive",
      fromTime: "10:00 AM",
      toTime: "01:00 PM",
      audience: "women",
      category: "all",
      action: "apply_rule",
      customReason: "Women Exclusive Hours",
    },
    {
      id: "staff_rule_3",
      name: "Evening Men's Grooming",
      fromTime: "05:00 PM",
      toTime: "08:00 PM",
      audience: "men",
      category: "all",
      action: "apply_rule",
      customReason: "Men's Grooming Hours",
    },
  ]);

  // Multi-slot selection state
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);

  const todayDateStr = new Date().toISOString().split("T")[0];

  const staffAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesBranch = apt.branchId === selectedBranch.id || apt.branchId === "all";
      const matchesStaff = apt.stylistId === currentStaff.id || !apt.stylistId || apt.stylistName === currentStaff.name;
      return matchesBranch && matchesStaff;
    });
  }, [appointments, selectedBranch.id, currentStaff]);

  const filteredList = useMemo(() => {
    if (filterTab === "all") return staffAppointments;
    return staffAppointments.filter((a) => a.status === filterTab);
  }, [staffAppointments, filterTab]);

  const currentInService = useMemo(() => {
    return (
      staffAppointments.find((a) => a.id === activeAptId) ||
      staffAppointments.find((a) => a.status === "in_service") ||
      staffAppointments[0]
    );
  }, [staffAppointments, activeAptId]);

  // Helper to parse 12-hour slot time into minutes from midnight
  const parseTimeToMinutes = (timeStr: string): number => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return 600;
    let hr = parseInt(match[1], 10);
    const min = parseInt(match[2], 10) || 0;
    const period = match[3]?.toUpperCase();
    if (period === "PM" && hr < 12) hr += 12;
    if (period === "AM" && hr === 12) hr = 0;
    return hr * 60 + min;
  };

  const totalServiceValue = staffAppointments.reduce((sum, a) => sum + a.finalTotal, 0);
  const commissionRate = currentStaff.commissionRate || 0.15;
  const estimatedCommission = Math.round(totalServiceValue * commissionRate);
  const estimatedTips = Math.round(totalServiceValue * 0.06);

  const handleStartService = (aptId: string) => {
    setActiveAptId(aptId);
    updateAppointmentStatus(aptId, "in_service");
    addToast("info", "Service Commenced", "Client is now in your chair. Timer started.");
  };

  const handleFinishService = (aptId: string) => {
    updateAppointmentStatus(aptId, "completed");
    if (activeAptId === aptId) setActiveAptId(null);
    addToast("success", "Service Completed", "Bill sent to cashier. Products inventory auto-deducted.");
  };

  const handleOpenReschedule = (apt: any) => {
    setRescheduleTargetApt(apt);
    setNewRescheduleDate(apt.date || todayDateStr);
    setNewRescheduleTime(apt.timeSlot || "11:00 AM");
    setShowRescheduleModal(true);
  };

  const handleSaveReschedule = () => {
    if (!rescheduleTargetApt) return;
    rescheduleAppointment(rescheduleTargetApt.id, newRescheduleDate, newRescheduleTime);
    setShowRescheduleModal(false);
    setRescheduleTargetApt(null);
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTimeInput.trim()) return;
    const allowedGenders: GenderType[] =
      newSlotGender === "all"
        ? ["women", "men", "kids", "unisex"]
        : [newSlotGender as GenderType];
    const slotType =
      newSlotGender === "women"
        ? "women_exclusive"
        : newSlotGender === "men"
        ? "men_grooming"
        : newSlotGender === "kids"
        ? "kids_special"
        : "regular";

    addCustomSlot(
      newSlotTimeInput.trim(),
      selectedBranch.id,
      currentStaff.id,
      allowedGenders,
      ["all"],
      slotType
    );
    setNewSlotTimeInput("");
  };

  // Dynamic Rule Handlers
  const handleApplyCustomBatch = () => {
    const fromMin = parseTimeToMinutes(batchFromTime);
    const toMin = parseTimeToMinutes(batchToTime);
    const [minRange, maxRange] = fromMin <= toMin ? [fromMin, toMin] : [toMin, fromMin];

    let modifiedCount = 0;
    timeSlots.forEach((slot) => {
      const slotMin = parseTimeToMinutes(slot.time);
      if (slotMin >= minRange && slotMin <= maxRange) {
        modifiedCount++;
        if (batchAction === "block_range") {
          toggleSlotAvailability(slot.id, false, batchReason.trim() || "Blocked by Staff");
        } else if (batchAction === "unblock_range") {
          toggleSlotAvailability(slot.id, true, undefined);
        } else {
          const allowedGenders: GenderType[] =
            batchAudience === "all"
              ? ["women", "men", "kids", "unisex"]
              : [batchAudience];
          const allowedCats = batchCategory === "all" ? ["all"] : [batchCategory];
          const slotType =
            batchAudience === "women"
              ? "women_exclusive"
              : batchAudience === "men"
              ? "men_grooming"
              : batchAudience === "kids"
              ? "kids_special"
              : "regular";

          updateSlotConfig(slot.id, {
            allowedGenders,
            allowedCategories: allowedCats,
            slotType,
            isAvailable: true,
            blockedReason:
              batchReason.trim() ||
              (batchAudience === "women"
                ? "Women Exclusive Hours"
                : batchAudience === "men"
                ? "Men's Grooming Hours"
                : undefined),
          });
        }
      }
    });

    addToast(
      "success",
      "Dynamic Rule Applied",
      `Rule successfully configured for ${modifiedCount} slots (${batchFromTime} - ${batchToTime}).`
    );
  };

  const handleApplyRulePreset = (rule: CustomScheduleRule) => {
    const fromMin = parseTimeToMinutes(rule.fromTime);
    const toMin = parseTimeToMinutes(rule.toTime);
    const [minRange, maxRange] = fromMin <= toMin ? [fromMin, toMin] : [toMin, fromMin];

    let count = 0;
    timeSlots.forEach((slot) => {
      const slotMin = parseTimeToMinutes(slot.time);
      if (slotMin >= minRange && slotMin <= maxRange) {
        count++;
        if (rule.action === "block_range") {
          toggleSlotAvailability(slot.id, false, rule.customReason || "Blocked by Staff");
        } else if (rule.action === "unblock_range") {
          toggleSlotAvailability(slot.id, true, undefined);
        } else {
          const allowedGenders: GenderType[] =
            rule.audience === "all"
              ? ["women", "men", "kids", "unisex"]
              : [rule.audience];
          const allowedCats = rule.category === "all" ? ["all"] : [rule.category];
          const slotType =
            rule.audience === "women"
              ? "women_exclusive"
              : rule.audience === "men"
              ? "men_grooming"
              : rule.audience === "kids"
              ? "kids_special"
              : "regular";

          updateSlotConfig(slot.id, {
            allowedGenders,
            allowedCategories: allowedCats,
            slotType,
            isAvailable: true,
            blockedReason: rule.customReason,
          });
        }
      }
    });

    addToast("success", "Preset Applied", `"${rule.name}" applied to ${count} slots.`);
  };

  const handleSaveRulePreset = () => {
    const name = newRuleName.trim() || `${batchAudience.toUpperCase()} (${batchFromTime} - ${batchToTime})`;
    const newRule: CustomScheduleRule = {
      id: generateId("srule"),
      name,
      fromTime: batchFromTime,
      toTime: batchToTime,
      audience: batchAudience,
      category: batchCategory,
      action: batchAction,
      customReason: batchReason.trim() || undefined,
    };
    setSavedRules((prev) => [...prev, newRule]);
    setNewRuleName("");
    addToast("success", "Preset Saved", `Preset "${name}" saved to your quick rules.`);
  };

  const handleDeleteRulePreset = (ruleId: string, ruleName: string) => {
    setSavedRules((prev) => prev.filter((r) => r.id !== ruleId));
    addToast("info", "Preset Removed", `Rule "${ruleName}" deleted.`);
  };

  // Multi-slot selection helpers
  const handleToggleSelectSlot = (slotId: string) => {
    setSelectedSlotIds((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    );
  };

  const handleSelectAllSlots = () => {
    if (selectedSlotIds.length === timeSlots.length) {
      setSelectedSlotIds([]);
    } else {
      setSelectedSlotIds(timeSlots.map((s) => s.id));
    }
  };

  const handleBulkApplyAudience = (audience: GenderType | "all") => {
    if (selectedSlotIds.length === 0) return;
    const allowedGenders: GenderType[] =
      audience === "all"
        ? ["women", "men", "kids", "unisex"]
        : [audience];
    const slotType =
      audience === "women"
        ? "women_exclusive"
        : audience === "men"
        ? "men_grooming"
        : audience === "kids"
        ? "kids_special"
        : "regular";

    selectedSlotIds.forEach((id) => {
      updateSlotConfig(id, {
        allowedGenders,
        slotType,
        isAvailable: true,
        blockedReason:
          audience === "women"
            ? "Women Exclusive Salon Hours"
            : audience === "men"
            ? "Men's Grooming Hours"
            : undefined,
      });
    });
    addToast("success", "Bulk Audience Updated", `Updated ${selectedSlotIds.length} slots.`);
    setSelectedSlotIds([]);
  };

  const handleBulkToggleBlock = (block: boolean) => {
    if (selectedSlotIds.length === 0) return;
    selectedSlotIds.forEach((id) => {
      toggleSlotAvailability(id, !block, block ? "Bulk Blocked by Staff" : undefined);
    });
    addToast("info", block ? "Slots Blocked" : "Slots Reopened", `Updated ${selectedSlotIds.length} slots.`);
    setSelectedSlotIds([]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <img
            src={currentStaff.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
            alt={currentStaff.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">
                {currentStaff.role || "Senior Master Stylist"}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">Clocked In</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {currentStaff.name}
            </h1>
            <p className="text-xs text-slate-500">
              {selectedBranch.name} &bull; Chair #{currentInService?.chairNumber || "04"} Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSlotModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-all"
          >
            <CalendarRange className="w-4 h-4 text-amber-400" />
            <span>Manage My Slots, Gender Rules & Breaks</span>
          </button>
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl text-center min-w-[110px]">
            <div className="text-[10px] uppercase font-bold text-slate-400">Today's Tips</div>
            <div className="text-xl font-bold text-rose-600">₹{estimatedTips.toLocaleString()}</div>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl text-center min-w-[110px]">
            <div className="text-[10px] uppercase font-bold text-slate-400">Est. Commission</div>
            <div className="text-xl font-bold text-emerald-700">₹{estimatedCommission.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Live Client in Chair Hero Box */}
      {currentInService && (
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
                <Timer className="w-3.5 h-3.5 text-yellow-200 animate-spin" />
                <span>
                  {currentInService.status === "in_service"
                    ? "Currently in Chair • Active Service Session"
                    : `Next Up • ${currentInService.timeSlot}`}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                {currentInService.customerName} • {currentInService.serviceName}
              </h2>
              <p className="text-sky-100 text-xs sm:text-sm">
                Ref: <span className="font-mono">{currentInService.bookingRef}</span> &bull; {currentInService.customerPhone} &bull; Notes: {currentInService.serviceNotes || "Complimentary beverage requested"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {currentInService.status !== "in_service" ? (
                <button
                  onClick={() => handleStartService(currentInService.id)}
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-105"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Service Now</span>
                </button>
              ) : (
                <button
                  onClick={() => handleFinishService(currentInService.id)}
                  className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-105"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Service & Bill</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Today's Client Queue & Appointments Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" />
              <span>Live Appointments Schedule & Queue</span>
            </h3>
            <p className="text-xs text-slate-500">
              Synchronized in real-time with customer online bookings & floor POS
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              All ({staffAppointments.length})
            </button>
            <button
              onClick={() => setFilterTab("confirmed")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterTab === "confirmed" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              Upcoming ({staffAppointments.filter((a) => a.status === "confirmed").length})
            </button>
            <button
              onClick={() => setFilterTab("in_service")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterTab === "in_service" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              In Chair ({staffAppointments.filter((a) => a.status === "in_service").length})
            </button>
            <button
              onClick={() => setFilterTab("completed")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterTab === "completed" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              Completed ({staffAppointments.filter((a) => a.status === "completed").length})
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs">No appointments found matching this filter.</p>
            </div>
          ) : (
            filteredList.map((apt) => (
              <div
                key={apt.id}
                className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs hover:bg-slate-50/60 p-3 rounded-2xl transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{apt.customerName}</span>
                    <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {apt.bookingRef}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        apt.status === "in_service"
                          ? "bg-amber-100 text-amber-800"
                          : apt.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : apt.status === "rescheduled"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-sky-100 text-sky-800"
                      }`}
                    >
                      {apt.status === "in_service"
                        ? "In Chair"
                        : apt.status === "completed"
                        ? "Completed"
                        : apt.status === "rescheduled"
                        ? "Rescheduled"
                        : "Confirmed"}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-700">{apt.serviceName}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {apt.date} &bull; {apt.timeSlot}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {apt.customerPhone}
                    </span>
                    {apt.serviceNotes && (
                      <>
                        <span>&bull;</span>
                        <span className="italic text-slate-600">"{apt.serviceNotes}"</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <div className="font-mono font-bold text-sm text-slate-900">
                      ₹{apt.finalTotal.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-700">
                      + ₹{Math.round(apt.finalTotal * (currentStaff.commissionRate || 0.15)).toLocaleString()} Est. Comm
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {apt.status === "confirmed" && (
                      <button
                        onClick={() => handleStartService(apt.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                      >
                        <Play className="w-3 h-3" />
                        <span>Start</span>
                      </button>
                    )}

                    {apt.status === "in_service" && (
                      <button
                        onClick={() => handleFinishService(apt.id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Finish & Bill</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenReschedule(apt)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Reschedule</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Staff Slot Availability & Dynamic Audience/Breaks Management Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <CalendarRange className="w-5 h-5 text-amber-500" />
                  <span>My Availability, Gender Rules & Break Schedule Engine</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure custom time-range rules for your chair, save personal presets, or block lunch and personal breaks dynamically.
                </p>
              </div>
              <button
                onClick={() => setShowSlotModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Dynamic Time-Range Rule Builder Box */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 rounded-2xl text-white space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sliders className="w-4 h-4" />
                  <span>Dynamic Range Rule Configurator</span>
                </span>
                <span className="text-[11px] text-slate-300">
                  Select start/end times and apply rules dynamically to all matching slots
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">From Slot Time</label>
                  <select
                    value={batchFromTime}
                    onChange={(e) => setBatchFromTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {timeSlots.map((s) => (
                      <option key={s.id} value={s.time}>
                        {s.time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">To Slot Time</label>
                  <select
                    value={batchToTime}
                    onChange={(e) => setBatchToTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {timeSlots.map((s) => (
                      <option key={s.id} value={s.time}>
                        {s.time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Target Audience</label>
                  <select
                    value={batchAudience}
                    onChange={(e) => setBatchAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="all">All Guests (Unisex)</option>
                    <option value="women">Women Only 👩</option>
                    <option value="men">Men Only 👨</option>
                    <option value="kids">Kids Friendly 🧒</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Category Lock</label>
                  <select
                    value={batchCategory}
                    onChange={(e) => setBatchCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="all">All Salon Services</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Action Mode</label>
                  <select
                    value={batchAction}
                    onChange={(e) => setBatchAction(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="apply_rule">Set Audience & Category</option>
                    <option value="block_range">Block Selected Range 🔒</option>
                    <option value="unblock_range">Unblock / Reopen 🟢</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={batchReason}
                  onChange={(e) => setBatchReason(e.target.value)}
                  placeholder="Optional custom reason (e.g. Lunch Break, Women Only Hours, Express Styling)..."
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    placeholder="Preset name..."
                    className="w-40 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleSaveRulePreset}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all border border-slate-700"
                    title="Save current config as a reusable preset"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Save Preset</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCustomBatch}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-105"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Apply Rule to Range</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Staff Saved Dynamic Rule Presets List */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Saved Schedule Rule Presets ({savedRules.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    timeSlots.forEach((slot) => {
                      updateSlotConfig(slot.id, {
                        allowedGenders: ["women", "men", "kids", "unisex"],
                        allowedCategories: ["all"],
                        slotType: "regular",
                        isAvailable: true,
                        blockedReason: undefined,
                      });
                    });
                    addToast("info", "Reset", "All slots reset to Unisex / Open.");
                  }}
                  className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset All Slots to Unisex</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {savedRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="group flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs hover:border-amber-400 transition-all text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleApplyRulePreset(rule)}
                      className="font-semibold text-slate-800 hover:text-amber-600 flex items-center gap-1 cursor-pointer text-left"
                    >
                      <span>
                        {rule.action === "block_range"
                          ? "🔒"
                          : rule.audience === "women"
                          ? "👩"
                          : rule.audience === "men"
                          ? "👨"
                          : rule.audience === "kids"
                          ? "🧒"
                          : "✨"}
                      </span>
                      <span>{rule.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({rule.fromTime} - {rule.toTime})
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRulePreset(rule.id, rule.name)}
                      className="text-slate-300 hover:text-rose-500 p-0.5 rounded cursor-pointer transition-colors"
                      title="Delete preset"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Multi-Select Batch Actions Bar */}
            {selectedSlotIds.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-900">
                    {selectedSlotIds.length} slot(s) selected
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleBulkApplyAudience("women")}
                    className="px-2.5 py-1 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-800 font-bold text-[11px] cursor-pointer"
                  >
                    👩 Set Women Only
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkApplyAudience("men")}
                    className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-[11px] cursor-pointer"
                  >
                    👨 Set Men Only
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkApplyAudience("all")}
                    className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] cursor-pointer"
                  >
                    🌟 Set Unisex
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkToggleBlock(true)}
                    className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[11px] cursor-pointer"
                  >
                    🔒 Bulk Block
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkToggleBlock(false)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] cursor-pointer"
                  >
                    🟢 Bulk Unblock
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSlotIds([])}
                    className="px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 text-[11px] cursor-pointer"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            {/* 4. Add Custom Slot Input & Select All */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSelectAllSlots}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
              >
                {selectedSlotIds.length === timeSlots.length ? (
                  <CheckSquare className="w-4 h-4 text-amber-500" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Select All Slots ({timeSlots.length})</span>
              </button>

              <form onSubmit={handleAddSlot} className="flex flex-wrap sm:flex-nowrap gap-2 flex-1 max-w-lg">
                <input
                  type="text"
                  value={newSlotTimeInput}
                  onChange={(e) => setNewSlotTimeInput(e.target.value)}
                  placeholder="Add custom slot e.g. 08:30 AM or 09:00 PM..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
                <select
                  value={newSlotGender}
                  onChange={(e) => setNewSlotGender(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="all">All Audiences (Unisex)</option>
                  <option value="women">Women Only 👩</option>
                  <option value="men">Men Only 👨</option>
                  <option value="kids">Kids Friendly 🧒</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Slot</span>
                </button>
              </form>
            </div>

            {/* Time Slot Toggle Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {timeSlots.map((slot) => {
                const isAvail = slot.isAvailable;
                const isSelected = selectedSlotIds.includes(slot.id);
                const audienceVal =
                  slot.slotType === "women_exclusive"
                    ? "women"
                    : slot.slotType === "men_grooming"
                    ? "men"
                    : slot.slotType === "kids_special"
                    ? "kids"
                    : "all";

                return (
                  <div
                    key={slot.id || slot.time}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                      isSelected
                        ? "ring-2 ring-amber-400 bg-amber-50/50 border-amber-300"
                        : !isAvail
                        ? "bg-rose-50/40 border-rose-200 text-rose-900"
                        : slot.slotType === "women_exclusive"
                        ? "bg-pink-50/40 border-pink-200 text-pink-900"
                        : slot.slotType === "men_grooming"
                        ? "bg-sky-50/40 border-sky-200 text-sky-900"
                        : slot.slotType === "bridal_suite"
                        ? "bg-purple-50/40 border-purple-200 text-purple-900"
                        : "bg-slate-50/60 border-slate-200/90 text-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectSlot(slot.id)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                        <div className="font-mono font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{slot.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            toggleSlotAvailability(
                              slot.id,
                              !isAvail,
                              !isAvail ? undefined : "Staff Break / Unavailable"
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                            isAvail
                              ? "bg-rose-100 hover:bg-rose-200 text-rose-800"
                              : "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                          }`}
                        >
                          {isAvail ? "Block" : "Unblock"}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteSlot(slot.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Audience</label>
                        <select
                          value={audienceVal}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateSlotConfig(slot.id, {
                              allowedGenders:
                                val === "all"
                                  ? ["women", "men", "kids", "unisex"]
                                  : [val as GenderType],
                              slotType:
                                val === "women"
                                  ? "women_exclusive"
                                  : val === "men"
                                  ? "men_grooming"
                                  : val === "kids"
                                  ? "kids_special"
                                  : "regular",
                              blockedReason:
                                val === "women"
                                  ? "Women Exclusive Salon Hours"
                                  : val === "men"
                                  ? "Men's Grooming Hours"
                                  : undefined,
                            });
                          }}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-800 text-[11px] font-medium"
                        >
                          <option value="all">All (Unisex)</option>
                          <option value="women">Women Only 👩</option>
                          <option value="men">Men Only 👨</option>
                          <option value="kids">Kids Friendly 🧒</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-end">
                        <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">State</span>
                        <span className="text-[11px] font-bold text-slate-700 truncate">
                          {!isAvail
                            ? `🔒 ${slot.blockedReason || "Blocked"}`
                            : slot.slotType === "women_exclusive"
                            ? "👩 Women Only"
                            : slot.slotType === "men_grooming"
                            ? "👨 Men Only"
                            : slot.slotType === "kids_special"
                            ? "🧒 Kids Only"
                            : "🟢 Open"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowSlotModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer shadow-xs"
              >
                Close & Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && rescheduleTargetApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Reschedule Appointment</h3>
                <p className="text-xs text-slate-500">{rescheduleTargetApt.customerName} &bull; {rescheduleTargetApt.serviceName}</p>
              </div>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">New Date</label>
                <input
                  type="date"
                  min={todayDateStr}
                  value={newRescheduleDate}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">New Time Slot</label>
                <select
                  value={newRescheduleTime}
                  onChange={(e) => setNewRescheduleTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  {timeSlots.map((s) => (
                    <option key={s.id || s.time} value={s.time}>
                      {s.time} {!s.isAvailable ? `(Blocked - ${s.blockedReason || "Break"})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReschedule}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Save New Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
