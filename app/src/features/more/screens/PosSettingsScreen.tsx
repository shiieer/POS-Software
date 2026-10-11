import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "@/shared/components/ScreenContainer";
import { fetchQrisSettingApi, updateMerchantNameApi } from "@/services/api/settings.api";

type Props = {
	onBack: () => void;
};

export default function PosSettingsScreen({ onBack }: Props) {
	const [merchantName, setMerchantName] = useState("POS System");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchQrisSettingApi()
			.then((setting) => setMerchantName(setting.merchant_name || "POS System"))
			.catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load POS settings"))
			.finally(() => setLoading(false));
	}, []);

	async function saveName() {
		const name = merchantName.trim();
		if (!name) {
			setError("Enter a POS name before saving.");
			setMessage(null);
			return;
		}

		try {
			setSaving(true);
			setError(null);
			const setting = await updateMerchantNameApi(name);
			setMerchantName(setting.merchant_name);
			setMessage("POS name saved.");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not save POS name");
			setMessage(null);
		} finally {
			setSaving(false);
		}
	}

	return (
		<ScreenContainer showHeader={false}>
			<View className="h-16 flex-row items-center justify-between border-b border-sky-100 bg-white/80 px-4">
				<Pressable onPress={onBack} className="h-10 w-10 items-center justify-center rounded-full" accessibilityLabel="Go back">
					<Ionicons name="arrow-back" size={22} color="#334155" />
				</Pressable>
				<View className="items-center">
					<Text className="text-[10px] font-bold uppercase tracking-widest text-[#0284c7]">{merchantName || "POS System"}</Text>
					<Text className="text-base font-bold text-slate-800">App Settings</Text>
				</View>
				<View className="h-10 w-10" />
			</View>

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#0284C7" />
				</View>
			) : (
				<ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 py-5">
					<View className="rounded-3xl border border-sky-100 bg-white p-5">
						<View className="mb-4 flex-row items-center gap-3">
							<View className="h-10 w-10 items-center justify-center rounded-xl bg-sky-50">
								<Ionicons name="storefront-outline" size={20} color="#0284C7" />
							</View>
							<View>
								<Text className="text-sm font-bold text-slate-800">POS name</Text>
								<Text className="text-xs text-slate-500">Shown in the app and customer menu</Text>
							</View>
						</View>
						<TextInput
							value={merchantName}
							onChangeText={(value) => {
								setMerchantName(value);
								setMessage(null);
								setError(null);
							}}
							placeholder="Enter your POS name"
							maxLength={100}
							className="mb-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800"
						/>
						{message ? <Text className="mb-3 text-xs font-semibold text-emerald-700">{message}</Text> : null}
						{error ? <Text className="mb-3 text-xs font-semibold text-rose-600">{error}</Text> : null}
						<Pressable onPress={saveName} disabled={saving} className="items-center rounded-2xl bg-[#0284c7] py-3.5 disabled:opacity-50">
							<Text className="text-sm font-bold text-white">{saving ? "Saving..." : "Save POS Name"}</Text>
						</Pressable>
					</View>
				</ScrollView>
			)}
		</ScreenContainer>
	);
}
