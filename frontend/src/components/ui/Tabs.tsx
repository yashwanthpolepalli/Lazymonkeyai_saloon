"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: "underline" | "pills" | "gold";
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
  className,
}: TabsProps) {
  if (variant === "pills") {
    return (
      <div className={cn("inline-flex p-1 bg-stone-100 rounded-xl gap-1", className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 z-10 cursor-pointer",
                isActive ? "text-stone-900 font-semibold" : "text-stone-600 hover:text-stone-900"
              )}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full",
                    isActive ? "bg-stone-900 text-stone-50" : "bg-stone-200 text-stone-700"
                  )}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activePill"
                  transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
                  className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Underline default
  return (
    <div className={cn("flex border-b border-stone-200/80 overflow-x-auto no-scrollbar gap-2 sm:gap-6", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative pb-3 pt-1 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer",
              isActive ? "text-stone-900 font-semibold" : "text-stone-500 hover:text-stone-800"
            )}
          >
            {tab.icon && <span className="opacity-80">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "text-[11px] px-2 py-0.5 rounded-full font-semibold",
                  isActive
                    ? "bg-amber-500/15 text-amber-900 border border-amber-500/30"
                    : "bg-stone-100 text-stone-600"
                )}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="activeUnderline"
                transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
