const API_BASE =
	import.meta.env.API_URL ||
	(typeof window !== "undefined" && window.location.hostname
		? `http://${window.location.hostname}:8000`
		: "http://localhost:8000");

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
	const res = await fetch(`${API_BASE}${endpoint}`, {
		headers: { "Content-Type": "application/json" },
		...options,
	});

	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.detail || `Request failed: ${res.status}`);
	}

	return res.json();
}

export interface TablePublic {
	id: number;
	name: string;
	is_active: boolean;
}

export const api = {
	getMenu: () => request<import("../types").MenuItem[]>("/menu"),

	verifyTable: (tableId: number, token: string) =>
		request<TablePublic>(
			`/tables/verify?table_id=${tableId}&token=${encodeURIComponent(token)}`,
		),

	createOrder: (payload: import("../types").OrderCreate) =>
		request<import("../types").OrderOut>("/order", {
			method: "POST",
			body: JSON.stringify(payload),
		}),
};
