import { Pressable, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMerchantName } from "@/shared/hooks/useMerchantName";

type Props = {
	onBack: () => void;
};

export default function ReportsHeader({ onBack }: Props) {
	const merchantName = useMerchantName();
	return (
		<View className="h-16 flex-row items-center justify-between border-b border-cyan-100/80 bg-white/80 px-4">
			<Pressable
				onPress={onBack}
				className="h-9 w-9 items-center justify-center rounded-xl"
			>
				<Ionicons name="chevron-back" size={22} color="#0284C7" />
			</Pressable>
			<View className="flex-row items-center gap-2.5">
				<View className="h-9 w-9 items-center justify-center rounded-xl bg-[#0284C7]">
					<Ionicons name="cafe" size={18} color="#FFFFFF" />
				</View>
				<View>
					<Text className="text-[17px] font-bold leading-tight tracking-tight text-slate-900">
						{merchantName}
					</Text>
					<Text className="text-[10px] font-semibold uppercase tracking-wider text-[#0284C7]">
						POS & Analytics
					</Text>
				</View>
			</View>
			<View className="h-9 w-9" />
		</View>
	);
}
