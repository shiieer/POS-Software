import { Platform } from "react-native";
import {
	CreateMenuItemPayload,
	MenuItemApi,
	UpdateMenuItemPayload,
} from "@/types/api/menu";
import { api } from "./client";

export async function fetchMenuApi(availableOnly = true) {
	const { data } = await api.get<MenuItemApi[]>("/menu", {
		params: { available_only: availableOnly },
	});
	return data;
}

export async function createMenuItemApi(payload: CreateMenuItemPayload) {
	const { data } = await api.post<MenuItemApi>("/menu", payload);
	return data;
}

export async function updateMenuItemApi(
	itemId: number,
	payload: UpdateMenuItemPayload,
) {
	const { data } = await api.put<MenuItemApi>(`/menu/${itemId}`, payload);
	return data;
}

export async function deleteMenuItemApi(itemId: number) {
	const { data } = await api.delete<{ message: string }>(`/menu/${itemId}`);
	return data;
}

function guessMime(uri: string) {
	const lower = uri.toLowerCase();
	if (lower.includes(".png") || lower.includes("image/png"))
		return "image/png";
	if (lower.includes(".webp") || lower.includes("image/webp"))
		return "image/webp";
	return "image/jpeg";
}

function guessName(mime: string) {
	if (mime === "image/png") return "menu.png";
	if (mime === "image/webp") return "menu.webp";
	return "menu.jpg";
}

export async function uploadMenuImageApi(itemId: number, imageUri: string) {
	const form = new FormData();

	if (Platform.OS === "web") {
		const res = await fetch(imageUri);
		const blob = await res.blob();
		const type =
			blob.type && blob.type.startsWith("image/")
				? blob.type
				: guessMime(imageUri);
		form.append("file", new File([blob], guessName(type), { type }));
	} else {
		const type = guessMime(imageUri);
		form.append("file", {
			uri: imageUri,
			name: guessName(type),
			type,
		} as unknown as Blob);
	}
	const { data } = await api.post<MenuItemApi>(`/menu/${itemId}/image`, form);
	return data;
}
