function isLocalHost(host: string) {
	const normalized = host.toLowerCase().replace(/^\[|\]$/g, "");
	if (["localhost", "127.0.0.1", "::1"].includes(normalized)) return true;
	const octets = normalized.split(".");
	if (octets.length !== 4 || !octets.every((part) => /^\d+$/.test(part))) return false;
	const [first, second] = octets.map(Number);
	return first === 10 || (first === 192 && second === 168) || (first === 172 && second >= 16 && second <= 31);
}

function resolveApiBase() {
	const currentHost = typeof window !== "undefined" ? window.location.hostname : "";
	const configuredApiUrl = import.meta.env.VITE_API_URL as string | undefined;
	if (configuredApiUrl && currentHost) {
		try {
			const configured = new URL(configuredApiUrl);
			if (isLocalHost(configured.hostname)) {
				configured.hostname = currentHost;
				return configured.toString().replace(/\/$/, "");
			}
		} catch {
			// Use the current host as the local development API host below.
		}
	}
	if (configuredApiUrl) return configuredApiUrl;
	return currentHost ? `http://${currentHost}:8000` : "http://localhost:8000";
}

const API_BASE = resolveApiBase();

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

	getOrderStatus: (orderId: number) =>
		request<import("../types").OrderOut>(`/order/public/${orderId}`, {
			cache: "no-store",
		}),

	getQrisSetting: () =>
		request<{ qris_image_url: string; merchant_name: string }>("/settings/qris"),
};
