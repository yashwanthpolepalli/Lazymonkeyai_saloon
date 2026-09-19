"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  position?: "right" | "bottom" | "left";
  width?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  position = "right",
  width = "md",
  className,
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  const variants = {
    right: {
      initial: { x: "100%" },
      animate: { x: 0 },
      exit: { x: "100%" },
      positionClasses: "top-0 right-0 bottom-0 h-full w-full",
    },
    left: {
      initial: { x: "-100%" },
      animate: { x: 0 },
      exit: { x: "-100%" },
      positionClasses: "top-0 left-0 bottom-0 h-full w-full",
    },
    bottom: {
      initial: { y: "100%" },
      animate: { y: 0 },
      exit: { y: "100%" },
      positionClasses: "bottom-0 left-0 right-0 max-h-[85vh] w-full rounded-t-3xl",
    },
  };

  const activeVariant = variants[position];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm"
          />

          {/* Drawer Body */}
          <motion.div
            initial={activeVariant.initial}
            animate={activeVariant.animate}
            exit={activeVariant.exit}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className={cn(
              "fixed bg-white shadow-2xl z-10 flex flex-col border-stone-200/80 overflow-hidden",
              activeVariant.positionClasses,
              position !== "bottom" && widthClasses[width],
              className
            )}
          >
            {/* Header */}
            {title && (
              <div className="px-6 py-4.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
                <div>
                  <h3 className="text-lg font-medium text-stone-900">{title}</h3>
                  {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="p-6 overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
