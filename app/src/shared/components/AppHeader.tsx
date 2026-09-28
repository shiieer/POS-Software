import { View, Text, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function AppHeader() {
	return (
		<View className="h-14 flex-row items-center justify-between border-b border-[#D8E3FB]/80 bg-white px-4 shadow-sm">
			<View className="flex-row items-center gap-3">
				<View className="h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10">
					<MaterialCommunityIcons name="coffee" size={22} color="#0284C7" />
				</View>
				<View className="flex-row items-center">
					<Text className="text-base font-bold tracking-tight text-[#006194]">
						Kedai Affo
					</Text>
					<View className="ml-1.5 rounded-full bg-[#57DFFE]/20 px-2 py-0.5">
						<Text className="text-[11px] font-semibold uppercase tracking-wide text-[#0284C7]">
							POS
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
}
