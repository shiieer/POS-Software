import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProfileView } from "../hooks/useProfile";

type Props = {
	profile: ProfileView;
};

export default function ProfileAvatarCard({ profile }: Props) {
	return (
		<View className="items-center overflow-hidden rounded-3xl border border-sky-100/80 bg-white p-6">
			<View className="relative mb-3">
				<View className="h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-sky-200 bg-[#0284c7]">
					<Text className="text-3xl font-bold text-white">
						{profile.initials}
					</Text>
				</View>
				<View className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-xl bg-[#0284c7] shadow-md ring-2 ring-white">
					<Ionicons name="camera" size={15} color="#FFFFFF" />
				</View>
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
