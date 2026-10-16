import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  if (currency === "GBP") {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  if (currency === "AED") {
    return `AED ${amount.toLocaleString()}`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
  if (!match) return 0;
  let hr = parseInt(match[1], 10);
  const min = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3]?.toUpperCase();
  if (period === "PM" && hr < 12) hr += 12;
  if (period === "AM" && hr === 12) hr = 0;
  return hr * 60 + min;
}

export function normalizeSlotTime(input: string): string | null {
  if (!input) return null;
  const clean = input.trim().toUpperCase();
  if (!clean) return null;

  // Case 1: Has AM or PM, e.g. "08:00 AM", "8:30 PM", "8 AM", "8:15PM", "08:00AM"
  const ampmMatch = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
  if (ampmMatch) {
    let hr = parseInt(ampmMatch[1], 10);
    const min = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const period = ampmMatch[3];
    if (hr < 1 || hr > 12 || min < 0 || min > 59) return null;
    return `${hr.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")} ${period}`;
  }

  // Case 2: 24-hour or simple hour e.g. "08:30", "14:00", "8:00", "19:30", "8", "9"
  const timeMatch = clean.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (timeMatch) {
    let hr = parseInt(timeMatch[1], 10);
    const min = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    if (min < 0 || min > 59 || hr < 0 || hr >= 24) return null;
    let period = "AM";
    if (hr === 0) {
      hr = 12;
      period = "AM";
    } else if (hr === 12) {
      period = "PM";
    } else if (hr > 12) {
      hr -= 12;
      period = "PM";
    } else if (hr >= 1 && hr <= 6) {
      // In daytime salon operations, hours 1 to 6 without explicit AM are afternoon (PM)
      period = "PM";
    } else {
      period = "AM";
    }
    return `${hr.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")} ${period}`;
  }

  return null;
}

export function sortTimeSlots<T extends { time: string }>(slots: T[]): T[] {
  return [...slots].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
}

