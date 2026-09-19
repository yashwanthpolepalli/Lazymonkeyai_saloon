"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Megaphone,
  MessageSquare,
  Image as ImageIcon,
  Tag,
  UserCheck,
  Send,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export function MarketingModule() {
  const { campaigns, coupons, selectedBranch, activeSubTab, addToast } = useSalon();

  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignChannel, setCampaignChannel] = useState<"WhatsApp" | "SMS" | "Email">("WhatsApp");
  const [campaignSegment, setCampaignSegment] = useState("VIP High Spender");

  // AI Ad Poster Generator state
  const [adTheme, setAdTheme] = useState("Autumn French Balayage Glow");
  const [adGenerated, setAdGenerated] = useState(false);

  const handleLaunchCampaign = () => {
    addToast("success", "Campaign Dispatched", `Sent ${campaignChannel} broadcast to 1,240 clients in ${campaignSegment}.`);
    setCampaignTitle("");
  };

  const handleGenerateAIAd = () => {
    setAdGenerated(true);
    addToast("success", "AI Copy Generated", "Haute marketing copy and poster creative ready!");
  };

  return (
    <div className="space-y-6">
      {/* Subtab 1: Campaigns */}
      {(activeSubTab === "campaigns" || activeSubTab === "overview") && (
        <div className="space-y-6">
          {/* Quick Launch Broadcast */}
          <Card variant="luxury" className="p-5 border-amber-900/20 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-stone-900">
                  Launch Omnichannel VIP Campaign
                </h3>
              </div>
              <Badge variant="gold" size="sm">
                WhatsApp & SMS API Ready
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-stone-600 mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="e.g. Royal Weekend Blowout Pass"
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1">Channel</label>
                <select
                  value={campaignChannel}
                  onChange={(e) => setCampaignChannel(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="WhatsApp">WhatsApp Business API</option>
                  <option value="SMS">Priority SMS Gateway</option>
                  <option value="Email">Luxury HTML Email</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1">Target Segment</label>
                <select
                  value={campaignSegment}
                  onChange={(e) => setCampaignSegment(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="VIP High Spender">VIP High Spender (LTV &gt; ₹100k)</option>
                  <option value="Regular Loyalist">Regular Loyalist</option>
                  <option value="At Risk">At Risk (No visits in 45 days)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="gold" size="sm" onClick={handleLaunchCampaign}>
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span>Broadcast to 1,240 Clients</span>
              </Button>
            </div>
          </Card>

          {/* Active Campaigns List */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-stone-900">Active Omnichannel Broadcasts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((cmp) => (
                <Card key={cmp.id} className="p-4 border-stone-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-stone-900">{cmp.title}</h5>
                      <span className="text-[11px] text-stone-500 font-mono">
                        Channel: {cmp.channel} • Target: {cmp.targetSegment}
                      </span>
                    </div>
                    <Badge variant="success" size="sm">
                      {cmp.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">Opened</span>
                      <strong className="text-stone-900 font-mono">{cmp.openedRate}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">Conversions</span>
                      <strong className="text-stone-900 font-mono">{cmp.conversions}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">Revenue</span>
                      <strong className="text-emerald-700 font-mono">
                        {formatCurrency(cmp.revenueGenerated, selectedBranch.currency)}
                      </strong>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: AI Ad Posters */}
      {activeSubTab === "ai_posters" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <CardTitle>AI Social Creative & Copy Generator</CardTitle>
              <p className="text-xs text-stone-500 mt-0.5">
                Generate high-converting luxury Instagram & WhatsApp copy and visual layouts.
              </p>
            </div>
            <Button variant="gold" size="sm" onClick={handleGenerateAIAd}>
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              <span>Generate Creative</span>
            </Button>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-stone-700 uppercase">Campaign Theme</label>
            <input
              type="text"
              value={adTheme}
              onChange={(e) => setAdTheme(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          {adGenerated && (
            <div className="p-4 rounded-xl bg-stone-900 text-stone-100 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-400 font-mono uppercase">Generated Instagram Copy</span>
                <Badge variant="gold" size="sm">
                  Ready to Post
                </Badge>
              </div>
              <p className="text-xs text-stone-200 leading-relaxed ">
                &ldquo;Where Parisian light kisses bespoke hair geometry. Elevate your autumn glow with our master French Balayage ritual at {selectedBranch.name}. Reserve your private suite session today. Use code <strong>AUTUMNROYAL20</strong> for 20% privilege.&rdquo;
              </p>
              <div className="text-[11px] text-amber-300 font-mono">
                #HauteCoutureBeauty #{selectedBranch.city}Salon #LazyMonkeyAI #LuxuryHair
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Subtab 3: Coupons */}
      {activeSubTab === "coupons" && (
        <Card className="p-6 space-y-4">
          <CardTitle>Promo Codes & Privilege Vouchers</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coupons.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                    {c.code}
                  </span>
                  <Badge variant="gold" size="sm">
                    {c.discountPercent ? `${c.discountPercent}% OFF` : `₹${c.flatDiscount} OFF`}
                  </Badge>
                </div>
                <p className="text-xs text-stone-500">
                  Min spend: {formatCurrency(c.minSpend, selectedBranch.currency)} • Max Discount: ₹{c.maxDiscount || 0}
                </p>
                <div className="text-[11px] text-stone-400 font-mono">
                  Used: {c.timesUsed} / {c.maxUsage} times • Valid until {c.validUntil}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
