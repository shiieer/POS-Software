import { OrderApi, ApiOrderStatus } from "@/types/api/order";
import { getElapsedSeconds } from "@/utils";
import {
	Order,
	OrderFilter,
	OrderFilterCounts,
	OrderStatus,
} from "../types/order";

function mapStatus(status: ApiOrderStatus): OrderStatus {
	if (status === "pending") return "new";
	if (status === "preparing") return "preparing";
	if (status === "ready") return "ready";
	if (status === "served") return "served";
	return "cancelled";
}

export function mapOrder(api: OrderApi): Order {
	const elapsedSeconds = getElapsedSeconds(api.created_at);
	const isTable = Boolean(api.table_id);
	const isPriority = !api.is_paid && elapsedSeconds >= 300;
	const rawPaymentMethod = api.payment_method || api.paymeny_method;
	const paymentMethod =
		rawPaymentMethod === "qris"
			? "qris"
			: rawPaymentMethod === "other"
			? "other"
			: "cash";

	return {
		id: api.id,
		title: api.table_name ?? "Express To-Go",
		orderCode: `#ORD-${String(api.id).padStart(4, "0")}`,
		sourceLabel: api.customer_name?.trim() || (isTable ? "Dine-in" : "Walk-in"),
		tag: isPriority ? "Priority" : isTable ? undefined : "Bagged",
		status: mapStatus(api.status),
		paymentStatus: api.is_paid ? "paid" : "unpaid",
		paymentMethod,
		locationType: isTable ? "table" : "to-go",
		locationLabel: api.table_name ?? api.customer_name ?? "To-Go",
		elapsedSeconds,
		isUrgent: elapsedSeconds >= 300,
		isPriority,
		accentColor: isTable ? "blue" : "teal",
		items: (api.items ?? []).map((item) => ({
			id: item.id,
			quantity: item.quantity,
			name: item.menu_item_name ?? "Unknown item",
			note: item.notes ?? undefined,
			unitPrice: item.unit_price ?? 0,
			subtotal: item.subtotal ?? 0,
		})),
		createdAt: api.created_at,
		totalAmount: api.total_amount ?? 0,
	};
}

export function mapFilterToApiStatus(
	filter: OrderFilter,
): ApiOrderStatus | undefined {
	if (filter === "New") return "pending";
	if (filter === "Preparing") return "preparing";
	if (filter === "Ready") return "ready";
	if (filter === "Served") return "served";
	if (filter === "Canceled") return "cancelled";
	return undefined;
}

export function filterOrders(orders: Order[], filter: OrderFilter) {
	if (filter === "All") {
		return orders.filter((order) => order.status !== "cancelled");
	}

	const statusMap: Record<Exclude<OrderFilter, "All">, OrderStatus> = {
		New: "new",
		Preparing: "preparing",
		Ready: "ready",
		Served: "served",
		Canceled: "cancelled",
	};

	return orders.filter((order) => order.status === statusMap[filter]);
}

export function countOrdersByFilter(orders: Order[]): OrderFilterCounts {
	const active = orders.filter((order) => order.status !== "cancelled");

	return {
		All: active.length,
		New: active.filter((order) => order.status === "new").length,
		Preparing: active.filter((order) => order.status === "preparing").length,
		Ready: active.filter((order) => order.status === "ready").length,
		Served: active.filter((order) => order.status === "served").length,
		Canceled: orders.filter((order) => order.status === "cancelled").length,
	};
}
