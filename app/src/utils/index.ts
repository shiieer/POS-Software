import axios from "axios";
import { API_BASE_URL } from "@/constants/api";

export const ALL_ITEMS = "All Items";

export function formatRp(value: number) {
	return `Rp ${value.toLocaleString("id-ID")}`;
}

function parseApiDateTime(value: string) {
	const includesTimezone = /(?:[zZ]|[+-]\d{2}:?\d{2})$/.test(value);
	return new Date(includesTimezone ? value : `${value}Z`);
}

export function formatTime(iso: string) {
	return parseApiDateTime(iso).toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function formatWait(totalSeconds: number) {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export function formatElapsedTime(totalSeconds: number) {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getElapsedSeconds(createdAt: string, now: number | string = Date.now()) {
	const created = parseApiDateTime(createdAt).getTime();
	const end = typeof now === "string" ? parseApiDateTime(now).getTime() : now;
	if (Number.isNaN(created)) return 0;
	if (Number.isNaN(end)) return 0;
	return Math.max(0, Math.floor((end - created) / 1000));
}

export function resolveImageUrl(url: string | null | undefined) {
	if (!url) return null;
	if (url.startsWith("http")) return url;
	return `${API_BASE_URL}${url}`;
}

export function uniqueStrings(values: string[], sort = false) {
	const list = Array.from(new Set(values.filter(Boolean)));
	return sort ? list.sort() : list;
}

export function getErrorMessage(
	err: unknown,
	fallback = "Something went wrong",
) {
	if (axios.isAxiosError(err)) {
		const detail = err.response?.data?.detail;
		if (typeof detail === "string") return detail;
		return err.message;
	}
	if (err instanceof Error) return err.message;
	return fallback;
}
