"use client";

import React, { useState, useMemo } from "react";
import { useSalon } from "@/context/SalonContext";
import { formatCurrency } from "@/lib/utils";
import { Service, InventoryProduct, SplitPayment, Invoice } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  ShoppingBag,
  Plus,
  Trash2,
  Receipt,
  User,
  CreditCard,
  Wallet,
  Smartphone,
  Banknote,
  CheckCircle2,
  Printer,
  Sparkles,
  Scissors,
  Package,
} from "lucide-react";

export function POSModule() {
  const {
    selectedBranch,
    customers,
    filteredServices,
    inventory,
    filteredStylists,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    processPOSCheckout,
    invoices,
    activeSubTab,
  } = useSalon();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || "");
  const [activeCatalogTab, setActiveCatalogTab] = useState<"services" | "retail">("services");
  const [selectedStylistId, setSelectedStylistId] = useState<string>(filteredStylists[0]?.id || "");

  // Split payment amounts
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [upiAmount, setUpiAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [walletAmount, setWalletAmount] = useState<number>(0);

  // Invoice preview modal
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [latestInvoice, setLatestInvoice] = useState<Invoice | null>(null);

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || customers[0];
  }, [customers, selectedCustomerId]);

  const assignedStylist = useMemo(() => {
    return filteredStylists.find((s) => s.id === selectedStylistId) || filteredStylists[0];
  }, [filteredStylists, selectedStylistId]);

  // Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = Math.round(subtotal * selectedBranch.taxRate * 100) / 100;
  const finalTotal = subtotal + taxAmount;

  const totalPaid = cashAmount + upiAmount + cardAmount + walletAmount;
  const remainingDue = Math.max(0, finalTotal - totalPaid);

  // Add service to cart
  const handleAddServiceToCart = (service: Service) => {
    addToCart({
      id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      serviceId: service.id,
      type: "service",
      name: service.name,
      category: service.categoryName,
      price: service.basePrice,
      quantity: 1,
      stylistId: assignedStylist.id,
      stylistName: assignedStylist.name,
    });
  };

  // Add retail product to cart
  const handleAddProductToCart = (product: InventoryProduct) => {
    addToCart({
      id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      productId: product.id,
      type: "product",
      name: product.name,
      category: product.category,
      price: product.retailPrice,
      quantity: 1,
      stylistId: assignedStylist.id,
      stylistName: assignedStylist.name,
    });
  };

  // Auto-fill full payment with single method
  const handlePayFullWith = (method: "card" | "upi" | "cash" | "wallet") => {
    setCashAmount(0);
    setUpiAmount(0);
    setCardAmount(0);
    setWalletAmount(0);

    if (method === "card") setCardAmount(finalTotal);
    if (method === "upi") setUpiAmount(finalTotal);
    if (method === "cash") setCashAmount(finalTotal);
    if (method === "wallet") setWalletAmount(Math.min(selectedCustomer.walletBalance, finalTotal));
  };

  // Process Checkout
  const handleCheckout = () => {
    if (cart.length === 0) return;

    const payments: SplitPayment[] = [];
    if (cashAmount > 0) payments.push({ method: "cash", amount: cashAmount });
    if (upiAmount > 0) payments.push({ method: "upi", amount: upiAmount });
    if (cardAmount > 0) payments.push({ method: "card", amount: cardAmount });
    if (walletAmount > 0) payments.push({ method: "wallet", amount: walletAmount });

    if (payments.length === 0) {
      payments.push({ method: "card", amount: finalTotal });
    }

    const inv = processPOSCheckout(selectedCustomer.id, payments);
    setLatestInvoice(inv);
    setIsInvoiceModalOpen(true);

    // Reset payment fields
    setCashAmount(0);
    setUpiAmount(0);
    setCardAmount(0);
    setWalletAmount(0);
  };

  // Filter retail products available at this branch
  const retailProducts = inventory.filter((p) => p.isRetail);

  return (
    <div className="space-y-6">
      {/* Subtab conditional display */}
      {activeSubTab === "invoices" || activeSubTab === "saleshistory" ? (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="text-base font-semibold text-stone-900">
              Sales History & Invoices Register ({selectedBranch.name})
            </h3>
            <Badge variant="gold" size="sm">
              {invoices.length} Invoices Generated
            </Badge>
          </div>

          <div className="space-y-3">
            {invoices.length > 0 ? (
              invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 rounded-xl border border-stone-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-800">{inv.invoiceNumber}</span>
                      <Badge variant="success" size="sm">
                        PAID
                      </Badge>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      Customer: <strong>{inv.customerName}</strong> • Cashier: {inv.cashierName}
                    </p>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      {inv.items.map((it) => it.name).join(", ")}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1">
                    <span className="text-base font-bold text-stone-900">
                      {formatCurrency(inv.finalTotal, selectedBranch.currency)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLatestInvoice(inv);
                        setIsInvoiceModalOpen(true);
                      }}
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      <span>Print Receipt</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500 py-6 text-center">No invoices generated in this session yet.</p>
            )}
          </div>
        </Card>
      ) : (
        /* Default: Fast New Sale POS Cashier Screen */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left 2 Cols: Catalog & Customer Selector */}
          <div className="lg:col-span-2 space-y-4">
            {/* Customer & Stylist Header Ribbon */}
            <div className="p-4 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Selector */}
              <div>
                <label className="block text-[10px] uppercase font-mono text-amber-400 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>Select Billing Customer</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-stone-950 text-stone-100 border border-stone-800 focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - {c.segment}
                    </option>
                  ))}
                </select>
                {selectedCustomer && (
                  <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-2">
                    <span>
                      Wallet: <strong className="text-emerald-400 font-mono">{formatCurrency(selectedCustomer.walletBalance, selectedBranch.currency)}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Loyalty: <strong className="text-purple-400 font-mono">{selectedCustomer.loyaltyPoints} pts</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Commission Stylist Selector */}
              <div>
                <label className="block text-[10px] uppercase font-mono text-amber-400 mb-1 flex items-center gap-1">
                  <Scissors className="w-3 h-3" />
                  <span>Attributed Stylist (Commission)</span>
                </label>
                <select
                  value={selectedStylistId}
                  onChange={(e) => setSelectedStylistId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-stone-950 text-stone-100 border border-stone-800 focus:outline-none"
                >
                  {filteredStylists.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.tier} • {Math.round(st.commissionRate * 100)}% comm)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-400 mt-2">
                  Commission automatically logged in HRMS ledger.
                </p>
              </div>
            </div>

            {/* Catalog Tabs & Items Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                <button
                  onClick={() => setActiveCatalogTab("services")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                    activeCatalogTab === "services"
                      ? "bg-stone-900 text-stone-100"
                      : "bg-stone-100 text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Salon Services ({filteredServices.length})</span>
                </button>
                <button
                  onClick={() => setActiveCatalogTab("retail")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                    activeCatalogTab === "retail"
                      ? "bg-stone-900 text-stone-100"
                      : "bg-stone-100 text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Retail Products ({retailProducts.length})</span>
                </button>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                {activeCatalogTab === "services"
                  ? filteredServices.map((service) => (
                      <Card
                        key={service.id}
                        hoverable
                        onClick={() => handleAddServiceToCart(service)}
                        className="p-3.5 border-stone-200 hover:border-amber-400 cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-stone-900 truncate">
                            {service.name}
                          </h4>
                          <span className="text-[10px] text-stone-500 block mt-0.5">
                            {service.categoryName} • {service.durationMinutes}m
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-xs font-bold text-stone-900 block">
                            {formatCurrency(service.basePrice, selectedBranch.currency)}
                          </span>
                          <span className="text-[10px] text-amber-700 font-semibold">+ Add</span>
                        </div>
                      </Card>
                    ))
                  : retailProducts.map((prod) => (
                      <Card
                        key={prod.id}
                        hoverable
                        onClick={() => handleAddProductToCart(prod)}
                        className="p-3.5 border-stone-200 hover:border-amber-400 cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-stone-900 truncate">
                            {prod.name}
                          </h4>
                          <span className="text-[10px] text-stone-500 block mt-0.5">
                            {prod.brand} • Stock: {prod.stocksByBranch[selectedBranch.id]?.current || 0} {prod.unit}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-xs font-bold text-stone-900 block">
                            {formatCurrency(prod.retailPrice, selectedBranch.currency)}
                          </span>
                          <span className="text-[10px] text-amber-700 font-semibold">+ Add</span>
                        </div>
                      </Card>
                    ))}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Live POS Cart & Split Payments */}
          <div className="lg:col-span-1 space-y-4">
            <Card variant="luxury" className="p-5 space-y-4 border-amber-900/20">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-semibold text-stone-900">
                    POS Register Basket
                  </h4>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-white border border-stone-200 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-medium text-stone-900 truncate">{item.name}</div>
                        <div className="text-[10px] text-stone-500">
                          {item.stylistName ? `Artisan: ${item.stylistName}` : item.category}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-stone-900">
                          {formatCurrency(item.price * item.quantity, selectedBranch.currency)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-stone-400">
                    Cart is empty. Click any service or product on the left to add.
                  </div>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(subtotal, selectedBranch.currency)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Tax & GST ({Math.round(selectedBranch.taxRate * 100)}%)</span>
                  <span className="font-mono">+{formatCurrency(taxAmount, selectedBranch.currency)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total Amount Due</span>
                  <span>{formatCurrency(finalTotal, selectedBranch.currency)}</span>
                </div>
              </div>

              {/* Split Payment Controls */}
              {cart.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-stone-800 uppercase">
                      Split Payment Engine
                    </label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePayFullWith("card")}
                        className="text-[10px] px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 cursor-pointer font-mono"
                      >
                        All Card
                      </button>
                      <button
                        onClick={() => handlePayFullWith("upi")}
                        className="text-[10px] px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 cursor-pointer font-mono"
                      >
                        All UPI
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-500 block">Card</span>
                      <input
                        type="number"
                        value={cardAmount || ""}
                        onChange={(e) => setCardAmount(Number(e.target.value))}
                        placeholder="0"
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block">UPI / QR</span>
                      <input
                        type="number"
                        value={upiAmount || ""}
                        onChange={(e) => setUpiAmount(Number(e.target.value))}
                        placeholder="0"
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block">Cash</span>
                      <input
                        type="number"
                        value={cashAmount || ""}
                        onChange={(e) => setCashAmount(Number(e.target.value))}
                        placeholder="0"
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block">Wallet</span>
                      <input
                        type="number"
                        value={walletAmount || ""}
                        onChange={(e) => setWalletAmount(Number(e.target.value))}
                        placeholder="0"
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-stone-500">Remaining Balance:</span>
                    <span
                      className={`font-mono font-bold ${
                        remainingDue === 0 ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      {formatCurrency(remainingDue, selectedBranch.currency)}
                    </span>
                  </div>

                  <Button
                    variant="gold"
                    className="w-full mt-2"
                    onClick={handleCheckout}
                  >
                    <span>Complete Sale & Print Invoice</span>
                    <CheckCircle2 className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Invoice Modal Preview */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        maxWidth="xl"
      >
        {latestInvoice && (
          <div className="space-y-5 p-2 print:p-0">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-4">
              <div>
                <span className="text-[10px] text-amber-700 font-mono tracking-widest uppercase">
                  TAX INVOICE & RECEIPT
                </span>
                <h3 className="text-lg font-bold text-stone-900">
                  {latestInvoice.branchName}
                </h3>
                <p className="text-xs text-stone-500">{selectedBranch.address}</p>
                <p className="text-xs text-stone-500">GSTIN / Tax ID: 27AABCL8890C1Z4</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-bold text-amber-800 block">
                  {latestInvoice.invoiceNumber}
                </span>
                <span className="text-xs text-stone-500">
                  {new Date(latestInvoice.date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Billed To */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div>
                <span className="text-stone-400 text-[10px] uppercase block">Billed To</span>
                <strong className="text-stone-900">{latestInvoice.customerName}</strong>
                <div className="text-stone-500">{latestInvoice.customerPhone}</div>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] uppercase block">Cashier & Terminal</span>
                <strong className="text-stone-900">{latestInvoice.cashierName}</strong>
                <div className="text-stone-500">POS Station #01</div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase font-mono text-[10px]">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {latestInvoice.items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-2 font-sans text-stone-900 font-medium">
                      {it.name}
                      {it.stylistName && (
                        <span className="text-[10px] text-stone-400 block font-sans">
                          Artisan: {it.stylistName}
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-center text-stone-600">{it.quantity}</td>
                    <td className="py-2 text-right text-stone-600">
                      {formatCurrency(it.price, selectedBranch.currency)}
                    </td>
                    <td className="py-2 text-right font-bold text-stone-900">
                      {formatCurrency(it.price * it.quantity, selectedBranch.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals & Payments */}
            <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(latestInvoice.subtotal, selectedBranch.currency)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>GST Tax</span>
                <span className="font-mono">+{formatCurrency(latestInvoice.taxTotal, selectedBranch.currency)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Grand Total</span>
                <span>{formatCurrency(latestInvoice.finalTotal, selectedBranch.currency)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
              <span className="font-semibold">Payments Received: </span>
              {latestInvoice.payments.map((p) => `${p.method.toUpperCase()}: ${formatCurrency(p.amount, selectedBranch.currency)}`).join(" | ")}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4 mr-1.5" />
                <span>Print Bill</span>
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={() => setIsInvoiceModalOpen(false)}
              >
                Close Register
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
