import { useState } from "react";
import { formatCurrency } from "../utils/formatCurrency";
import QrisImage from "./QrisImage";
import type { CartItem, PaymentMethod } from "../types";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalPrice: number;
  tableName: string;
  qrisImageUrl: string;
  submitting: boolean;
  onConfirm: (customerName?: string, notes?: string, paymentMethod?: PaymentMethod) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  totalPrice,
  tableName,
  qrisImageUrl,
  submitting,
  onConfirm,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const formattedTotal = formatCurrency(totalPrice);

  const handleCopyTotal = () => {
    navigator.clipboard.writeText(totalPrice.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 max-h-[92vh] overflow-y-auto border border-surface-container-highest/60 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-highest/60">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Konfirmasi Pesanan</h3>
            <p className="text-xs text-primary font-semibold uppercase">{tableName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Order Items Summary */}
        <div className="my-4 divide-y divide-surface-container max-h-40 overflow-y-auto pr-1">
          {items.map((item) => {
            const formattedItemPrice = formatCurrency(item.menuItem.price);
            const formattedSubtotal = formatCurrency(item.quantity * item.menuItem.price);

            return (
              <div key={item.menuItem.id} className="py-2 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-on-surface">{item.menuItem.name}</p>
                  <p className="text-on-surface-variant">
                    {item.quantity} × {formattedItemPrice}
                  </p>
                </div>
                <span className="font-bold text-on-surface">
                  {formattedSubtotal}
                </span>
              </div>
            );
          })}
        </div>

        {/* Customer Details */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Nama Pemesan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Budi"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-surface-container-highest bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Catatan Pesanan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Es sedikit, tidak pakai gula"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-surface-container-highest bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-on-surface mb-2">
            Pilih Metode Pembayaran
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                paymentMethod === "cash"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                  : "border-surface-container-highest bg-surface-container-low hover:bg-surface-container"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-lg">💵</span>
                {paymentMethod === "cash" && (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">Bayar di Kasir</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  Tunai / Kartu di kasir
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("qris")}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                paymentMethod === "qris"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                  : "border-surface-container-highest bg-surface-container-low hover:bg-surface-container"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-lg">📱</span>
                {paymentMethod === "qris" && (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">QRIS</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  Scan m-Banking / e-Wallet
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* QRIS View */}
        {paymentMethod === "qris" && (
          <div className="mb-4 p-4 rounded-2xl border border-rose-200/80 bg-rose-50/50 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xs font-bold text-rose-900">Scan QRIS untuk Bayar</span>
              <button
                type="button"
                onClick={handleCopyTotal}
                className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 underline flex items-center gap-1"
              >
                {copied ? "✓ Tersalin!" : "Salin Nominal"}
              </button>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-rose-200 shadow-sm my-1 flex justify-center items-center">
              <QrisImage src={qrisImageUrl} alt="QRIS POS" className="w-48 h-auto object-contain rounded-lg" />
            </div>

            <p className="text-[11px] text-slate-600 mt-2 text-center leading-relaxed">
              1. Buka aplikasi m-Banking / e-Wallet (BCA, GoPay, OVO, DANA, dll).<br />
              2. Scan QRIS di atas & bayar tepat <strong>{formattedTotal}</strong>.<br />
              3. Setelah transfer berhasil, klik <strong>"Saya Sudah Bayar"</strong> di bawah.
            </p>
          </div>
        )}

        {paymentMethod === "cash" && (
          <div className="mb-4 p-3 rounded-2xl bg-sky-50/80 border border-sky-200/60 text-sky-900 text-xs">
            <p className="font-semibold mb-0.5">ℹ️ Pembayaran di Kasir</p>
            <p className="text-[11px] text-sky-800">
              Pesanan Anda akan langsung dikirim ke kasir. Silakan menuju meja kasir untuk menyelesaikan pembayaran.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-surface-container mt-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-on-surface-variant">Total Pembayaran</span>
            <span className="text-xl font-bold text-primary">
              {formattedTotal}
            </span>
          </div>

          <button
            onClick={() => onConfirm(customerName, notes, paymentMethod)}
            disabled={submitting}
            className={`w-full py-3.5 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 active:scale-[0.98] ${
              paymentMethod === "qris"
                ? "bg-linear-to-r from-rose-600 via-rose-500 to-amber-600 shadow-rose-600/25"
                : "bg-linear-to-r from-primary via-[#0284c7] to-secondary shadow-primary/25"
            }`}
          >
            {submitting ? (
              <>
                <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Memproses Pesanan...</span>
              </>
            ) : paymentMethod === "qris" ? (
              <span>Saya Sudah Bayar (Konfirmasi QRIS)</span>
            ) : (
              <span>Pesan Sekarang (Bayar di Kasir)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
