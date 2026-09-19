"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  TrendingUp,
  Users,
  Scissors,
  CreditCard,
  ShoppingBag,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  DollarSign,
  Crown,
  ChevronRight,
  Building,
  CalendarRange,
  Lock,
  Unlock,
  Trash2,
  X,
  Edit3,
  Search,
  Filter,
  Phone,
  UserCheck,
  RefreshCw,
  Sliders,
  BookmarkPlus,
  PlayCircle,
  CheckSquare,
  Square,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AppointmentStatus, GenderType, TimeSlotConfig } from "@/types";
import { generateId } from "@/lib/utils";

interface CustomScheduleRule {
  id: string;
  name: string;
  fromTime: string;
  toTime: string;
  audience: GenderType | "all";
  category: string;
  action: "apply_rule" | "block_range" | "unblock_range";
  customReason?: string;
}

export function OwnerDashboardView() {
  const {
    selectedBranch,
    customers,
    appointments,
    stylists,
    services,
    categories,
    inventory,
    timeSlots,
    toggleSlotAvailability,
    updateSlotConfig,
    addCustomSlot,
    deleteSlot,
    updateAppointmentStatus,
    rescheduleAppointment,
    addToast,
    setActiveModule,
    setActiveSubTab,
  } = useSalon();

  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("today");
  const [aptSearch, setAptSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [targetApt, setTargetApt] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [rescheduleTime, setRescheduleTime] = useState("11:00 AM");
  const [rescheduleStylistId, setRescheduleStylistId] = useState("");

  // Slot management & Rule Engine State
  const [newSlotTime, setNewSlotTime] = useState("");
  const [newSlotGender, setNewSlotGender] = useState<string>("all");
  const [newSlotCategory, setNewSlotCategory] = useState<string>("all");
  const [slotFilterAudience, setSlotFilterAudience] = useState<string>("all");
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);

  // Dynamic Time Range Rule Builder
  const [batchFromTime, setBatchFromTime] = useState(timeSlots[0]?.time || "09:00 AM");
  const [batchToTime, setBatchToTime] = useState(timeSlots[timeSlots.length - 1]?.time || "08:30 PM");
  const [batchAudience, setBatchAudience] = useState<GenderType | "all">("women");
  const [batchCategory, setBatchCategory] = useState<string>("all");
  const [batchAction, setBatchAction] = useState<"apply_rule" | "block_range" | "unblock_range">("apply_rule");
  const [batchReason, setBatchReason] = useState("");
  const [newRuleName, setNewRuleName] = useState("");

  // Configurable saved rules list - dynamic from browser storage
  const [savedRules, setSavedRules] = useState<CustomScheduleRule[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("salon_saved_schedule_rules");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("salon_saved_schedule_rules", JSON.stringify(savedRules));
    } catch (e) {
      console.error("Failed to save rules to localStorage", e);
    }
  }, [savedRules]);

  const lowStockCount = inventory.filter((i) => i.currentStock <= i.reorderThreshold).length;

  const branchApts = useMemo(() => {
    return appointments.filter(
      (a) => a.branchId === selectedBranch.id || a.branchId === "all"
    );
  }, [appointments, selectedBranch.id]);

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

  // Helper to parse 12-hour slot time into hour integer
  const getSlotHour = (timeStr: string): number => {
    return Math.floor(parseTimeToMinutes(timeStr) / 60);
  };

  // Dynamically compute progressive revenue and footfall velocity
  const revenueData = useMemo(() => {
    const buckets = [
      { time: "09 AM", startHour: 9, endHour: 10, revenue: 0, footfall: 0 },
      { time: "11 AM", startHour: 11, endHour: 12, revenue: 0, footfall: 0 },
      { time: "01 PM", startHour: 13, endHour: 14, revenue: 0, footfall: 0 },
      { time: "03 PM", startHour: 15, endHour: 16, revenue: 0, footfall: 0 },
      { time: "05 PM", startHour: 17, endHour: 18, revenue: 0, footfall: 0 },
      { time: "07 PM", startHour: 19, endHour: 20, revenue: 0, footfall: 0 },
      { time: "09 PM", startHour: 21, endHour: 22, revenue: 0, footfall: 0 },
    ];

    branchApts.forEach((apt) => {
      const hr = getSlotHour(apt.timeSlot);
      const b =
        buckets.find((bucket) => hr >= bucket.startHour && hr <= bucket.endHour) ||
        buckets[buckets.length - 1];
      if (b) {
        b.revenue += apt.finalTotal;
        b.footfall += 1;
      }
    });

    let cumulativeRev = 0;
    let cumulativeFootfall = 0;
    return buckets.map((b) => {
      cumulativeRev += b.revenue;
      cumulativeFootfall += b.footfall;
      return {
        time: b.time,
        revenue: cumulativeRev,
        footfall: cumulativeFootfall,
      };
    });
  }, [branchApts]);

  const totalGrossSales = useMemo(() => {
    return branchApts.reduce((sum, a) => sum + a.finalTotal, 0);
  }, [branchApts]);

  const totalFootfall = branchApts.length;
  const inChairCount = branchApts.filter((a) => a.status === "in_service").length;
  const confirmedCount = branchApts.filter((a) => a.status === "confirmed").length;
  const avgOrderValue = totalFootfall > 0 ? Math.round(totalGrossSales / totalFootfall) : 0;

  const vipMemberPct = useMemo(() => {
    if (branchApts.length === 0) return 0;
    const vipCount = branchApts.filter((a) => {
      const c = customers.find((cust) => cust.id === a.customerId);
      return c?.membership && c.membership.active;
    }).length;
    return Math.round((vipCount / branchApts.length) * 100);
  }, [branchApts, customers]);

  const stylistStats = useMemo(() => {
    return stylists.map((st) => {
      const assigned = branchApts.filter((a) => a.stylistId === st.id);
      const totalRev = assigned.reduce((sum, a) => sum + a.finalTotal, 0);
      const inService = assigned.find((a) => a.status === "in_service");
      return {
        ...st,
        assignedCount: assigned.length,
        todayEarnings: totalRev,
        inServiceApt: inService,
      };
    });
  }, [stylists, branchApts]);

  const filteredApts = useMemo(() => {
    return branchApts.filter((a) => {
      const matchesSearch =
        a.customerName.toLowerCase().includes(aptSearch.toLowerCase()) ||
        a.bookingRef.toLowerCase().includes(aptSearch.toLowerCase()) ||
        a.serviceName.toLowerCase().includes(aptSearch.toLowerCase()) ||
        a.stylistName.toLowerCase().includes(aptSearch.toLowerCase());
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [branchApts, aptSearch, statusFilter]);

  const handleOpenReschedule = (apt: any) => {
    setTargetApt(apt);
    setRescheduleDate(apt.date || new Date().toISOString().split("T")[0]);
    setRescheduleTime(apt.timeSlot || "11:00 AM");
    setRescheduleStylistId(apt.stylistId || "");
    setShowRescheduleModal(true);
  };

  const handleSaveReschedule = () => {
    if (!targetApt) return;
    rescheduleAppointment(
      targetApt.id,
      rescheduleDate,
      rescheduleTime,
      rescheduleStylistId || undefined
    );
    setShowRescheduleModal(false);
    setTargetApt(null);
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTime.trim()) return;
    const allowedGenders: GenderType[] =
      newSlotGender === "all"
        ? ["women", "men", "kids", "unisex"]
        : [newSlotGender as GenderType];
    const allowedCategories =
      newSlotCategory === "all" ? ["all"] : [newSlotCategory];
    const slotType =
      newSlotGender === "women"
        ? "women_exclusive"
        : newSlotGender === "men"
        ? "men_grooming"
        : newSlotGender === "kids"
        ? "kids_special"
        : newSlotCategory === "cat_bridal"
        ? "bridal_suite"
        : "regular";

    addCustomSlot(
      newSlotTime.trim(),
      selectedBranch.id,
      "all",
      allowedGenders,
      allowedCategories,
      slotType
    );
    setNewSlotTime("");
  };

  // Dynamic Range Execution
  const applyRuleToSlots = (rule: Omit<CustomScheduleRule, "id" | "name">) => {
    const startMins = parseTimeToMinutes(rule.fromTime);
    const endMins = parseTimeToMinutes(rule.toTime);

    let updatedCount = 0;
    timeSlots.forEach((slot) => {
      const slotMins = parseTimeToMinutes(slot.time);
      if (slotMins >= startMins && slotMins <= endMins) {
        updatedCount++;
        if (rule.action === "block_range") {
          updateSlotConfig(slot.id, {
            isAvailable: false,
            blockedReason: rule.customReason || "Blocked by salon management",
            slotType: "break",
          });
        } else if (rule.action === "unblock_range") {
          updateSlotConfig(slot.id, {
            isAvailable: true,
            blockedReason: undefined,
            slotType: "regular",
            allowedGenders: ["women", "men", "kids", "unisex"],
            allowedCategories: ["all"],
          });
        } else {
          // apply audience / category rule
          const allowedGenders: GenderType[] =
            rule.audience === "all"
              ? ["women", "men", "kids", "unisex"]
              : [rule.audience];
          const allowedCategories =
            rule.category === "all" ? ["all"] : [rule.category];
          const slotType =
            rule.audience === "women"
              ? "women_exclusive"
              : rule.audience === "men"
              ? "men_grooming"
              : rule.audience === "kids"
              ? "kids_special"
              : rule.category === "cat_bridal"
              ? "bridal_suite"
              : "regular";

          updateSlotConfig(slot.id, {
            isAvailable: true,
            allowedGenders,
            allowedCategories,
            slotType,
            blockedReason:
              rule.customReason ||
              (rule.audience === "women"
                ? "Women Exclusive Salon Hours"
                : rule.audience === "men"
                ? "Men's Grooming Hours"
                : rule.category === "cat_bridal"
                ? "Bridal & VIP Suite Only"
                : undefined),
          });
        }
      }
    });

    addToast(
      "success",
      "Dynamic Schedule Rule Applied",
      `Applied to ${updatedCount} slots between ${rule.fromTime} and ${rule.toTime}.`
    );
  };

  const handleApplyCustomBatch = () => {
    applyRuleToSlots({
      fromTime: batchFromTime,
      toTime: batchToTime,
      audience: batchAudience,
      category: batchCategory,
      action: batchAction,
      customReason: batchReason,
    });
  };

  const handleSaveRulePreset = () => {
    const name = newRuleName.trim() || `${batchFromTime} - ${batchToTime} (${batchAudience})`;
    const newRule: CustomScheduleRule = {
      id: generateId("rule"),
      name,
      fromTime: batchFromTime,
      toTime: batchToTime,
      audience: batchAudience,
      category: batchCategory,
      action: batchAction,
      customReason: batchReason,
    };
    setSavedRules((prev) => [...prev, newRule]);
    setNewRuleName("");
    addToast("success", "Rule Saved", `Preset "${name}" added to your custom rules.`);
  };

  const handleDeleteSavedRule = (ruleId: string) => {
    setSavedRules((prev) => prev.filter((r) => r.id !== ruleId));
    addToast("info", "Rule Removed", "Preset deleted from custom rules.");
  };

  const handleBulkSelectedSlotsAction = (action: "block" | "unblock" | "women" | "men" | "kids") => {
    if (selectedSlotIds.length === 0) return;
    selectedSlotIds.forEach((slotId) => {
      if (action === "block") {
        toggleSlotAvailability(slotId, false, "Blocked by salon management");
      } else if (action === "unblock") {
        toggleSlotAvailability(slotId, true);
      } else if (action === "women") {
        updateSlotConfig(slotId, {
          allowedGenders: ["women"],
          slotType: "women_exclusive",
          blockedReason: "Women Exclusive Salon Hours",
        });
      } else if (action === "men") {
        updateSlotConfig(slotId, {
          allowedGenders: ["men"],
          slotType: "men_grooming",
          blockedReason: "Men's Grooming Hours",
        });
      } else if (action === "kids") {
        updateSlotConfig(slotId, {
          allowedGenders: ["kids", "women", "men"],
          slotType: "kids_special",
          blockedReason: "Kids Friendly Hours",
        });
      }
    });
    addToast("success", "Bulk Action Applied", `Updated ${selectedSlotIds.length} selected slots.`);
    setSelectedSlotIds([]);
  };

  const toggleSelectSlot = (slotId: string) => {
    if (selectedSlotIds.includes(slotId)) {
      setSelectedSlotIds((prev) => prev.filter((id) => id !== slotId));
    } else {
      setSelectedSlotIds((prev) => [...prev, slotId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedSlotIds.length === timeSlots.length) {
      setSelectedSlotIds([]);
    } else {
      setSelectedSlotIds(timeSlots.map((s) => s.id));
    }
  };

  const filteredModalSlots = useMemo(() => {
    if (slotFilterAudience === "all") return timeSlots;
    return timeSlots.filter(
      (s) =>
        s.slotType === slotFilterAudience ||
        s.allowedGenders?.includes(slotFilterAudience as any)
    );
  }, [timeSlots, slotFilterAudience]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Live Salon Floor &bull; {selectedBranch.name}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Executive Owner Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Real-time analytics, revenue velocity, staff chair utilization, and live synchronized booking orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSlotModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
          >
            <CalendarRange className="w-4 h-4" />
            <span>Salon Business Slots & Rules Engine</span>
          </button>

          <button
            onClick={() => {
              setActiveModule("crm");
              setActiveSubTab("customers");
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Users className="w-3.5 h-3.5" />
            <span>+ Customer</span>
          </button>

          <button
            onClick={() => {
              setActiveModule("pos");
              setActiveSubTab("newsale");
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>+ POS Bill</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today Gross Sales */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today Gross Sales</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-3">₹{totalGrossSales.toLocaleString()}</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 mt-2 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Calculated from {totalFootfall} live orders</span>
          </div>
        </div>

        {/* Total Bookings / Appointments */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Appointments</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-3">{totalFootfall} Orders</div>
          <div className="flex items-center gap-1.5 text-xs text-sky-700 mt-2 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {inChairCount} In Chair &bull; {confirmedCount} Upcoming
            </span>
          </div>
        </div>

        {/* Average Ticket Value */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Order Value</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-3">₹{avgOrderValue.toLocaleString()}</div>
          <div className="flex items-center gap-1.5 text-xs text-amber-700 mt-2 font-semibold">
            <Crown className="w-3.5 h-3.5" />
            <span>{vipMemberPct}% VIP Members</span>
          </div>
        </div>

        {/* Available Slots */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Slots</span>
            <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-3">
            {timeSlots.filter((s) => s.isAvailable).length} / {timeSlots.length}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-violet-700 mt-2 font-semibold">
            <span>{timeSlots.filter((s) => !s.isAvailable).length} Slots Blocked / Breaks</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Live Stylists Floor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue Velocity Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Today's Revenue Velocity</h3>
              <p className="text-xs text-slate-500">Live hourly sales intake & footfall from bookings</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setTimeRange("today")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  timeRange === "today" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setTimeRange("week")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  timeRange === "week" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange("month")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  timeRange === "month" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Month
              </button>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Cumulative Revenue"]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Live Stylists Floor & Stock */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-500" />
              <span>Live Stylists On Floor</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              {stylists.length} Active
            </span>
          </div>

          <div className="space-y-3 divide-y divide-slate-100">
            {stylistStats.slice(0, 4).map((st) => (
              <div key={st.id} className="pt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={st.avatar}
                    alt={st.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-bold text-slate-900">{st.name}</div>
                    <div className="text-[11px] text-slate-400 capitalize">{st.tier} Stylist</div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      st.inServiceApt
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {st.inServiceApt ? `In Chair (${st.inServiceApt.serviceName.split(" ")[0]})` : "Ready"}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    ₹{st.todayEarnings.toLocaleString()} billed
                  </div>
                </div>
              </div>
            ))}
          </div>

          {lowStockCount > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{lowStockCount} Products Low on Stock</span>
              </div>
              <button
                onClick={() => {
                  setActiveModule("inventory");
                  setActiveSubTab("inventory");
                }}
                className="font-bold text-amber-800 hover:underline cursor-pointer"
              >
                Reorder &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Master Appointments Management Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>Live Salon Floor Appointments Queue</span>
            </h3>
            <p className="text-xs text-slate-500">
              Orders placed by customers online reflect here instantly. Owner can reassign stylists, change slots, or mark progress.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={aptSearch}
                onChange={(e) => setAptSearch(e.target.value)}
                placeholder="Search client, ref, stylist..."
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 w-48 sm:w-60"
              />
            </div>

            {/* Status Pills */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              <option value="all">All Statuses ({branchApts.length})</option>
              <option value="confirmed">Confirmed / Upcoming</option>
              <option value="in_service">In Chair / In Service</option>
              <option value="completed">Completed</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4 rounded-l-xl">Ref & Client</th>
                <th className="py-3 px-4">Service & Category</th>
                <th className="py-3 px-4">Stylist & Tier</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredApts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No appointments found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredApts.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{apt.customerName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{apt.bookingRef} &bull; {apt.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 font-semibold">{apt.serviceName}</div>
                      <div className="text-[10px] text-slate-400">{apt.categoryName} &bull; {apt.durationMinutes}m</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                        <span>{apt.stylistName}</span>
                      </div>
                      <div className="text-[10px] uppercase font-bold text-amber-700">{apt.stylistTier}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{apt.date}</div>
                      <div className="font-mono text-[11px] text-slate-500">{apt.timeSlot}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          apt.status === "in_service"
                            ? "bg-amber-100 text-amber-800"
                            : apt.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : apt.status === "rescheduled"
                            ? "bg-purple-100 text-purple-800"
                            : apt.status === "cancelled"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-sky-100 text-sky-800"
                        }`}
                      >
                        {apt.status === "in_service"
                          ? "In Chair"
                          : apt.status === "completed"
                          ? "Completed"
                          : apt.status === "rescheduled"
                          ? "Rescheduled"
                          : apt.status === "cancelled"
                          ? "Cancelled"
                          : "Confirmed"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ₹{apt.finalTotal.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status !== "in_service" && apt.status !== "completed" && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, "in_service")}
                            className="px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold text-[10px] cursor-pointer"
                            title="Mark In Chair"
                          >
                            In Chair
                          </button>
                        )}
                        {apt.status === "in_service" && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, "completed")}
                            className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[10px] cursor-pointer"
                            title="Mark Completed"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenReschedule(apt)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="Reschedule / Reassign"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Master Salon Business Slots & Custom Rules Engine Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <CalendarRange className="w-5 h-5 text-amber-500" />
                  <span>Master Salon Slots & Dynamic Schedule Rule Engine</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Build custom time-range rules for any audience (Women/Men/Kids) or service category, save recurring presets, or bulk-block hours.
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
                  placeholder="Optional custom reason (e.g. VIP Bridal Hours, Cleaning Break, Women Exclusive)..."
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    placeholder="Rule preset name..."
                    className="w-44 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
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

            {/* 2. User's Saved Dynamic Rule Presets List */}
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
                {savedRules.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">
                    No presets saved yet. Configure a rule above and click "Save Rule Preset" to add one.
                  </p>
                ) : (
                  savedRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="group flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs hover:border-amber-400 transition-all text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => applyRuleToSlots(rule)}
                        className="font-semibold text-slate-800 hover:text-amber-600 flex items-center gap-1 cursor-pointer"
                        title={`Click to apply ${rule.fromTime} - ${rule.toTime}`}
                      >
                        <PlayCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span>{rule.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          ({rule.fromTime} - {rule.toTime})
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSavedRule(rule.id)}
                        className="text-slate-300 hover:text-rose-600 ml-1 cursor-pointer"
                        title="Delete preset"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. Bulk Selection & Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer"
                >
                  {selectedSlotIds.length === timeSlots.length ? (
                    <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>Select All ({timeSlots.length})</span>
                </button>

                {selectedSlotIds.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-xs">
                    <span className="font-bold text-amber-800">{selectedSlotIds.length} Selected:</span>
                    <button
                      type="button"
                      onClick={() => handleBulkSelectedSlotsAction("women")}
                      className="px-2 py-0.5 rounded bg-pink-100 text-pink-800 hover:bg-pink-200 font-semibold cursor-pointer"
                    >
                      Women 👩
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkSelectedSlotsAction("men")}
                      className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 hover:bg-sky-200 font-semibold cursor-pointer"
                    >
                      Men 👨
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkSelectedSlotsAction("kids")}
                      className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 font-semibold cursor-pointer"
                    >
                      Kids 🧒
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkSelectedSlotsAction("block")}
                      className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 hover:bg-rose-200 font-semibold cursor-pointer"
                    >
                      Block 🔒
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkSelectedSlotsAction("unblock")}
                      className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-semibold cursor-pointer"
                    >
                      Unblock 🟢
                    </button>
                  </div>
                )}
              </div>

              {/* Add Custom Slot Input */}
              <form onSubmit={handleAddSlot} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  placeholder="Add custom slot e.g. 08:00 AM..."
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* 4. Time Slot Toggle & Modification Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredModalSlots.map((slot) => {
                const isAvail = slot.isAvailable;
                const isChecked = selectedSlotIds.includes(slot.id);
                const audienceVal =
                  slot.slotType === "women_exclusive"
                    ? "women"
                    : slot.slotType === "men_grooming"
                    ? "men"
                    : slot.slotType === "kids_special"
                    ? "kids"
                    : "all";

                const categoryVal =
                  slot.slotType === "bridal_suite"
                    ? "cat_bridal"
                    : slot.allowedCategories?.[0] || "all";

                return (
                  <div
                    key={slot.id || slot.time}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2.5 relative ${
                      isChecked ? "ring-2 ring-amber-500" : ""
                    } ${
                      !isAvail
                        ? "bg-rose-50/40 border-rose-200 text-rose-950"
                        : slot.slotType === "women_exclusive"
                        ? "bg-pink-50/40 border-pink-200 text-pink-950"
                        : slot.slotType === "men_grooming"
                        ? "bg-sky-50/40 border-sky-200 text-sky-950"
                        : slot.slotType === "bridal_suite"
                        ? "bg-purple-50/40 border-purple-200 text-purple-950"
                        : "bg-slate-50/60 border-slate-200/90 text-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSelectSlot(slot.id)}
                          className="text-slate-400 hover:text-amber-500 cursor-pointer"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
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
                              !isAvail ? undefined : "Salon Maintenance & Break"
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

                    {/* In-Card Gender/Audience & Service Pickers */}
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

                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Service Lock</label>
                        <select
                          value={categoryVal}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateSlotConfig(slot.id, {
                              allowedCategories: val === "all" ? ["all"] : [val],
                              slotType: val === "cat_bridal" ? "bridal_suite" : "regular",
                              blockedReason:
                                val === "cat_bridal"
                                  ? "Bridal & VIP Suite Only"
                                  : undefined,
                            });
                          }}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-800 text-[11px] font-medium"
                        >
                          <option value="all">All Services</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="text-[10px] flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>Status:</span>
                      <span className="font-semibold">
                        {!isAvail
                          ? slot.blockedReason || "Blocked"
                          : slot.slotType === "women_exclusive"
                          ? "Women Exclusive 👩"
                          : slot.slotType === "men_grooming"
                          ? "Men Grooming 👨"
                          : slot.slotType === "bridal_suite"
                          ? "Bridal VIP Suite 👰"
                          : "Open to All 🟢"}
                      </span>
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
                Save & Apply Live Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule / Reassign Modal */}
      {showRescheduleModal && targetApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Reschedule / Reassign Booking</h3>
                <p className="text-xs text-slate-500">{targetApt.customerName} &bull; {targetApt.serviceName}</p>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1">Appointment Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Time Slot</label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  {timeSlots.map((s) => (
                    <option key={s.id || s.time} value={s.time}>
                      {s.time} {!s.isAvailable ? `(Blocked - ${s.blockedReason || "Break"})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Reassign Stylist</label>
                <select
                  value={rescheduleStylistId}
                  onChange={(e) => setRescheduleStylistId(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  {stylists.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.tier})
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
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
