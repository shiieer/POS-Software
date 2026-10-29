import { Pressable, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TableApi } from "@/types/api/table";

type Props = {
	table: TableApi;
	onViewQr: () => void;
	onManage?: () => void;
	isAdmin?: boolean;
};

export default function TableCard({
	table,
	onViewQr,
	onManage,
	isAdmin = true,
}: Props) {
	const active = table.is_active;
	const handlePress = isAdmin && onManage ? onManage : onViewQr;

	return (
		<View className="mb-4 overflow-hidden rounded-2xl border border-[#DEE8FF]/80 bg-white p-4">
			<View
				className={`absolute left-0 right-0 top-0 h-1.5 ${
					active ? "bg-[#0284C7]" : "bg-[#F87171]"
				}`}
			/>
			<Pressable
				onPress={handlePress}
				onLongPress={isAdmin && onManage ? onManage : undefined}
				delayLongPress={350}
				accessibilityRole="button"
				accessibilityLabel={
					isAdmin
						? `${table.name}. Tap or press and hold for table actions`
						: `${table.name}. Tap to view QR code`
				}
				className="mt-1 items-center"
			>
				<View
					className={`mb-3 h-14 w-14 items-center justify-center rounded-2xl ${
						active ? "bg-[#F0F3FF]" : "bg-[#FFDADB]/50"
					}`}
				>
					<Ionicons name="grid" size={28} color={active ? "#0284C7" : "#B90538"} />
				</View>
				<Text className="text-center text-base font-bold text-[#111C2D]">{table.name}</Text>
				<View className={`mt-1.5 rounded-full px-2.5 py-0.5 ${active ? "bg-[#E0F2FE]" : "bg-[#FFE4E6]"}`}>
					<Text className={`text-[11px] font-bold tracking-wide ${active ? "text-[#0284C7]" : "text-[#BE123C]"}`}>
						{active ? "ACTIVE" : "INACTIVE"}
					</Text>
				</View>
			</Pressable>
			<Pressable
				onPress={onViewQr}
				className={`mt-4 w-full flex-row items-center justify-center gap-1.5 rounded-xl border py-2 ${
					active ? "border-[#0284C7]/20 bg-[#F0F3FF]" : "border-[#BFC7D2]/40 bg-[#F0F3FF]"
				}`}
			>
				<Ionicons name="qr-code-outline" size={17} color={active ? "#0284C7" : "#3F4850"} />
				<Text className={`text-xs font-bold ${active ? "text-[#0284C7]" : "text-[#3F4850]"}`}>
					View QR
				</Text>
			</Pressable>
		</View>
	);
}
