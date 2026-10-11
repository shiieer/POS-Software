import { Platform } from "react-native";
import { api } from "./client";

function guessMime(uri: string): string {
	const clean = uri.split("?")[0].toLowerCase();
	if (clean.endsWith(".png")) return "image/png";
	if (clean.endsWith(".webp")) return "image/webp";
	return "image/jpeg";
}

function guessName(mime: string): string {
	if (mime === "image/png") return "qris.png";
	if (mime === "image/webp") return "qris.webp";
	return "qris.jpg";
}

export type QrisSettingApi = {
	qris_image_url: string;
	merchant_name: string;
	updated_at: string | null;
};

export async function fetchQrisSettingApi(): Promise<QrisSettingApi> {
	const { data } = await api.get<QrisSettingApi>("/settings/qris");
	return data;
}

export async function updateMerchantNameApi(merchantName: string): Promise<QrisSettingApi> {
	const { data } = await api.put<QrisSettingApi>("/settings/merchant-name", {
		merchant_name: merchantName,
	});
	return data;
}

export async function uploadQrisImageApi(
	imageUri: string,
): Promise<QrisSettingApi> {
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

	const { data } = await api.post<QrisSettingApi>("/settings/qris/image", form);
	return data;
}
