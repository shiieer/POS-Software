import { useCallback, useEffect, useState } from "react";
import { Order } from "../types/order";
import {
	fetchOrderApi,
	updateOrderPaymentApi,
	updateOrderStatusApi,
} from "@/services/api/order.api";
import { getElapsedSeconds, getErrorMessage } from "@/utils";
import { mapOrder } from "../utils/mapOrder";

export function useOrderDetail(orderId: number) {
	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [now, setNow] = useState(Date.now());

	const laodOrder = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await fetchOrderApi(orderId);
			setOrder(mapOrder(data));
		} catch (err) {
			setError(getErrorMessage(err, "Failed to load order"));
		} finally {
			setLoading(false);
		}
	}, [orderId]);

	useEffect(() => {
		laodOrder();
	}, [laodOrder]);

	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(timer);
	}, []);

	const elapsedSeconds = order
		? getElapsedSeconds(order.createdAt, now)
		: 0;

	async function runUpdate(action: () => Promise<unknown>) {
		try {
			setUpdating(true);
			setError(null);
			await action();
			await laodOrder();
		} catch (err) {
			setError(getErrorMessage(err, "Failed to update order"));
		} finally {
			setUpdating(false);
		}
	}

	return {
		order,
		loading,
		updating,
		error,
		elapsedSeconds,
		isUrgent: elapsedSeconds >= 300,
		startPreparing: () =>
			runUpdate(() =>
				updateOrderStatusApi(orderId, { status: "preparing" }),
			),
		markReady: () =>
			runUpdate(() => updateOrderStatusApi(orderId, { status: "ready" })),
		markPaid: (method?: "cash" | "qris") =>
			runUpdate(() =>
				updateOrderPaymentApi(orderId, {
					payment_method: method || (order?.paymentMethod === "qris" ? "qris" : "cash"),
					is_paid: true,
				}),
			),
		cancelOrder: () =>
			runUpdate(() =>
				updateOrderStatusApi(orderId, { status: "cancelled" }),
			),
		printOrder: () => console.log("Print order:", orderId),
	};
}
