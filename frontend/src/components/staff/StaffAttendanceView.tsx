"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Play,
  Square,
  Coffee,
  MapPin,
  Timer,
  Send,
  X,
  Sparkles,
} from "lucide-react";

export function StaffAttendanceView() {
  const { selectedBranch, addToast } = useSalon();
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [clockInTime, setClockInTime] = useState("09:15 AM");
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Leave Form
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const weeklyAttendance = [
    { date: "Today (Fri)", checkIn: "09:15 AM", checkOut: "Active", totalHours: "6h 45m", status: "present" },
    { date: "Thu, Sep 04", checkIn: "09:05 AM", checkOut: "07:30 PM", totalHours: "10h 25m", status: "present" },
    { date: "Wed, Sep 03", checkIn: "09:10 AM", checkOut: "07:15 PM", totalHours: "10h 05m", status: "present" },
    { date: "Tue, Sep 02", checkIn: "09:20 AM", checkOut: "07:45 PM", totalHours: "10h 25m", status: "present" },
    { date: "Mon, Sep 01", checkIn: "—", checkOut: "—", totalHours: "0h", status: "weekly_off" },
    { date: "Sun, Aug 31", checkIn: "09:30 AM", checkOut: "08:00 PM", totalHours: "10h 30m", status: "present" },
  ];

  const handleToggleClock = () => {
    if (isClockedIn) {
      setIsClockedIn(false);
      addToast("info", "Clocked Out", `Shift ended at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`);
    } else {
      setIsClockedIn(true);
      setClockInTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      addToast("success", "Clocked In", `Shift started at ${selectedBranch.name}.`);
    }
  };

  const handleToggleBreak = () => {
    setIsOnBreak(!isOnBreak);
    addToast("info", isOnBreak ? "Break Finished" : "On Break", isOnBreak ? "Back on salon floor." : "15-minute tea/lunch break started.");
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast("success", "Leave Request Submitted", `${leaveType} request from ${startDate} to ${endDate} sent to Salon Manager.`);
    setIsLeaveModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
              Biometric & Shift Time Tracking
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Attendance & Work Hours
          </h1>
          <p className="text-xs text-slate-500">
            Clock in/out, monitor active salon shift duration, and submit leave requests.
          </p>
        </div>

        <button
          onClick={() => setIsLeaveModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
        >
          <Calendar className="w-4 h-4" />
          <span>+ Apply For Leave</span>
        </button>
      </div>

      {/* Clock In / Out Action Hero Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-indigo-200" />
              <span>Geo-Fenced &bull; {selectedBranch.name}</span>
            </div>
            <span className="text-xs font-mono bg-black/20 px-3 py-1 rounded-lg border border-white/20">
              {isClockedIn ? (isOnBreak ? "ON BREAK" : "ON FLOOR") : "CLOCKED OUT"}
            </span>
          </div>

          <div>
            <div className="text-xs text-indigo-200 font-medium">Shift Time Elapsed</div>
            <div className="text-4xl sm:text-5xl font-bold mt-1 flex items-baseline gap-2">
              <span>06:45:12</span>
              <span className="text-xs text-indigo-200 font-sans font-medium">hrs:mins:secs</span>
            </div>
            <div className="text-xs text-indigo-100 mt-2">
              Clocked in today at <span className="font-bold text-white">{clockInTime}</span> &bull; Shift ends 07:30 PM
            </div>
          </div>

          <div className="pt-4 border-t border-white/20 flex flex-wrap items-center gap-3">
            <button
              onClick={handleToggleClock}
              className={`px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all shadow-md ${
                isClockedIn
                  ? "bg-rose-500 hover:bg-rose-600 text-white"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
            >
              {isClockedIn ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isClockedIn ? "Punch Clock Out" : "Punch Clock In"}</span>
            </button>

            {isClockedIn && (
              <button
                onClick={handleToggleBreak}
                className="px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
              >
                <Coffee className="w-4 h-4 text-amber-300" />
                <span>{isOnBreak ? "Resume Shift" : "Take Tea Break"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Monthly Attendance Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <h3 className="font-bold text-base text-slate-900">September 2026 Shift Stats</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Present Days:</span>
              <span className="font-bold text-emerald-700">5 / 5 Days (100%)</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Average Hours/Day:</span>
              <span className="font-bold text-slate-900">9.8 Hours</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Leaves Remaining:</span>
              <span className="font-bold text-indigo-700">14 Days Annual</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900">
            <span className="font-bold block">Punctuality Score: 98%</span>
            <span className="text-[11px] text-indigo-800">Zero late check-ins recorded this month.</span>
          </div>
        </div>
      </div>

      {/* Weekly Attendance History Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-lg text-slate-900">Weekly Shift Logs</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Punch In</th>
                <th className="py-3 px-4">Punch Out</th>
                <th className="py-3 px-4">Total Worked</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {weeklyAttendance.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{row.date}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{row.checkIn}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{row.checkOut}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{row.totalHours}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        row.status === "present"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {row.status === "present" ? "Present" : "Weekly Off"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Application Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Apply for Leave</h3>
                  <p className="text-[11px] text-slate-400">Submit leave request to salon management</p>
                </div>
              </div>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
                >
                  <option value="Casual Leave">Casual Leave (CL)</option>
                  <option value="Sick Leave">Sick Leave (SL)</option>
                  <option value="Privilege Leave">Privilege Holiday (PL)</option>
                  <option value="Compensatory Off">Compensatory Off</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">From Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">To Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason / Notes</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Family event in home city..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer shadow-sm"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
