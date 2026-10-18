import { ReactNode } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

type Props = {
	icon: IoniconName;
	iconColor?: string;
	title: string;
	badge?: string;
	managed?: boolean;
	children: ReactNode;
};

export default function SectionCard({
	icon,
	iconColor = "#0284C7",
	title,
	badge,
	managed,
	children,
}: Props) {
	return (
		<View className="overflow-hidden rounded-2xl border border-sky-100 bg-white">
			<View className="flex-row items-center justify-between border-b border-sky-100 bg-sky-50/70 px-5 py-3.5">
				<View className="flex-row items-center gap-2">
					<Ionicons name={icon} size={18} color={iconColor} />
					<Text className="text-[12px] font-bold uppercase tracking-wider text-slate-700">
						{title}
					</Text>
				</View>

				{managed ? (
					<View className="flex-row items-center gap-1">
						<Ionicons name="lock-closed-outline" size={14} color="#94A3B8" />
						<Text className="text-[11px] font-medium text-slate-400">
							Managed
						</Text>
					</View>
				) : badge ? (
					<View className="rounded-full bg-sky-100/70 px-2 py-0.5">
						<Text className="text-[10px] font-semibold text-[#0284c7]">
							{badge}
						</Text>
					</View>
				) : null}
			</View>

			<View className="divide-y divide-slate-100">{children}</View>
		</View>
	);
}
