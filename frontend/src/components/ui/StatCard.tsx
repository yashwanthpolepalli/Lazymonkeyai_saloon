import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  subtext?: string;
  variant?: "default" | "gold" | "dark";
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  subtext,
  variant = "default",
  className,
}: StatCardProps) {
  const isDark = variant === "dark";
  const isGold = variant === "gold";

  return (
    <div
      className={cn(
        "p-5 rounded-2xl transition-all duration-300 relative overflow-hidden border",
        isDark
          ? "bg-neutral-950 border-neutral-800 text-stone-100"
          : isGold
          ? "bg-gradient-to-br from-amber-500/10 via-stone-50 to-white border-amber-400/30 text-stone-900 shadow-sm"
          : "bg-white border-stone-200/80 shadow-sm text-stone-900",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-stone-400" : "text-stone-500")}>
          {title}
        </span>
        <div
          className={cn(
            "p-2.5 rounded-xl flex items-center justify-center",
            isDark
              ? "bg-neutral-800 text-amber-300"
              : isGold
              ? "bg-amber-500/20 text-amber-800"
              : "bg-stone-100 text-stone-800"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5",
              isPositive
                ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                : "text-rose-700 bg-rose-50 border border-rose-200"
            )}
          >
            {isPositive ? "+" : ""}
            {change}
          </span>
        )}
      </div>

      {subtext && (
        <p className={cn("mt-1.5 text-xs", isDark ? "text-stone-400" : "text-stone-500")}>
          {subtext}
        </p>
      )}
    </div>
  );
}
