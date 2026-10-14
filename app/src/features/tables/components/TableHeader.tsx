import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMerchantName } from "@/shared/hooks/useMerchantName";

type Props = {
	onBack: () => void;
};

export default function TableHeader({ onBack }: Props) {
	const merchantName = useMerchantName();
	return (
		<View className="h-16 flex-row items-center justify-between border-b border-[#DEE8FF]/60 bg-[#F9F9FF] px-4">
			<Pressable
				onPress={onBack}
				className="h-10 w-10 items-center justify-center rounded-xl"
			>
				<Ionicons name="chevron-back" size={24} color="#006194" />
			</Pressable>
			<View className="flex-row items-center gap-1.5">
				<Ionicons name="cafe" size={22} color="#006194" />
				<Text className="text-lg font-bold tracking-tight text-[#006194]">
					{merchantName}
				</Text>
			</View>
			<View className="h-10 w-10" />
		</View>
	);
}
