"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Bot, Sparkles, Percent, Sliders, CheckCircle2, Zap } from "lucide-react";

export function AIModule() {
  const { selectedBranch, addToast } = useSalon();

  const [pricingOptimized, setPricingOptimized] = useState(false);
  const [scheduleBalanced, setScheduleBalanced] = useState(false);

  const handleOptimizePricing = () => {
    setPricingOptimized(true);
    addToast("success", "AI Dynamic Pricing Applied", "Adjusted peak-hour blowouts (+8%) and Tuesday low-demand slots (-12%).");
  };

  const handleBalanceSchedule = () => {
    setScheduleBalanced(true);
    addToast("success", "AI Schedule Optimized", "Rebalanced artisan breaks to eliminate 45-minute bottlenecks.");
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-100">
              LazyMonkey AI Autonomous Intelligence Engine
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Predictive salon floor balancing, dynamic yield pricing, and client retention machine models.
            </p>
          </div>
        </div>
        <Badge variant="gold" size="md">
          Neural Model v4.2 Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dynamic Yield Pricing Engine */}
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-amber-600" />
              <h4 className="text-base font-bold text-stone-900">
                Dynamic Yield Pricing Optimizer
              </h4>
            </div>
            <Badge variant="gold" size="sm">
              Revenue Yield +14.2%
            </Badge>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Analyzes historical branch demand curves to automatically suggest peak-hour premiums and off-peak weekday discounts.
          </p>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-600">Saturday Peak (11 AM - 3 PM):</span>
              <strong className="text-amber-800 font-mono">+10% Surge Value</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Tuesday Afternoon Off-Peak:</span>
              <strong className="text-emerald-700 font-mono">-15% Client Magnet</strong>
            </div>
          </div>

          <Button
            variant={pricingOptimized ? "primary" : "gold"}
            className="w-full"
            onClick={handleOptimizePricing}
          >
            <Zap className="w-4 h-4 mr-1.5" />
            <span>{pricingOptimized ? "Yield Rules Active" : "Apply AI Yield Pricing Model"}</span>
          </Button>
        </Card>

        {/* Smart Schedule Balancer */}
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-600" />
              <h4 className="text-base font-bold text-stone-900">
                Smart Artisan Schedule Balancer
              </h4>
            </div>
            <Badge variant="purple" size="sm">
              Zero Idle Time
            </Badge>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Eliminates awkward gaps between balayage processing times by auto-slotting express blowouts for waiting chairs.
          </p>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-600">Discovered Double-Booking Windows:</span>
              <strong className="text-purple-800 font-mono">6 Slot Opportunities</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Estimated Extra Daily Revenue:</span>
              <strong className="text-emerald-700 font-mono">{formatCurrency(18500, selectedBranch.currency)}</strong>
            </div>
          </div>

          <Button
            variant={scheduleBalanced ? "primary" : "gold"}
            className="w-full"
            onClick={handleBalanceSchedule}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            <span>{scheduleBalanced ? "Schedule Optimized" : "Run Neural Schedule Balancer"}</span>
          </Button>
        </Card>
      </div>
    </div>
  );
}
