import { Platform } from "react-native";

const DEFAULT_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const configuredApiUrl =
	process.env.EXPO_PUBLIC_API_URL ?? process.env.API_URL;
const browserHost =
	Platform.OS === "web" && typeof window !== "undefined"
		? window.location.hostname
		: null;

function isLocalHost(host: string) {
	const normalized = host.toLowerCase().replace(/^\[|\]$/g, "");
	if (["localhost", "127.0.0.1", "::1"].includes(normalized)) return true;
	const octets = normalized.split(".");
	if (octets.length !== 4 || !octets.every((part) => /^\d+$/.test(part))) return false;
	const [first, second] = octets.map(Number);
	return first === 10 || (first === 192 && second === 168) || (first === 172 && second >= 16 && second <= 31);
}

function resolveWebApiUrl() {
	if (!browserHost) return null;
	if (!configuredApiUrl) return `http://${browserHost}:8000`;

	try {
		const configured = new URL(configuredApiUrl);
		if (isLocalHost(configured.hostname)) {
			configured.hostname = browserHost;
			return configured.toString().replace(/\/$/, "");
		}
	} catch {
		return `http://${browserHost}:8000`;
	}
	return configuredApiUrl;
}

const FALLBACK_URL = `http://${DEFAULT_HOST}:8000`;

export const API_BASE_URL =
	(Platform.OS === "web" ? resolveWebApiUrl() : null) ??
	configuredApiUrl ??
	FALLBACK_URL;

export const DEV_LOGIN = {
	username: process.env.DEV_USERNAME ?? "admin",
	password: process.env.DEV_USERNAME ?? "admin123",
};
