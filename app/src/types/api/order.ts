export type ApiOrderStatus =
	| "pending"
	| "preparing"
	| "ready"
	| "served"
	| "cancelled";

export type OrderItemApi = {
	id: number;
	menu_item_id: number;
	menu_item_name: string | null;
	quantity: number;
	unit_price: number;
	subtotal: number;
	notes: string | null;
};

export type OrderApi = {
	id: number;
	table_id: number | null;
	table_name: string | null;
	customer_name: string | null;
	status: ApiOrderStatus;
	is_paid: boolean;
	payment_method?: "cash" | "qris" | "other" | null;
	paymeny_method?: string | null;
	notes: string | null;
	total_amount: number;
	created_at: string;
	updated_at: string;
	items: OrderItemApi[];
};

export type CreateOrderItemPayload = {
	menu_item_id: number;
	quantity: number;
	notes?: string | null;
};

export type CreateOrderPayload = {
	table_id?: number | null;
	customer_name?: string | null;
	notes?: string | null;
	items: CreateOrderItemPayload[];
};

export type UpdateOrderStatusPayload = {
	status: ApiOrderStatus;
};

export type UpdateOrderPaymentPayload = {
	payment_method: "cash" | "qris" | "other";
	is_paid: boolean;
};
