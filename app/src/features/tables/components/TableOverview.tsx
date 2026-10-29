import { Pressable, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
	onAdd: () => void;
	canAdd?: boolean;
};

export default function TableOverview({ onAdd, canAdd = true }: Props) {
	return (
		<View className="flex-row items-start justify-between gap-4 px-4 pt-4">
			<View className="flex-1 pr-2">
				<Text className="text-2xl font-bold tracking-tight text-[#111C2D]">
					Table Management
				</Text>
				<Text className="mt-1 text-sm font-normal text-[#707881]">
					{canAdd
						? "Manage physical tables and generate QR codes for ordering."
						: "Lihat kode QR meja untuk pemesanan pelanggan."}
				</Text>
			</View>
			{canAdd && (
				<Pressable
					onPress={onAdd}
					className="flex-row items-center gap-2 rounded-xl bg-[#006194] px-4 py-2.5"
					style={{
						shadowColor: "#006194",
						shadowOpacity: 0.3,
						shadowRadius: 8,
						shadowOffset: { width: 0, height: 2 },
					}}
				>
					<Ionicons name="add" size={20} color="#FFFFFF" />
					<Text className="text-sm font-semibold text-white">
						Add Table
					</Text>
				</Pressable>
			)}
		</View>
	);
}
