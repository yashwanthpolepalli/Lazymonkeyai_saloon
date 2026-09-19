import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "gold" | "outline" | "ghost" | "danger" | "dark";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer rounded-lg select-none";

    const variants = {
      primary:
        "bg-stone-900 text-stone-50 hover:bg-stone-800 shadow-sm border border-stone-800 focus:ring-stone-900 active:scale-[0.98]",
      secondary:
        "bg-stone-100 text-stone-800 hover:bg-stone-200/80 border border-stone-200/80 focus:ring-stone-400 active:scale-[0.98]",
      gold:
        "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-stone-950 font-semibold shadow-md shadow-amber-500/10 hover:shadow-amber-500/25 hover:brightness-105 border border-amber-400/40 focus:ring-amber-500 active:scale-[0.98]",
      outline:
        "border border-stone-300/80 bg-transparent text-stone-800 hover:bg-stone-100/60 focus:ring-stone-400 active:scale-[0.98]",
      ghost:
        "bg-transparent text-stone-700 hover:bg-stone-100/80 hover:text-stone-900 focus:ring-stone-400",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-sm focus:ring-rose-500 active:scale-[0.98]",
      dark:
        "bg-neutral-950 text-amber-200 border border-amber-500/30 hover:border-amber-500/60 hover:bg-neutral-900 focus:ring-amber-500",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 h-8 gap-1.5 rounded-md",
      md: "text-sm px-4 py-2.5 h-10 gap-2",
      lg: "text-base px-6 py-3.5 h-12 gap-2.5 rounded-xl font-semibold",
      icon: "h-10 w-10 p-0 rounded-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
