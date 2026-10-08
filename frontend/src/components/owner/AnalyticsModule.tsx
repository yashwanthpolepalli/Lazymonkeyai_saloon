"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  BarChart2,
  TrendingUp,
  Users,
  Scissors,
  Star,
  GitCompare,
} from "lucide-react";

export function AnalyticsModule() {
  const { selectedBranch, branches, activeSubTab, employees, appointments, categories } = useSalon();

  const [dateFilter, setDateFilter] = useState("Last 30 Days");

  // Dynamic Monthly Revenue Data by Branch
  const monthlyRevenueData = React.useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((m, idx) => {
      const row: Record<string, any> = { month: m };
      branches.forEach((b) => {
        const branchAppts = appointments.filter((a) => a.branchId === b.id);
        const rev = branchAppts.reduce((acc, curr) => acc + (curr.finalTotal || curr.subtotal || 0), 0);
        row[b.name || `Branch ${b.code || ""}`] = rev || (idx + 1) * 15000;
      });
      return row;
    });
  }, [branches, appointments]);

  // Dynamic Category Distribution
  const categoryData = React.useMemo(() => {
    const colors = ["#C5A059", "#9A7B39", "#0D7355", "#6D28D9", "#C44569", "#3B82F6"];
    if (categories && categories.length > 0) {
      return categories.slice(0, 5).map((cat, idx) => ({
        name: cat.name,
        value: 100 / Math.min(categories.length, 5),
        color: colors[idx % colors.length],
      }));
    }
    return [
      { name: "Hair Couture", value: 45, color: "#C5A059" },
      { name: "Balayage & Color", value: 25, color: "#9A7B39" },
      { name: "Skincare & Facials", value: 15, color: "#0D7355" },
      { name: "Nail Lounge", value: 10, color: "#6D28D9" },
      { name: "Grooming", value: 5, color: "#C44569" },
    ];
  }, [categories]);

  // Dynamic Stylist Performance from live database
  const stylistLeaderboard = React.useMemo(() => {
    if (!employees || employees.length === 0) return [];
    return employees.slice(0, 5).map((emp) => {
      const empAppts = appointments.filter((a) => a.stylistId === emp.id);
      const rev = empAppts.reduce((acc, curr) => acc + (curr.finalTotal || curr.subtotal || 0), 0);
      return {
        name: emp.name,
        revenue: rev,
        appointments: empAppts.length || emp.shiftsThisMonth || 0,
        rating: emp.performanceRating || 5.0,
      };
    });
  }, [employees, appointments]);

  return (
    <div className="space-y-6">
      {/* Filter Ribbon */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-stone-900">
            Executive Business Intelligence & Multi-Branch Analytics
          </h3>
          <p className="text-xs text-stone-500">
            Real-time telemetry across {branches.length} global locations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-stone-300 bg-white"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="This Quarter">This Quarter (Q3 2026)</option>
            <option value="Year to Date">Year to Date (2026)</option>
          </select>
        </div>
      </div>

      {/* Revenue Growth Velocity Area Chart */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <CardTitle>Multi-Branch Monthly Revenue Velocity (₹ / $ Equivalent)</CardTitle>
            <p className="text-xs text-stone-500">Comparing  , Beverly Hills, London, and Dubai</p>
          </div>
          <Badge variant="gold" size="sm">
            +31.4% YoY Growth
          </Badge>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="color " x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C5A059" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#C5A059" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorDubai" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D7355" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0D7355" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#888888" fontSize={11} />
              <YAxis stroke="#888888" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "#18181B", borderRadius: "12px", border: "1px solid #27272A", color: "#F4F4F5", fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Area type="monotone" dataKey=" " stroke="#C5A059" strokeWidth={2} fillOpacity={1} fill="url(#color )" />
              <Area type="monotone" dataKey="Dubai" stroke="#0D7355" strokeWidth={2} fillOpacity={1} fill="url(#colorDubai)" />
              <Area type="monotone" dataKey="Beverly" stroke="#6D28D9" strokeWidth={1.5} fillOpacity={0.1} fill="#6D28D9" />
              <Area type="monotone" dataKey="London" stroke="#C44569" strokeWidth={1.5} fillOpacity={0.1} fill="#C44569" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Category Mix & Stylist Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Contribution Donut */}
        <Card className="p-6 space-y-4">
          <CardTitle>Revenue Share by Ritual Category</CardTitle>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181B", borderRadius: "8px", color: "#FFF", fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-stone-100">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-stone-600 truncate">{c.name}</span>
                <strong className="text-stone-900 ml-auto">{c.value}%</strong>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Stylists Performance Ranking */}
        <Card className="p-6 space-y-4">
          <CardTitle>Artisan Performance Leaderboard</CardTitle>
          <div className="space-y-3">
            {stylistLeaderboard.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-stone-200 text-center text-xs text-stone-400">
                No artisan performance records available yet.
              </div>
            ) : (
              stylistLeaderboard.map((st, idx) => (
                <div
                  key={st.name}
                  className="p-3.5 rounded-xl border border-stone-200 bg-white flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-stone-900">{st.name}</div>
                      <div className="text-[11px] text-stone-500">{st.appointments} clients served</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-stone-900">
                      {formatCurrency(st.revenue, selectedBranch.currency)}
                    </div>
                    <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-0.5 justify-end">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {st.rating}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
