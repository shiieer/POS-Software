import { useCallback, useEffect, useMemo, useState } from "react";
import { ORDER_FILTERS } from "../constants/filters";
import { Order, OrderFilter, ShiftMetrics } from "../types/order";
import {
	fetchOrdersApi,
	updateOrderPaymentApi,
	updateOrderStatusApi,
} from "@/services/api/order.api";
import { getErrorMessage } from "@/utils";
import { countOrdersByFilter, filterOrders, mapOrder } from "../utils/mapOrder";

export function useOrders() {
	const [selectedFilter, setSelectedFilter] = useState<OrderFilter>("All");
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadOrders = useCallback(async (isRefresh = false) => {
		try {
			if (isRefresh) setRefreshing(true);
			else setLoading(true);

			setError(null);

			const data = await fetchOrdersApi({
				active_only: false,
			});

			const list = Array.isArray(data) ? data : [];
			setOrders(list.map(mapOrder));
		} catch (err) {
			setError(getErrorMessage(err, "Failed to load orders"));
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, []);

	useEffect(() => {
		loadOrders();
	}, [loadOrders]);

	useEffect(() => {
		const pollInterval = setInterval(() => {
			loadOrders(true);
		}, 6000);
		return () => clearInterval(pollInterval);
	}, [loadOrders]);

	const visibleOrders = useMemo(
		() => filterOrders(orders, selectedFilter),
		[orders, selectedFilter],
	);

	const counts = useMemo(() => countOrdersByFilter(orders), [orders]);

	const metrics = useMemo<ShiftMetrics>(() => {
		const active = orders.filter(
			(order) =>
				order.status !== "cancelled" && order.status !== "served",
		);
		return {
			inQueue: active.length,
			newCount: active.filter((order) => order.status === "new").length,
		};
	}, [orders]);

	const startPreparing = async (orderId: number) => {
		await updateOrderStatusApi(orderId, { status: "preparing" });
		await loadOrders(true);
	};

	const markReady = async (orderId: number) => {
		await updateOrderStatusApi(orderId, { status: "ready" });
		await loadOrders(true);
	};

	const markServed = async (orderId: number) => {
		await updateOrderStatusApi(orderId, { status: "served" });
		await loadOrders(true);
	};

	const printOrder = (orderId: number) => {
		console.log("Print order:", orderId);
	};

	const pendingQrisOrders = useMemo(
		() =>
			orders.filter(
				(o) =>
					o.paymentMethod === "qris" &&
					o.paymentStatus === "unpaid" &&
					o.status !== "cancelled",
			),
		[orders],
	);

	const confirmPayment = async (
		orderId: number,
		method: "cash" | "qris" = "qris",
	) => {
		await updateOrderPaymentApi(orderId, {
			payment_method: method,
			is_paid: true,
		});
		await loadOrders(true);
	};

	return {
		filters: ORDER_FILTERS,
		selectedFilter,
		setSelectedFilter,
		counts,
		metrics,
		orders: visibleOrders,
		pendingQrisOrders,
		pendingQrisCount: pendingQrisOrders.length,
		loading,
		refreshing,
		error,
		refresh: () => loadOrders(true),
		startPreparing,
		markReady,
		markServed,
		confirmPayment,
		printOrder,
	};
}
