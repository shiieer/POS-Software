import { useState, useEffect } from "react";
import {
	ActivityIndicator,
	Alert,
	Pressable,
	ScrollView,
	TextInput,
	Text,
	View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import ScreenContainer from "@/shared/components/ScreenContainer";
import { API_BASE_URL } from "@/constants/api";
import {
	fetchQrisSettingApi,
	uploadQrisImageApi,
	updateMerchantNameApi,
	QrisSettingApi,
} from "@/services/api/settings.api";

type Props = {
	onBack: () => void;
};

export default function QrisSettingsScreen({ onBack }: Props) {
	const [currentQris, setCurrentQris] = useState<QrisSettingApi | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const [merchantName, setMerchantName] = useState("");
	const [savingName, setSavingName] = useState(false);
	const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

	async function loadSetting() {
		try {
			setLoading(true);
			const data = await fetchQrisSettingApi();
			setCurrentQris(data);
			setMerchantName(data.merchant_name);
		} catch (err) {
			console.error("Failed to load QRIS setting:", err);
		} finally {
			setLoading(false);
		}
	}

	async function saveMerchantName() {
		const name = merchantName.trim();
		if (!name) {
			Alert.alert("Nama belum diisi", "Masukkan nama POS terlebih dahulu.");
			return;
		}
		try {
			setSavingName(true);
			const updated = await updateMerchantNameApi(name);
			setCurrentQris(updated);
			setMerchantName(updated.merchant_name);
			setMessage({ text: "Nama POS berhasil disimpan!", type: "success" });
		} catch (err) {
			const errText = err instanceof Error ? err.message : "Gagal menyimpan nama POS";
			setMessage({ text: errText, type: "error" });
		} finally {
			setSavingName(false);
		}
	}

	useEffect(() => {
		loadSetting();
	}, []);

	async function pickFromGallery() {
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (!permission.granted) {
			Alert.alert("Permission Required", "Please allow gallery access to select your QRIS image.");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			quality: 0.9,
		});

		if (!result.canceled && result.assets[0]) {
			setSelectedImageUri(result.assets[0].uri);
			setMessage(null);
		}
	}

	async function takePhoto() {
		const permission = await ImagePicker.requestCameraPermissionsAsync();
		if (!permission.granted) {
			Alert.alert("Permission Required", "Please allow camera access to photograph your QRIS code.");
			return;
		}

		const result = await ImagePicker.launchCameraAsync({
			quality: 0.9,
		});

		if (!result.canceled && result.assets[0]) {
			setSelectedImageUri(result.assets[0].uri);
			setMessage(null);
		}
	}

	async function handleUpload() {
		if (!selectedImageUri) return;

		try {
			setUploading(true);
			setMessage(null);
			const updated = await uploadQrisImageApi(selectedImageUri);
			setCurrentQris(updated);
			setSelectedImageUri(null);
			setMessage({ text: "Foto QRIS berhasil di-upload!", type: "success" });
			Alert.alert("Sukses", "Foto QRIS baru berhasil disimpan dan aktif untuk pelanggan!");
		} catch (err) {
			const errText = err instanceof Error ? err.message : "Gagal upload gambar QRIS";
			setMessage({ text: errText, type: "error" });
			Alert.alert("Gagal Upload", errText);
		} finally {
			setUploading(false);
		}
	}

	function resolveImageUrl(url: string | undefined): string {
		if (!url) return "";
		if (url.startsWith("http://") || url.startsWith("https://")) return url;
		return `${API_BASE_URL.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
	}

	return (
		<ScreenContainer showHeader={false}>
			{/* Top Bar */}
			<View className="h-16 flex-row items-center justify-between border-b border-sky-100 bg-white/80 px-4">
				<Pressable
					onPress={onBack}
					className="h-10 w-10 items-center justify-center rounded-full"
					accessibilityLabel="Kembali"
				>
					<Ionicons name="arrow-back" size={22} color="#334155" />
				</Pressable>
				<View className="items-center">
					<Text className="text-[10px] font-bold uppercase tracking-widest text-[#0284c7]">
						{currentQris?.merchant_name || "POS System"} • POS
					</Text>
					<Text className="text-base font-bold text-slate-800">
						Pengaturan QRIS
					</Text>
				</View>
				<View className="h-10 w-10 items-center justify-center rounded-full">
					<Ionicons name="qr-code-outline" size={20} color="#0284C7" />
				</View>
			</View>

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#0284C7" />
				</View>
			) : (
				<ScrollView
					className="flex-1"
					contentContainerClassName="gap-4 px-4 py-5 pb-12"
					showsVerticalScrollIndicator={false}
				>
					<View className="rounded-3xl border border-sky-100/90 bg-white p-5">
						<Text className="mb-1 text-sm font-bold text-slate-800">Nama POS</Text>
						<Text className="mb-3 text-xs text-slate-500">Nama ini ditampilkan di menu pelanggan.</Text>
						<TextInput
							value={merchantName}
							onChangeText={setMerchantName}
							placeholder="Contoh: Kedai Saya"
							maxLength={100}
							className="mb-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800"
						/>
						<Pressable onPress={saveMerchantName} disabled={savingName} className="items-center rounded-2xl bg-[#0284c7] py-3.5 disabled:opacity-50">
							<Text className="text-sm font-bold text-white">{savingName ? "Menyimpan..." : "Simpan Nama POS"}</Text>
						</Pressable>
					</View>

					{/* Message Banner */}
					{message && (
						<View
							className={`flex-row items-center gap-2 rounded-2xl border p-3.5 ${
								message.type === "success"
									? "border-emerald-200 bg-emerald-50 text-emerald-800"
									: "border-rose-200 bg-rose-50 text-rose-800"
							}`}
						>
							<Ionicons
								name={message.type === "success" ? "checkmark-circle" : "alert-circle"}
								size={18}
								color={message.type === "success" ? "#059669" : "#E11D48"}
							/>
							<Text
								className={`text-xs font-semibold flex-1 ${
									message.type === "success" ? "text-emerald-800" : "text-rose-800"
								}`}
							>
								{message.text}
							</Text>
						</View>
					)}

					{/* Current Active QRIS Card */}
					<View className="rounded-3xl border border-sky-100/90 bg-white p-5 shadow-xs">
						<View className="flex-row items-center justify-between mb-3">
							<View>
								<Text className="text-sm font-bold text-slate-800">
									QRIS Aktif Saat Ini
								</Text>
								<Text className="text-[11px] text-slate-400">
									Ditampilkan kepada pelanggan di web menu
								</Text>
							</View>
							<View className="flex-row items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1">
								<View className="h-2 w-2 rounded-full bg-emerald-500" />
								<Text className="text-[10px] font-bold text-emerald-700">
									AKTIF
								</Text>
							</View>
						</View>

						<View className="items-center justify-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
							<Image
								source={{ uri: resolveImageUrl(currentQris?.qris_image_url) }}
								style={{ width: 220, height: 260 }}
								contentFit="contain"
							/>
						</View>

						{currentQris?.updated_at && (
							<Text className="mt-2 text-center text-[10px] text-slate-400">
								Terakhir diperbarui: {new Date(currentQris.updated_at).toLocaleDateString("id-ID")}
							</Text>
						)}
					</View>

					{/* Upload New QRIS Card */}
					<View className="rounded-3xl border border-sky-100/90 bg-white p-5 shadow-xs">
						<Text className="text-sm font-bold text-slate-800 mb-1">
							Upload QRIS Baru
						</Text>
						<Text className="text-xs text-slate-500 mb-4 leading-relaxed">
							Pilih gambar QRIS dari GoBiz, DANA Bisnis, BRI Merchant, BCA, atau Livin' Merchant untuk disimpan.
						</Text>

						{/* Selection Preview */}
						{selectedImageUri ? (
							<View className="mb-4 items-center">
								<View className="overflow-hidden rounded-2xl border-2 border-dashed border-sky-400 bg-sky-50/50 p-3 items-center">
									<Image
										source={{ uri: selectedImageUri }}
										style={{ width: 180, height: 220 }}
										contentFit="contain"
									/>
									<Pressable
										onPress={() => setSelectedImageUri(null)}
										className="mt-2 flex-row items-center gap-1 rounded-xl bg-rose-50 border border-rose-200 px-3 py-1"
									>
										<Ionicons name="trash-outline" size={13} color="#E11D48" />
										<Text className="text-[11px] font-bold text-rose-600">
											Batalkan Pilihan
										</Text>
									</Pressable>
								</View>
							</View>
						) : null}

						{/* Action Buttons to Select Photo */}
						<View className="flex-row gap-3 mb-4">
							<Pressable
								onPress={pickFromGallery}
								disabled={uploading}
								className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50/70 py-3.5 active:bg-sky-100"
							>
								<Ionicons name="images-outline" size={18} color="#0284C7" />
								<Text className="text-xs font-bold text-[#0284c7]">
									Galeri Foto
								</Text>
							</Pressable>

							<Pressable
								onPress={takePhoto}
								disabled={uploading}
								className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50/70 py-3.5 active:bg-sky-100"
							>
								<Ionicons name="camera-outline" size={18} color="#0284C7" />
								<Text className="text-xs font-bold text-[#0284c7]">
									Ambil Foto
								</Text>
							</Pressable>
						</View>

						{/* Submit Upload Button */}
						{selectedImageUri && (
							<Pressable
								onPress={handleUpload}
								disabled={uploading}
								className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#0284c7] py-4 shadow-md active:opacity-90 disabled:opacity-50"
							>
								{uploading ? (
									<>
										<ActivityIndicator color="#FFFFFF" />
										<Text className="text-xs font-bold text-white">
											Mengupload...
										</Text>
									</>
								) : (
									<>
										<Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
										<Text className="text-xs font-bold text-white">
											Upload & Simpan
										</Text>
									</>
								)}
							</Pressable>
						)}
					</View>

					{/* Information Card */}
					<View className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4">
						<View className="flex-row items-center gap-2 mb-2">
							<Ionicons name="information-circle-outline" size={18} color="#0284C7" />
							<Text className="text-xs font-bold text-slate-800">
								Panduan Konfirmasi QRIS
							</Text>
						</View>
						<Text className="text-[11px] text-slate-600 leading-relaxed">
							1. Pastikan aplikasi merchant (GoBiz / DANA Bisnis / BRI Merchant / Livin' Merchant) di HP kasir selalu mengaktifkan suara & notifikasi transaksi masuk.{"\n"}
							2. Ketika pelanggan scan & bayar QRIS di meja, kasir akan menerima notifikasi dana masuk.{"\n"}
							3. Kasir cukup tap tombol <Text className="font-bold text-emerald-700">"Konfirmasi QRIS"</Text> di POS untuk mengirim pesanan ke dapur.
						</Text>
					</View>
				</ScrollView>
			)}
		</ScreenContainer>
	);
}
