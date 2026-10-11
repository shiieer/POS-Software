import { formatCurrency } from "../utils/formatCurrency";
import type { OrderOut } from "../types";

interface OrderDetailModalProps {
	order: OrderOut;
	onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
	return (
		<div
			className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
			role="presentation"
			onClick={onClose}
		>
			<section
				role="dialog"
				aria-modal="true"
				aria-labelledby="order-detail-title"
				className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-2xl"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="mb-4 flex items-start justify-between gap-3">
					<div>
					<p className={`text-[11px] font-bold uppercase tracking-wider ${order.is_paid ? "text-emerald-700" : "text-amber-700"}`}>
						{order.is_paid ? "Pembayaran dikonfirmasi" : "Status pesanan"}
					</p>
					<h2 id="order-detail-title" className="mt-1 text-xl font-extrabold text-slate-900">
						Detail Pesanan #{order.id}
					</h2>
				</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Tutup detail pesanan"
						className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
					>
						<span aria-hidden="true">✕</span>
					</button>
				</div>

				<p className={`mb-4 rounded-2xl px-3.5 py-3 text-sm leading-relaxed ${order.is_paid ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
					{order.is_paid
						? "Kasir sudah mengonfirmasi pembayaran QRIS Anda. Pesanan sedang diproses."
						: "Pesanan Anda diterima dan pembayaran QRIS masih menunggu konfirmasi kasir."}
				</p>

				<div className="mb-4 space-y-2 rounded-2xl bg-slate-50 p-3.5 text-sm">
					<div className="flex justify-between gap-4">
						<span className="text-slate-500">Nomor pesanan</span>
						<span className="font-bold text-slate-900">#{order.id}</span>
					</div>
					{order.table_name && (
						<div className="flex justify-between gap-4">
							<span className="text-slate-500">Meja</span>
							<span className="font-semibold text-slate-900">{order.table_name}</span>
						</div>
					)}
					<div className="flex justify-between gap-4">
						<span className="text-slate-500">Pembayaran</span>
						<span className={`font-bold ${order.is_paid ? "text-emerald-700" : "text-amber-700"}`}>
							QRIS · {order.is_paid ? "Lunas" : "Menunggu konfirmasi"}
						</span>
					</div>
				</div>

				<div className="mb-4">
					<h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Item pesanan</h3>
					<div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 px-3.5">
						{order.items.map((item) => (
							<div key={item.id} className="flex justify-between gap-4 py-3 text-sm">
								<span className="text-slate-700">
									{item.menu_item_name} <span className="text-slate-400">× {item.quantity}</span>
									{item.notes && <span className="mt-0.5 block text-xs text-slate-500">{item.notes}</span>}
								</span>
								<span className="shrink-0 font-semibold text-slate-900">{formatCurrency(item.subtotal)}</span>
							</div>
						))}
					</div>
				</div>

				<div className="flex items-center justify-between border-t border-slate-200 pt-3">
					<span className="font-bold text-slate-900">Total</span>
					<span className="text-lg font-extrabold text-primary">{formatCurrency(order.total_amount)}</span>
				</div>
			</section>
		</div>
	);
}
