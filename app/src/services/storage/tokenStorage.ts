import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "pos_access_token";

function decodeJwtPayload(token: string): any {
	try {
		const parts = token.split(".");
		if (parts.length !== 3) return null;
		const base64Url = parts[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

		let decoded = "";
		if (typeof atob === "function") {
			decoded = atob(padded);
		} else {
			const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
			let i = 0;
			while (i < padded.length) {
				const enc1 = b64.indexOf(padded.charAt(i++));
				const enc2 = b64.indexOf(padded.charAt(i++));
				const enc3 = b64.indexOf(padded.charAt(i++));
				const enc4 = b64.indexOf(padded.charAt(i++));

				const chr1 = (enc1 << 2) | (enc2 >> 4);
				const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				const chr3 = ((enc3 & 3) << 6) | enc4;

				decoded += String.fromCharCode(chr1);
				if (enc3 !== 64 && enc3 !== -1) decoded += String.fromCharCode(chr2);
				if (enc4 !== 64 && enc4 !== -1) decoded += String.fromCharCode(chr3);
			}
		}

		return JSON.parse(decoded);
	} catch {
		return null;
	}
}

export function isTokenExpired(token: string): boolean {
	const payload = decodeJwtPayload(token);
	if (!payload) return true;
	if (typeof payload.exp === "number") {
		return Date.now() >= payload.exp * 1000;
	}
	return false;
}

export function getUserRoleFromToken(token: string): "admin" | "staff" | null {
	const payload = decodeJwtPayload(token);
	if (payload?.role === "admin" || payload?.role === "staff") {
		return payload.role;
	}
	return null;
}

export async function saveToken(token: string) {
	if (Platform.OS === "web") {
		localStorage.setItem(TOKEN_KEY, token);
		return;
	}
	await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
	let token: string | null = null;
	if (Platform.OS === "web") {
		token = localStorage.getItem(TOKEN_KEY);
	} else {
		token = await SecureStore.getItemAsync(TOKEN_KEY);
	}

	if (token && isTokenExpired(token)) {
		await clearToken();
		return null;
	}

	return token;
}

export async function clearToken() {
	if (Platform.OS === "web") {
		localStorage.removeItem(TOKEN_KEY);
		return;
	}
	await SecureStore.deleteItemAsync(TOKEN_KEY);
}
