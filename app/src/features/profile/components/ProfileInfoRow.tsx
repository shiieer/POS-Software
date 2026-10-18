import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type BadgeTone = "active" | "muted";

type Props = {
	label: string;
	value: string;
	mono?: boolean;
	onPress?: () => void;
	trailing?: "edit" | "chevron" | "domain" | "none";
	badge?: { label: string; tone: BadgeTone };
	hint?: string;
};

export default function ProfileInfoRow({
	label,
	value,
	mono = false,
	onPress,
	trailing = "none",
	badge,
	hint,
}: Props) {
	return (
		<Pressable
			onPress={onPress}
			disabled={!onPress}
			className="flex-row items-center justify-between px-5 py-3.5"
		>
			<View className="flex-1 pr-3">
				<Text className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
					{label}
				</Text>
				<Text
					className={`mt-0.5 text-sm ${
						mono
							? "font-bold tracking-wide text-slate-800"
							: "font-medium text-slate-800"
					}`}
				>
					{value}
				</Text>
			</View>

			{badge ? (
				<View
					className={`flex-row items-center gap-1 rounded-md border px-2 py-0.5 ${
						badge.tone === "active"
							? "border-emerald-200/60 bg-emerald-50"
							: "border-slate-200 bg-slate-100"
					}`}
				>
					<View
						className={`h-1.5 w-1.5 rounded-full ${
							badge.tone === "active" ? "bg-emerald-500" : "bg-slate-400"
						}`}
					/>
					<Text
						className={`text-[11px] font-semibold ${
							badge.tone === "active" ? "text-emerald-700" : "text-slate-500"
						}`}
					>
						{badge.label}
					</Text>
				</View>
			) : hint ? (
				<Text className="text-xs text-slate-400">{hint}</Text>
			) : trailing === "edit" ? (
				<Ionicons name="create-outline" size={20} color="#CBD5E1" />
			) : trailing === "chevron" ? (
				<Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
			) : trailing === "domain" ? (
				<Ionicons name="business-outline" size={18} color="#CBD5E1" />
			) : null}
		</Pressable>
	);
}
