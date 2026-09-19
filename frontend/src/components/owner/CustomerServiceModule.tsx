"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CustomerTicket } from "@/types";
import {
  Inbox,
  AlertTriangle,
  Star,
  Send,
  LifeBuoy,
  Clock,
  User,
  CheckCircle2,
} from "lucide-react";

export function CustomerServiceModule() {
  const { tickets, selectedBranch, replyToTicket } = useSalon();

  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || "");
  const [replyText, setReplyText] = useState("");

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleSendReply = () => {
    if (!replyText || !selectedTicket) return;
    replyToTicket(selectedTicket.id, replyText, "manager");
    setReplyText("");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Ticket Queue */}
        <Card className="p-5 lg:col-span-1 border-stone-200 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
              <Inbox className="w-4 h-4 text-amber-600" />
              <span>Unified Ticket Desk ({tickets.length})</span>
            </h3>
          </div>

          <div className="space-y-2">
            {tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? "bg-amber-50/40 border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
                      : "bg-white border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-800">{t.ticketNumber}</span>
                    <Badge variant={t.status === "resolved" ? "success" : "warning"} size="sm">
                      {t.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="font-semibold text-xs text-stone-900 truncate">{t.subject}</div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span>{t.customerName}</span>
                    <span className="font-mono text-amber-700 font-medium">SLA: {t.slaMinutesRemaining}m</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Active Ticket Conversation Thread */}
        {selectedTicket && (
          <Card variant="luxury" className="p-6 lg:col-span-2 border-stone-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {selectedTicket.ticketNumber}
                  </span>
                  <Badge variant="gold" size="sm">
                    {selectedTicket.category}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-stone-900 mt-1">
                  {selectedTicket.subject}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Client: {selectedTicket.customerName} ({selectedTicket.customerPhone})
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-stone-400 block">Assigned Handler</span>
                <strong className="text-xs text-stone-800">{selectedTicket.assignedTo}</strong>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {selectedTicket.messages.map((msg, i) => {
                const isCust = msg.role === "customer";
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-xs space-y-1 ${
                      isCust
                        ? "bg-stone-100 text-stone-800 mr-8"
                        : "bg-stone-900 text-stone-100 ml-8 border border-stone-800"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-70">
                      <span className="font-semibold">{msg.sender} ({msg.role})</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                );
              })}
            </div>

            {/* Reply Bar */}
            <div className="flex items-center gap-2 pt-3 border-t border-stone-200">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type response to client..."
                className="flex-1 text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendReply();
                }}
              />
              <Button variant="gold" size="sm" onClick={handleSendReply}>
                <Send className="w-3.5 h-3.5 mr-1" />
                <span>Reply</span>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
