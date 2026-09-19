"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  Layers,
  ArrowLeftRight,
  PlusCircle,
  TrendingDown,
} from "lucide-react";

export function InventoryModule() {
  const {
    inventory,
    branches,
    selectedBranch,
    activeSubTab,
    restockInventory,
    transferStock,
  } = useSalon();

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(inventory[0]?.id || "");
  const [restockQty, setRestockQty] = useState<number>(500);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTargetBranch, setTransferTargetBranch] = useState(
    branches.find((b) => b.id !== selectedBranch.id)?.id || branches[0].id
  );
  const [transferQty, setTransferQty] = useState<number>(100);

  const handleRestock = () => {
    restockInventory(selectedProductId, selectedBranch.id, restockQty);
    setIsRestockModalOpen(false);
  };

  const handleTransfer = () => {
    transferStock(selectedProductId, selectedBranch.id, transferTargetBranch, transferQty);
    setIsTransferModalOpen(false);
  };

  const lowStockItems = inventory.filter((item) => {
    const branchStock = item.stocksByBranch[selectedBranch.id];
    return branchStock && branchStock.current <= branchStock.minThreshold;
  });

  return (
    <div className="space-y-6">
      {/* Top Inventory Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-stone-900">
            Multi-Branch Inventory & Formula Dispensary
          </h3>
          <p className="text-xs text-stone-500">
            Managing warehouse & retail stocks for <strong>{selectedBranch.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTransferModalOpen(true)}
          >
            <ArrowLeftRight className="w-4 h-4 mr-1.5" />
            <span>Inter-Branch Transfer</span>
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => setIsRestockModalOpen(true)}
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Create Purchase Order</span>
          </Button>
        </div>
      </div>

      {/* Subtab: Low Stock Alerts */}
      {activeSubTab === "low_stock" || lowStockItems.length > 0 ? (
        lowStockItems.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 text-rose-900 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Critical Low Stock Threshold Alerts ({lowStockItems.length} Products)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {lowStockItems.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 rounded-xl bg-white border border-rose-300 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-stone-900">{prod.name}</strong>
                    <div className="text-rose-700 font-mono mt-0.5">
                      Current: {prod.stocksByBranch[selectedBranch.id]?.current} {prod.unit} (Threshold: {prod.stocksByBranch[selectedBranch.id]?.minThreshold})
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="gold"
                    onClick={() => {
                      setSelectedProductId(prod.id);
                      setIsRestockModalOpen(true);
                    }}
                  >
                    Restock Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )
      ) : null}

      {/* Main Stock Registry Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <CardTitle>Active Stock Roster & Valuations</CardTitle>
          <Badge variant="gold" size="sm">
            {inventory.length} SKUs Tracked
          </Badge>
        </div>

        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500 uppercase font-mono text-[10px]">
              <th className="py-2.5">Product / Brand</th>
              <th className="py-2.5">SKU</th>
              <th className="py-2.5">Category</th>
              <th className="py-2.5 text-center">Branch Stock</th>
              <th className="py-2.5 text-right">Cost Price</th>
              <th className="py-2.5 text-right">Retail Price</th>
              <th className="py-2.5 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-mono">
            {inventory.map((prod) => {
              const currentQty = prod.stocksByBranch[selectedBranch.id]?.current || 0;
              const threshold = prod.stocksByBranch[selectedBranch.id]?.minThreshold || 100;
              const isLow = currentQty <= threshold;

              return (
                <tr key={prod.id}>
                  <td className="py-3 font-sans">
                    <strong className="text-stone-900 block">{prod.name}</strong>
                    <span className="text-[10px] text-stone-400">{prod.brand}</span>
                  </td>
                  <td className="py-3 text-stone-600">{prod.sku}</td>
                  <td className="py-3 font-sans text-stone-600">{prod.category}</td>
                  <td className="py-3 text-center font-bold text-stone-900">
                    {currentQty} {prod.unit}
                  </td>
                  <td className="py-3 text-right text-stone-600">
                    {formatCurrency(prod.costPrice, selectedBranch.currency)}
                  </td>
                  <td className="py-3 text-right font-bold text-stone-900">
                    {formatCurrency(prod.retailPrice, selectedBranch.currency)}
                  </td>
                  <td className="py-3 text-center font-sans">
                    <Badge variant={isLow ? "danger" : "success"} size="sm">
                      {isLow ? "Low Stock" : "Optimal"}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Restock PO Modal */}
      <Modal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        title="Purchase Order Stock Replenishment"
        subtitle="Direct supply order from certified luxury distributor"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Select Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            >
              {inventory.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.brand})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Restock Quantity Units</label>
            <input
              type="number"
              value={restockQty}
              onChange={(e) => setRestockQty(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <Button variant="gold" className="w-full" onClick={handleRestock}>
            Issue Purchase Order & Replenish
          </Button>
        </div>
      </Modal>

      {/* Inter-Branch Transfer Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Inter-Branch Inventory Transfer"
        subtitle="Transfer formulas between atelier locations"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Product to Transfer</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            >
              {inventory.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Destination Branch</label>
            <select
              value={transferTargetBranch}
              onChange={(e) => setTransferTargetBranch(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            >
              {branches
                .filter((b) => b.id !== selectedBranch.id)
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Transfer Quantity</label>
            <input
              type="number"
              value={transferQty}
              onChange={(e) => setTransferQty(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <Button variant="gold" className="w-full" onClick={handleTransfer}>
            Execute Inter-Branch Transfer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
