import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "success" | "warning" | "danger" | "purple" | "outline" | "slate";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const baseStyles = "inline-flex items-center font-medium rounded-full tracking-wide";

  const variants = {
    default: "bg-stone-100 text-stone-800 border border-stone-200",
    gold: "bg-amber-500/10 text-amber-900 border border-amber-500/30",
    success: "bg-emerald-500/10 text-emerald-800 border border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-800 border border-amber-500/40",
    danger: "bg-rose-500/10 text-rose-800 border border-rose-500/30",
    purple: "bg-purple-500/10 text-purple-800 border border-purple-500/30",
    outline: "border border-stone-300 text-stone-700 bg-transparent",
    slate: "bg-neutral-900 text-stone-200 border border-neutral-800",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
