import { useState } from "react";
import type { CartItem } from "../types";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalPrice: number;
  tableName: string;
  submitting: boolean;
  onConfirm: (customerName?: string, notes?: string) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  totalPrice,
  tableName,
  submitting,
  onConfirm,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const formattedTotal =
    totalPrice >= 100
      ? `Rp ${totalPrice.toLocaleString("id-ID")}`
      : `$${totalPrice.toFixed(2)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto border border-surface-container-highest/60">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-highest/60">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Review Your Order</h3>
            <p className="text-xs text-primary font-semibold uppercase">{tableName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="my-4 divide-y divide-surface-container max-h-48 overflow-y-auto pr-1">
          {items.map((item) => {
            const formattedItemPrice =
              item.menuItem.price >= 100
                ? `Rp ${item.menuItem.price.toLocaleString("id-ID")}`
                : `$${item.menuItem.price.toFixed(2)}`;
            const formattedSubtotal =
              item.menuItem.price >= 100
                ? `Rp ${(item.quantity * item.menuItem.price).toLocaleString("id-ID")}`
                : `$${(item.quantity * item.menuItem.price).toFixed(2)}`;

            return (
              <div key={item.menuItem.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-on-surface">{item.menuItem.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {item.quantity} × {formattedItemPrice}
                  </p>
                </div>
                <span className="text-sm font-bold text-on-surface">
                  {formattedSubtotal}
                </span>
              </div>
            );
          })}
        </div>

        <div className="space-y-3 mb-5">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Customer Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Alex"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-surface-container-highest bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Order Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Less ice, no sugar"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-surface-container-highest bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-surface-container">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-on-surface-variant">Total Amount</span>
            <span className="text-xl font-bold text-primary">
              {formattedTotal}
            </span>
          </div>

          <button
            onClick={() => onConfirm(customerName, notes)}
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary via-[#0284c7] to-secondary text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 active:scale-[0.98]"
          >
            {submitting ? (
              <>
                <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Sending to Kitchen...</span>
              </>
            ) : (
              <span>Confirm & Order</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
