import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import type { OrderOut } from "../types";

export interface CustomerOrderRecord {
	order: OrderOut;
	paymentNotificationSeen: boolean;
}

function getStorageKey(tableId: number | null) {
	return `pos_customer_orders_${tableId ?? "walkin"}`;
}

function loadOrders(storageKey: string): CustomerOrderRecord[] {
	try {
		const saved = localStorage.getItem(storageKey);
		const parsed: unknown = saved ? JSON.parse(saved) : [];
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(record): record is CustomerOrderRecord =>
				record && typeof record === "object" &&
				"order" in record && typeof record.order?.id === "number",
		);
	} catch {
		return [];
	}
}

function addOrUpdateOrder(
	records: CustomerOrderRecord[],
	order: OrderOut,
	seen = true,
): CustomerOrderRecord[] {
	const existing = records.find((record) => record.order.id === order.id);
	const next = records.filter((record) => record.order.id !== order.id);
	next.unshift({
		order,
		paymentNotificationSeen: existing?.paymentNotificationSeen ?? seen,
	});
	return next.slice(0, 30);
}

export function useCustomerOrderNotifications(tableId: number | null) {
	const storageKey = getStorageKey(tableId);
	const [records, setRecords] = useState<CustomerOrderRecord[]>(() => loadOrders(storageKey));
	const [lastConfirmedOrderId, setLastConfirmedOrderId] = useState<number | null>(null);
	const [requestedOrderId, setRequestedOrderId] = useState<number | null>(null);
	const recordsRef = useRef(records);
	const requestsInFlight = useRef(new Set<number>());
	recordsRef.current = records;

	const trackOrder = useCallback((order: OrderOut) => {
		const next = addOrUpdateOrder(recordsRef.current, order);
		recordsRef.current = next;
		setRecords(next);
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem(storageKey, JSON.stringify(records));
		} catch {
			// Notifications still work for this page when browser storage is unavailable.
		}
	}, [records, storageKey]);

	useEffect(() => {
		let active = true;
		const refreshPendingOrders = async () => {
			const pending = recordsRef.current.filter(
				({ order }) => order.status !== "served" && order.status !== "cancelled",
			);

			await Promise.all(pending.map(async ({ order: previous }) => {
				if (requestsInFlight.current.has(previous.id)) return;
				requestsInFlight.current.add(previous.id);
				try {
					const updated = await api.getOrderStatus(previous.id);
					if (!active) return;
					const becamePaid = !previous.is_paid && updated.is_paid;
					const statusChanged = previous.status !== updated.status;
					const shouldNotify = becamePaid || statusChanged;
					const merged = addOrUpdateOrder(
						recordsRef.current,
						updated,
						!shouldNotify,
					);
					const next = shouldNotify
						? merged.map((record) => record.order.id === updated.id
							? { ...record, paymentNotificationSeen: false }
							: record,
						)
						: merged;
					recordsRef.current = next;
					setRecords(next);

					if (becamePaid) {
						setLastConfirmedOrderId(updated.id);
						if (window.isSecureContext && "Notification" in window && Notification.permission === "granted") {
							try {
								const notifTitle = updated.payment_method === "qris"
									? "Pembayaran QRIS dikonfirmasi"
									: "Pembayaran dikonfirmasi";
								const notifBody = updated.payment_method === "qris"
									? `Kasir telah mengonfirmasi pembayaran pesanan #${updated.id}.`
									: `Kasir mengonfirmasi pembayaran tunai pesanan #${updated.id}.`;
								const notification = new Notification(notifTitle, {
									body: notifBody,
									tag: `payment-${updated.id}`,
								});
								notification.onclick = () => {
									window.focus();
									setRequestedOrderId(updated.id);
									notification.close();
								};
							} catch {
								// The in-page notification center remains available.
							}
						}
					} else if (statusChanged) {
						if (window.isSecureContext && "Notification" in window && Notification.permission === "granted") {
							try {
								const statusLabels: Record<string, string> = {
									preparing: "Pesanan sedang diproses ☕",
									ready: "Pesanan siap diambil! 🎉",
									served: "Pesanan telah disajikan ✓",
								};
								const label = statusLabels[updated.status];
								if (label) {
									const notification = new Notification(label, {
										body: `Pesanan #${updated.id}`,
										tag: `status-${updated.id}-${updated.status}`,
									});
									notification.onclick = () => {
										window.focus();
										setRequestedOrderId(updated.id);
										notification.close();
									};
								}
							} catch {
								// silently ignore
							}
						}
					}
				} catch (err) {
					console.error(`Failed to refresh order #${previous.id}:`, err);
				} finally {
					requestsInFlight.current.delete(previous.id);
				}
			}));
		};

		void refreshPendingOrders();
		const interval = setInterval(refreshPendingOrders, 3000);
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") void refreshPendingOrders();
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			active = false;
			clearInterval(interval);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [storageKey]);

	const markAllNotificationsSeen = useCallback(() => {
		const next = recordsRef.current.map((record) => ({
			...record,
			paymentNotificationSeen: true,
		}));
		recordsRef.current = next;
		setRecords(next);
	}, []);

	const markNotificationSeen = useCallback((orderId: number) => {
		const next = recordsRef.current.map((record) => record.order.id === orderId
			? { ...record, paymentNotificationSeen: true }
			: record,
		);
		recordsRef.current = next;
		setRecords(next);
	}, []);

	return {
		records,
		unreadCount: records.filter((record) => !record.paymentNotificationSeen).length,
		lastConfirmedOrder: records.find((record) => record.order.id === lastConfirmedOrderId)?.order ?? null,
		requestedOrderId,
		clearRequestedOrder: () => setRequestedOrderId(null),
		markAllNotificationsSeen,
		markNotificationSeen,
		trackOrder,
	};
}
