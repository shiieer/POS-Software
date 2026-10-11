import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "../utils/formatCurrency";
import type { CustomerOrderRecord } from "../hooks/useCustomerOrderNotifications";

interface Props {
	records: CustomerOrderRecord[];
	onClose: () => void;
	onSelectOrder: (orderId: number) => void;
}

// ── Kitchen status labels ──────────────────────────────────────────────────
const KITCHEN_STATUS: Record<string, { label: string; color: string; dot: string }> = {
	pending:    { label: "Menunggu diproses",   color: "text-amber-700",   dot: "bg-amber-400 animate-pulse" },
	preparing:  { label: "Sedang diproses ☕",  color: "text-indigo-700",  dot: "bg-indigo-500 animate-pulse" },
	ready:      { label: "Siap diambil 🎉",     color: "text-emerald-700", dot: "bg-emerald-500" },
	served:     { label: "Telah disajikan ✓",   color: "text-slate-600",   dot: "bg-slate-400" },
	cancelled:  { label: "Dibatalkan",          color: "text-red-700",     dot: "bg-red-500" },
};

function getKitchenStatus(status: string) {
	return KITCHEN_STATUS[status] ?? { label: status, color: "text-slate-600", dot: "bg-slate-400" };
}

// ── Payment line ────────────────────────────────────────────────────────────
function getPaymentLine(order: CustomerOrderRecord["order"]) {
	if (order.is_paid) {
		const method = order.payment_method === "qris" ? "QRIS" : "Tunai";
		return { text: `Lunas · ${method}`, color: "text-emerald-700" };
	}
	if (order.payment_method === "qris") {
		return { text: "Menunggu konfirmasi QRIS", color: "text-rose-700" };
	}
	// cash unpaid
	if (order.status === "ready" || order.status === "served") {
		return { text: "Bayar di kasir sekarang", color: "text-amber-700" };
	}
	return { text: "Bayar di kasir saat ambil", color: "text-amber-600" };
}

// ── Drag-to-dismiss constants ───────────────────────────────────────────────
const DISMISS_THRESHOLD = 100;

