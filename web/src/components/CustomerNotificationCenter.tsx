import { formatCurrency } from "../utils/formatCurrency";
import type { CustomerOrderRecord } from "../hooks/useCustomerOrderNotifications";

interface CustomerNotificationCenterProps {
	records: CustomerOrderRecord[];
	onClose: () => void;
	onSelectOrder: (orderId: number) => void;
}

export default function CustomerNotificationCenter({ records, onClose, onSelectOrder }: CustomerNotificationCenterProps) {
	return (
		<div
			className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
			role="presentation"
			onClick={onClose}
		>
			<section
				role="dialog"
				aria-modal="true"
				aria-labelledby="customer-notifications-title"
				className="max-h-[85vh] w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-2xl"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
					<div>
						<h2 id="customer-notifications-title" className="text-lg font-extrabold text-slate-900">Notifikasi Pesanan</h2>
						<p className="mt-0.5 text-xs text-slate-500">Pembaruan pembayaran dan detail pesanan Anda</p>
					</div>
					<button type="button" onClick={onClose} aria-label="Tutup notifikasi" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">
						<span aria-hidden="true">✕</span>
					</button>
				</div>

				<div className="max-h-[65vh] space-y-2 overflow-y-auto p-4">
					{records.length === 0 ? (
						<p className="py-10 text-center text-sm text-slate-500">Belum ada pesanan di sesi ini.</p>
					) : records.map(({ order, paymentNotificationSeen }) => (
						<button
							key={order.id}
							type="button"
							onClick={() => onSelectOrder(order.id)}
							className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 p-3.5 text-left transition-colors hover:border-primary/30 hover:bg-slate-50"
						>
							<span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${order.is_paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`} aria-hidden="true">
								{order.is_paid ? "✓" : "◷"}
							</span>
							<span className="min-w-0 flex-1">
								<span className="flex items-center justify-between gap-2">
									<span className="text-sm font-bold text-slate-900">Pesanan #{order.id}</span>
									{order.is_paid && !paymentNotificationSeen && <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" aria-label="Belum dibaca" />}
								</span>
								<span className={`mt-1 block text-xs font-semibold ${order.is_paid ? "text-emerald-700" : "text-amber-700"}`}>
									{order.payment_method === "qris"
										? order.is_paid ? "Pembayaran QRIS dikonfirmasi" : "Menunggu konfirmasi QRIS"
										: order.is_paid ? "Pembayaran dikonfirmasi" : "Menunggu pembayaran di kasir"}
								</span>
								<span className="mt-1 block truncate text-xs text-slate-500">
									{order.table_name ? `${order.table_name} · ` : ""}{order.items.map((item) => `${item.menu_item_name} ×${item.quantity}`).join(", ")}
								</span>
							</span>
							<span className="shrink-0 pt-0.5 text-xs font-bold text-slate-800">{formatCurrency(order.total_amount)}</span>
						</button>
					))}
				</div>
			</section>
		</div>
	);
}
