import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "luxury" | "glass" | "dark" | "outline";
  hoverable?: boolean;
}

export function Card({
  className,
  variant = "default",
  hoverable = false,
  children,
  ...props
}: CardProps) {
  const baseStyles = "rounded-2xl transition-all duration-300 relative overflow-hidden";

  const variants = {
    default: "bg-white border border-stone-200/80 shadow-sm",
    luxury:
      "bg-gradient-to-b from-white to-stone-50/50 border border-amber-900/10 shadow-[0_4px_20px_-4px_rgba(197,160,89,0.08)]",
    glass:
      "bg-white/80 backdrop-blur-md border border-white/40 shadow-lg shadow-stone-900/5",
    dark: "bg-neutral-950 border border-neutral-800 text-stone-100 shadow-xl",
    outline: "border border-stone-200 bg-transparent",
  };

  const hoverStyles = hoverable
    ? "hover:-translate-y-1 hover:shadow-xl hover:border-amber-500/30 cursor-pointer"
    : "";

  return (
    <div className={cn(baseStyles, variants[variant], hoverStyles, className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-5 border-b border-stone-100 flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-medium text-stone-900 tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}
