import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { uploadAvatarApi } from "@/services/api/auth.api";
import { UserApi } from "@/types/api/user";
import { ProfileView } from "../hooks/useProfile";

type Props = {
	profile: ProfileView;
	onAvatarUpdated: (updated: UserApi) => void;
};

export default function ProfileAvatarCard({ profile, onAvatarUpdated }: Props) {
	const [uploading, setUploading] = useState(false);

	async function handlePickImage() {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			Alert.alert(
				"Permission required",
				"Allow photo library access to set a profile picture.",
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (result.canceled || !result.assets[0]) return;

		const uri = result.assets[0].uri;
		setUploading(true);
		try {
			const updated = await uploadAvatarApi(uri);
			onAvatarUpdated(updated);
		} catch {
			Alert.alert("Upload failed", "Could not upload profile picture. Please try again.");
		} finally {
			setUploading(false);
		}
	}

	const avatarUrl = profile.user.avatar_url;

	return (
		<View className="items-center overflow-hidden rounded-3xl border border-sky-100/80 bg-white p-6">
			<View className="relative mb-3">
				<Pressable
					onPress={handlePickImage}
					disabled={uploading}
					accessibilityLabel="Change profile picture"
					className="h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-sky-200 bg-[#0284c7]"
				>
					{avatarUrl ? (
						<Image
							source={{ uri: avatarUrl }}
							style={{ width: 96, height: 96 }}
							contentFit="cover"
							transition={200}
						/>
					) : (
						<Text className="text-3xl font-bold text-white">
							{profile.initials}
						</Text>
					)}
				</Pressable>

				<Pressable
					onPress={handlePickImage}
					disabled={uploading}
					accessibilityLabel="Change profile picture"
					className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-xl bg-[#0284c7] shadow-md ring-2 ring-white"
				>
					{uploading ? (
						<ActivityIndicator size="small" color="#FFFFFF" />
					) : (
						<Ionicons name="camera" size={15} color="#FFFFFF" />
					)}
				</Pressable>
			</View>

			<Text className="text-xl font-bold tracking-tight text-slate-800">
				{profile.displayName}
			</Text>

			<View className="mt-2 flex-row flex-wrap items-center justify-center gap-2">
				<View className="flex-row items-center gap-1 rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1">
					<View className="h-1.5 w-1.5 rounded-full bg-sky-500" />
					<Text className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
						{profile.roleLabel}
					</Text>
				</View>
				<View className="rounded-full bg-slate-100 px-2.5 py-1">
					<Text className="text-[11px] font-semibold text-slate-500">
						@{profile.user.username}
					</Text>
				</View>
				{profile.user.account_code ? (
					<View className="rounded-full border border-sky-200/70 bg-sky-50 px-2.5 py-1">
						<Text className="text-[11px] font-bold text-sky-700">
							ID: {profile.user.account_code}
						</Text>
					</View>
				) : null}
			</View>

			<View className="mt-5 w-full flex-row border-t border-slate-100 pt-4">
				<View className="flex-1 items-center">
					<Text className="text-sm font-bold text-slate-800">
						{profile.ordersToday}
					</Text>
					<Text className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
						Orders Today
					</Text>
				</View>
				<View className="flex-1 items-center border-x border-slate-100">
					<Text className="text-sm font-bold text-sky-600">
						{profile.roleLabel}
					</Text>
					<Text className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
						Role
					</Text>
				</View>
				<View className="flex-1 items-center">
					<Text className="text-sm font-bold text-slate-800">
						{profile.tenureLabel}
					</Text>
					<Text className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
						Tenure
					</Text>
				</View>
			</View>
		</View>
	);
}
