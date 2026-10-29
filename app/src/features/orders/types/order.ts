export type OrderFilter =
	| "All"
	| "New"
	| "Preparing"
	| "Ready"
	| "Served"
	| "Canceled";
export type PaymentFilter = "All" | "Unpaid" | "Paid";

export type OrderStatus =
	| "new"
	| "preparing"
	| "ready"
	| "served"
	| "cancelled";

export type PaymentStatus = "paid" | "unpaid";

export type PaymentMethodType = "cash" | "qris" | "other";

export type OrderLocationType = "table" | "to-go";

export type OrderLineItem = {
	id: number;
	quantity: number;
	name: string;
	note?: string;
	unitPrice: number;
	subtotal: number;
};

export type Order = {
	id: number;
	title: string;
	orderCode: string;
	sourceLabel: string;
	tag?: string;
	status: OrderStatus;
	paymentStatus: PaymentStatus;
	paymentMethod: PaymentMethodType;
	paymentProofUrl?: string | null;
	locationType: OrderLocationType;
	locationLabel: string;
	elapsedSeconds: number;
	items: OrderLineItem[];
	createdAt: string;
	updatedAt: string;
	totalAmount: number;
	accentColor?: "teal" | "blue";
	isUrgent?: boolean;
	isPriority?: boolean;
};

export type OrderFilterCounts = Record<OrderFilter, number>;

export type ShiftMetrics = {
	inQueue: number;
	newCount: number;
};
