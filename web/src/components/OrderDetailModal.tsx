import { formatCurrency } from "../utils/formatCurrency";
import type { OrderOut } from "../types";
import { useEffect, useRef, useState } from "react";

interface Props {
	order: OrderOut;
	onClose: () => void;
}

const KITCHEN_STATUS: Record<string, { label: string; bg: string; text: string; dot: string }> = {
	pending:   { label: "Menunggu diproses",  bg: "bg-amber-50",   text: "text-amber-900",   dot: "bg-amber-400 animate-pulse" },
	preparing: { label: "Sedang diproses ☕", bg: "bg-indigo-50",  text: "text-indigo-900",  dot: "bg-indigo-500 animate-pulse" },
	ready:     { label: "Siap diambil 🎉",    bg: "bg-emerald-50", text: "text-emerald-900", dot: "bg-emerald-500" },
	served:    { label: "Telah disajikan ✓",  bg: "bg-slate-50",   text: "text-slate-700",   dot: "bg-slate-400" },
	cancelled: { label: "Dibatalkan",         bg: "bg-red-50",     text: "text-red-900",     dot: "bg-red-500" },
};

export default function OrderDetailModal({ order, onClose }: Props) {
	const [isClosing, setIsClosing] = useState(false);
	const closeTimerRef = useRef<number | null>(null);
	const kitchen = KITCHEN_STATUS[order.status] ?? KITCHEN_STATUS["pending"];
	const isQris = order.payment_method === "qris";
	const isCash = order.payment_method === "cash" || !order.payment_method;

	function requestClose() {
		if (isClosing) return;
		setIsClosing(true);
		closeTimerRef.current = window.setTimeout(onClose, 220);
	}

	useEffect(() => () => {
		if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
	}, []);

	return (
		<div
			className={`${isClosing ? "order-detail-backdrop-exit" : "order-detail-backdrop-enter"} fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm`}
			role="presentation"
			onClick={requestClose}
		>
			<section
				role="dialog"
				aria-modal="true"
				aria-labelledby="order-detail-title"
				className={`${isClosing ? "order-detail-panel-exit" : "order-detail-panel-enter"} max-h-[85vh] w-full overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-2xl`}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Title row */}
				<div className="mb-4 flex items-start justify-between gap-3">
					<div>
						<p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Detail Pesanan</p>
						<h2 id="order-detail-title" className="mt-0.5 text-xl font-extrabold text-slate-900">
							Pesanan #{order.id}
						</h2>
					</div>
					<button
						type="button"
						onClick={requestClose}
						aria-label="Tutup detail pesanan"
						className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
					>
						<svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
							<path d="M18 6 6 18M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Kitchen status banner */}
				<div className={`mb-3 flex items-center gap-3 rounded-2xl px-4 py-3 ${kitchen.bg}`}>
					<span className={`h-2.5 w-2.5 shrink-0 rounded-full ${kitchen.dot}`} />
					<div>
						<p className={`text-sm font-bold ${kitchen.text}`}>{kitchen.label}</p>
						{order.status === "ready" && (
							<p className={`text-xs ${kitchen.text} opacity-80`}>
								{isCash ? "Silakan ke kasir untuk mengambil dan membayar." : "Silakan ambil pesanan Anda."}
							</p>
						)}
						{order.status === "preparing" && (
							<p className={`text-xs ${kitchen.text} opacity-80`}>Barista sedang menyiapkan pesanan Anda.</p>
						)}
						{order.status === "pending" && (
							<p className={`text-xs ${kitchen.text} opacity-80`}>Pesanan Anda diterima dan akan segera diproses.</p>
						)}
					</div>
				</div>

				{/* Payment status banner */}
				{order.is_paid ? (
					<div className="mb-4 flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3">
						<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">✓</span>
						<div>
							<p className="text-sm font-bold text-emerald-900">Pembayaran dikonfirmasi</p>
							<p className="text-xs text-emerald-800">
								{isQris ? "Kasir telah mengonfirmasi pembayaran QRIS Anda." : "Kasir telah mengonfirmasi pembayaran tunai Anda."}
							</p>
						</div>
					</div>
				) : isQris ? (
					<div className="mb-4 flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3">
						<span className="text-2xl animate-pulse">⏳</span>
						<div>
							<p className="text-sm font-bold text-amber-900">Menunggu konfirmasi QRIS</p>
							<p className="text-xs text-amber-800">Kasir akan mengonfirmasi setelah memeriksa notifikasi dana masuk.</p>
						</div>
					</div>
				) : (
					<div className="mb-4 flex items-center gap-3 rounded-2xl bg-sky-50 px-4 py-3">
						<span className="text-xl">💵</span>
						<div>
							<p className="text-sm font-bold text-sky-900">Bayar di kasir</p>
							<p className="text-xs text-sky-800">
								{order.status === "ready" || order.status === "served"
									? "Silakan lakukan pembayaran tunai di kasir."
									: "Lakukan pembayaran tunai di kasir saat pesanan siap."}
							</p>
						</div>
					</div>
				)}

				{/* Order info */}
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
					{order.customer_name && (
						<div className="flex justify-between gap-4">
							<span className="text-slate-500">Nama</span>
							<span className="font-semibold text-slate-900">{order.customer_name}</span>
						</div>
					)}
					<div className="flex justify-between gap-4">
						<span className="text-slate-500">Metode bayar</span>
						<span className="font-semibold text-slate-900 uppercase">
							{order.payment_method === "qris" ? "QRIS" : "Tunai"}
						</span>
					</div>
					<div className="flex justify-between gap-4">
						<span className="text-slate-500">Status bayar</span>
						<span className={`font-bold ${order.is_paid ? "text-emerald-700" : "text-amber-700"}`}>
							{order.is_paid ? "Lunas" : "Belum dibayar"}
						</span>
					</div>
				</div>

				{/* Items */}
				<h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Item pesanan</h3>
				<div className="mb-4 divide-y divide-slate-100 rounded-2xl border border-slate-100 px-3.5">
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

				{/* Total */}
				<div className="flex items-center justify-between border-t border-slate-200 pt-3">
					<span className="font-bold text-slate-900">Total</span>
					<span className="text-lg font-extrabold text-primary">{formatCurrency(order.total_amount)}</span>
				</div>
			</section>
		</div>
	);
}
