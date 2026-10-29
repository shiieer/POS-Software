import { Platform } from "react-native";
import { LoginRequest, TokenResponse } from "@/types/api/auth";
import { UserApi } from "@/types/api/user";
import { api } from "./client";

export async function loginApi(payload: LoginRequest) {
	const { data } = await api.post<TokenResponse>("/auth/login", payload);
	return data;
}

export async function fetchMeApi() {
	const { data } = await api.get<UserApi>("/auth/me");
	return data;
}

export async function fetchActiveStaffApi() {
	const { data } = await api.get<UserApi[]>("/auth/staff");
	return data;
}

function guessMime(uri: string): string {
	const clean = uri.split("?")[0].toLowerCase();
	if (clean.endsWith(".png")) return "image/png";
	if (clean.endsWith(".webp")) return "image/webp";
	return "image/jpeg";
}

function guessName(mime: string): string {
	if (mime === "image/png") return "avatar.png";
	if (mime === "image/webp") return "avatar.webp";
	return "avatar.jpg";
}

export async function uploadAvatarApi(imageUri: string): Promise<UserApi> {
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

	const { data } = await api.post<UserApi>("/auth/me/avatar", form);
	return data;
}
