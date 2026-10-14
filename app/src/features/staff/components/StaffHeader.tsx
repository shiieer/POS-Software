import { Pressable, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMerchantName } from "@/shared/hooks/useMerchantName";

type Props = {
	onBack: () => void;
};

export default function StaffHeader({ onBack }: Props) {
	const merchantName = useMerchantName();
	return (
		<View className="h-16 flex-row items-center justify-between border-b border-sky-100 bg-white/90 px-4">
			<Pressable
				onPress={onBack}
				className="h-9 w-9 items-center justify-center rounded-xl"
			>
				<Ionicons name="chevron-back" size={22} color="#0284C7" />
			</Pressable>
			<View className="flex-row items-center gap-2">
				<View className="h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50">
					<Ionicons name="cafe" size={18} color="#0284C7" />
				</View>
				<View>
					<View className="flex-row items-center gap-1.5">
						<Text className="text-base font-bold tracking-tight text-slate-900">
							{merchantName}
						</Text>
						<View className="rounded-md bg-sky-100/70 px-1.5 py-0.5">
							<Text className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7]">
								POS
							</Text>
						</View>
					</View>
					<Text className="text-[11px] font-medium text-slate-400">
						Staff & Roles
					</Text>
				</View>
			</View>
			<View className="h-9 w-9" />
		</View>
	);
}
