import { useEffect, useState } from "react";
import { formatCurrency } from "../utils/formatCurrency";
import QrisImage from "./QrisImage";
import OrderDetailModal from "./OrderDetailModal";
import CustomerNotificationCenter from "./CustomerNotificationCenter";
import type { useCustomerOrderNotifications } from "../hooks/useCustomerOrderNotifications";
import type { OrderOut } from "../types";

interface OrderSuccessProps {
  order: OrderOut;
  onNewOrder: () => void;
  qrisImageUrl: string;
  notifications: ReturnType<typeof useCustomerOrderNotifications>;
}

export default function OrderSuccess({ order: initialOrder, onNewOrder, qrisImageUrl, notifications }: OrderSuccessProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "unsupported" | "insecure"
  >(() => {
    if (typeof window === "undefined") return "unsupported";
    if (!window.isSecureContext) return "insecure";
    return "Notification" in window ? Notification.permission : "unsupported";
  });
  const {
    records,
    unreadCount,
    lastConfirmedOrder,
    requestedOrderId,
    clearRequestedOrder,
    markAllNotificationsSeen,
    markNotificationSeen,
  } = notifications;
  const order = records.find((record) => record.order.id === initialOrder.id)?.order ?? initialOrder;
  const selectedOrder = records.find((record) => record.order.id === selectedOrderId)?.order ?? null;
  const isQrisPending = order.payment_method === "qris" && !order.is_paid;

  const enablePaymentNotifications = async () => {
    if (!window.isSecureContext) {
      setNotificationPermission("insecure");
      return;
    }
    if (!("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    } catch {
      setNotificationPermission("denied");
    }
  };

  // The notification center can receive OS-notification clicks and show that order.
  useEffect(() => {
    if (requestedOrderId === null) return;
    setSelectedOrderId(requestedOrderId);
    markNotificationSeen(requestedOrderId);
    setShowOrderDetailModal(true);
    clearRequestedOrder();
  }, [requestedOrderId, clearRequestedOrder, markNotificationSeen]);

  const openNotificationCenter = () => {
    markAllNotificationsSeen();
    setShowNotificationCenter(true);
  };

  const openOrderDetail = (orderId: number) => {
    markNotificationSeen(orderId);
    setSelectedOrderId(orderId);
    setShowNotificationCenter(false);
    setShowOrderDetailModal(true);
  };

  const formattedTotal = formatCurrency(order.total_amount);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-8">
      <div className="relative w-full max-w-sm bg-surface-container-lowest rounded-3xl shadow-xl border border-surface-container-highest/80 p-6 text-center">
        <button
          type="button"
          onClick={openNotificationCenter}
          aria-label={unreadCount > 0 ? `${unreadCount} notifikasi baru` : "Lihat notifikasi pesanan"}
          title="Notifikasi dan detail pesanan"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>
          {unreadCount > 0 && (
            <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {lastConfirmedOrder && (
          <div
            role="status"
            aria-live="polite"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left text-emerald-900 shadow-sm"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
              ✓
            </span>
            <div>
              <p className="text-sm font-bold">Pembayaran QRIS dikonfirmasi</p>
              <p className="mt-0.5 text-xs text-emerald-800">
                Pembayaran pesanan #{lastConfirmedOrder.id} telah dikonfirmasi oleh kasir.
              </p>
              <button
                type="button"
                onClick={() => openOrderDetail(lastConfirmedOrder.id)}
                className="mt-2 text-xs font-bold text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
              >
                Lihat detail pesanan
              </button>
            </div>
          </div>
        )}

        {/* Status Indicator Icon */}
        {isQrisPending ? (
          <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-25 animate-ping" />
            <div className="relative w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center border-2 border-amber-300 shadow-md">
              <span className="text-2xl animate-pulse">⏳</span>
            </div>
          </div>
        ) : (
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm">
            <span className="text-3xl font-bold">✓</span>
          </div>
        )}

        {/* Heading */}
        <h2 className="text-xl font-bold text-on-surface mb-1">
          {isQrisPending
            ? "Menunggu Konfirmasi Kasir"
            : order.payment_method === "cash" && !order.is_paid
            ? "Pesanan Diterima!"
            : "Pembayaran Terkonfirmasi!"}
        </h2>

        <p className="text-xs text-outline mb-5 leading-relaxed">
          {isQrisPending
            ? "Kasir sedang memeriksa notifikasi dana masuk di aplikasi merchant. Layar akan otomatis terupdate begitu dikonfirmasi."
            : order.payment_method === "cash" && !order.is_paid
            ? "Pesanan Anda sudah masuk. Silakan lakukan pembayaran tunai di meja kasir."
            : `Pesanan #${order.id} telah diterima di dapur dan sedang diproses.`}
        </p>

        {/* Pending QRIS Action Banner */}
        {isQrisPending && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-900">Belum scan QRIS?</p>
                <p className="text-[11px] text-amber-700">Pastikan transfer nominal yang tepat.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-xs hover:bg-amber-700 active:scale-95 transition-all"
              >
                Buka QRIS
              </button>
            </div>
            {notificationPermission === "granted" ? (
              <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700" role="status">
                <span aria-hidden="true">✓</span> Notifikasi pembayaran aktif
              </p>
            ) : notificationPermission === "unsupported" ? (
              <p className="mt-3 text-[11px] text-amber-800">
                Browser ini tidak mendukung notifikasi. Status pembayaran tetap diperbarui di halaman ini.
              </p>
            ) : notificationPermission === "insecure" ? (
              <p className="mt-3 text-[11px] text-amber-800">
                Notifikasi browser membutuhkan koneksi HTTPS. Status pembayaran tetap diperbarui di halaman ini.
              </p>
            ) : notificationPermission === "denied" ? (
              <p className="mt-3 text-[11px] text-amber-800">
                Izin notifikasi ditolak. Anda bisa mengaktifkannya dari pengaturan situs di browser.
              </p>
            ) : (
              <button
                type="button"
                onClick={enablePaymentNotifications}
                className="mt-3 w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-100"
              >
                Aktifkan notifikasi pembayaran
              </button>
            )}
          </div>
        )}

        {/* Order Details Card */}
        <div className="bg-surface-container-low rounded-2xl p-4 mb-5 text-left border border-surface-container-highest">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-on-surface-variant">Nomor Pesanan</span>
            <span className="font-semibold text-on-surface">#{order.id}</span>
          </div>

          {order.table_name && (
            <div className="flex justify-between text-xs mb-2">
              <span className="text-on-surface-variant">Meja</span>
              <span className="font-semibold text-on-surface">
                {order.table_name}
              </span>
            </div>
          )}

          <div className="flex justify-between text-xs mb-2">
            <span className="text-on-surface-variant">Metode Bayar</span>
            <span className="font-semibold text-on-surface uppercase">
              {order.payment_method === "qris" ? "QRIS" : "Bayar di Kasir"}
            </span>
          </div>

          <div className="flex justify-between text-xs mb-2 items-center">
            <span className="text-on-surface-variant">Status Pembayaran</span>
            <span
              className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide ${
                order.is_paid
                  ? "bg-emerald-100 text-emerald-800"
                  : order.payment_method === "qris"
                  ? "bg-amber-100 text-amber-800 animate-pulse"
                  : "bg-sky-100 text-sky-800"
              }`}
            >
              {order.is_paid
                ? "LUNAS"
                : order.payment_method === "qris"
                ? "MENUNGGU KONFIRMASI"
                : "BELUM DIBAYAR"}
            </span>
          </div>

          <div className="border-t border-surface-container-highest my-2.5"></div>

          {order.items.map((item) => {
            const formattedItemSubtotal = formatCurrency(item.subtotal);

            return (
              <div key={item.id} className="flex justify-between text-xs mb-1.5">
                <span className="text-on-surface-variant">
                  {item.menu_item_name} × {item.quantity}
                </span>
                <span className="text-on-surface font-medium">
                  {formattedItemSubtotal}
                </span>
              </div>
            );
          })}

          <div className="border-t border-surface-container-highest my-2.5"></div>
          <div className="flex justify-between text-sm font-bold">
            <span className="text-on-surface">Total</span>
            <span className="text-primary">{formattedTotal}</span>
          </div>
        </div>

        {/* Buttons */}
        <button
          onClick={onNewOrder}
          className="w-full py-3.5 rounded-2xl bg-linear-to-r from-primary via-[#0284c7] to-secondary text-white font-bold transition-all shadow-md shadow-primary/20 active:scale-[0.98]"
        >
          Pesan Menu Lainnya
        </button>
      </div>

      {/* QRIS Re-open Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center">
            <h3 className="text-base font-bold text-slate-900 mb-1">Scan QRIS</h3>
            <p className="text-xs text-slate-500 mb-3">Total: <strong className="text-primary">{formattedTotal}</strong></p>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-4 flex justify-center">
              <QrisImage src={qrisImageUrl} alt="QRIS POS" className="w-56 h-auto object-contain rounded-xl" />
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {showOrderDetailModal && (
        selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setShowOrderDetailModal(false)} />
      )}

      {showNotificationCenter && (
        <CustomerNotificationCenter
          records={records}
          onClose={() => setShowNotificationCenter(false)}
          onSelectOrder={openOrderDetail}
        />
      )}
    </div>
  );
}