export default function CustomerNotificationCenter({ records, onClose, onSelectOrder }: Props) {
	const overlayRef = useRef<HTMLDivElement>(null);
	const [dragY, setDragY] = useState(0);
	const [dragging, setDragging] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const startYRef = useRef(0);
	const dragYRef = useRef(0);
	const closeTimerRef = useRef<number | null>(null);

	function requestClose(afterClose: () => void = onClose) {
		if (isClosing) return;
		setIsClosing(true);
		closeTimerRef.current = window.setTimeout(afterClose, 260);
	}

	// Close on Escape
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") requestClose(); };
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isClosing, onClose]);

	useEffect(() => () => {
		if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
	}, []);

	// Lock body scroll
	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => { document.body.style.overflow = ""; };
	}, []);

	// Touch drag
	function onTouchStart(e: React.TouchEvent) {
		startYRef.current = e.touches[0].clientY;
		setDragging(true);
	}
	function onTouchMove(e: React.TouchEvent) {
		const nextDragY = Math.max(0, e.touches[0].clientY - startYRef.current);
		dragYRef.current = nextDragY;
		setDragY(nextDragY);
	}
	function onTouchEnd() {
		setDragging(false);
		if (dragYRef.current >= DISMISS_THRESHOLD) requestClose();
		else {
			dragYRef.current = 0;
			setDragY(0);
		}
	}

	// Mouse drag
	function onMouseDown(e: React.MouseEvent) {
		startYRef.current = e.clientY;
		setDragging(true);
		const onMove = (ev: MouseEvent) => {
			const nextDragY = Math.max(0, ev.clientY - startYRef.current);
			dragYRef.current = nextDragY;
			setDragY(nextDragY);
		};
		const onUp = () => {
			setDragging(false);
			if (dragYRef.current >= DISMISS_THRESHOLD) requestClose();
			else {
				dragYRef.current = 0;
				setDragY(0);
			}
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("mouseup", onUp);
		};
		window.addEventListener("mousemove", onMove);
		window.addEventListener("mouseup", onUp);
	}

	const backdropOpacity = Math.max(0, 1 - dragY / 250);

	return (
		<div
			ref={overlayRef}
			className={`${isClosing ? "notification-center-backdrop-exit" : "notification-center-backdrop-enter"} fixed inset-0 z-[60] flex items-end justify-center`}
			style={{ backgroundColor: `rgba(0,0,0,${0.5 * backdropOpacity})`, backdropFilter: `blur(${4 * backdropOpacity}px)` }}
			onClick={(e) => { if (e.target === overlayRef.current) requestClose(); }}
		>
			<div
				className={`${isClosing ? "notification-center-panel-exit" : "notification-center-panel-enter"} w-full rounded-t-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]`}
				style={{
					transform: `translateY(${dragY}px)`,
					transition: dragging ? "none" : "transform 0.3s cubic-bezier(0.32,0.72,0,1)",
					willChange: "transform",
				}}
			>
				{/* Drag handle */}
				<div
					className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none select-none shrink-0"
					onTouchStart={onTouchStart}
					onTouchMove={onTouchMove}
					onTouchEnd={onTouchEnd}
					onMouseDown={onMouseDown}
					aria-hidden="true"
				>
					<div className="h-1 w-12 rounded-full bg-slate-200" />
				</div>

				{/* Header */}
				<div className="flex items-center gap-2 border-b border-slate-100 px-5 pb-4 shrink-0">
					<svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
						<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
						<path d="M10 21h4" />
					</svg>
					<div>
						<h2 className="text-base font-extrabold text-slate-900">Notifikasi Pesanan</h2>
						<p className="text-xs text-slate-500">Pembaruan status dan pembayaran pesanan Anda</p>
					</div>
				</div>

				{/* List */}
				<div className="overflow-y-auto flex-1 p-4 space-y-2">
					{records.length === 0 ? (
						<div className="py-10 flex flex-col items-center gap-3 text-slate-400">
							<svg aria-hidden="true" viewBox="0 0 24 24" className="h-10 w-10 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
								<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
								<path d="M10 21h4" />
							</svg>
							<p className="text-sm font-medium">Belum ada pesanan di sesi ini</p>
						</div>
					) : records.map(({ order, paymentNotificationSeen }) => {
						const kitchen = getKitchenStatus(order.status);
						const payment = getPaymentLine(order);
						return (
							<button
								key={order.id}
								type="button"
								onClick={() => requestClose(() => onSelectOrder(order.id))}
								className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 p-3.5 text-left transition-colors hover:border-primary/30 hover:bg-slate-50 active:bg-slate-100"
							>
								{/* Status icon */}
								<span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${
									order.status === "ready" ? "bg-emerald-100 text-emerald-700" :
									order.status === "preparing" ? "bg-indigo-100 text-indigo-700" :
									order.is_paid ? "bg-emerald-100 text-emerald-700" :
									"bg-amber-100 text-amber-700"
								}`} aria-hidden="true">
									{order.status === "ready" ? "🎉" :
									 order.status === "preparing" ? "☕" :
									 order.status === "served" ? "✓" :
									 order.status === "cancelled" ? "✕" : "◷"}
								</span>

								<span className="min-w-0 flex-1">
									<span className="flex items-center justify-between gap-2">
										<span className="text-sm font-bold text-slate-900">Pesanan #{order.id}</span>
										{!paymentNotificationSeen && (
											<span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" aria-label="Belum dibaca" />
										)}
									</span>

									{/* Kitchen status */}
									<span className={`mt-0.5 flex items-center gap-1.5 text-xs font-semibold ${kitchen.color}`}>
										<span className={`inline-block h-1.5 w-1.5 rounded-full ${kitchen.dot}`} />
										{kitchen.label}
									</span>

									{/* Payment status */}
									<span className={`mt-0.5 block text-xs ${payment.color}`}>
										{payment.text}
									</span>

									{/* Items summary */}
									<span className="mt-1 block truncate text-xs text-slate-400">
										{order.table_name ? `${order.table_name} · ` : ""}
										{order.items.map((item) => `${item.menu_item_name} ×${item.quantity}`).join(", ")}
									</span>
								</span>

								<span className="shrink-0 pt-0.5 text-xs font-bold text-slate-800">
									{formatCurrency(order.total_amount)}
								</span>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}
