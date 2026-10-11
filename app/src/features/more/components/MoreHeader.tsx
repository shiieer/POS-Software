import { View, Text } from "react-native";

export default function MoreHeader() {
	return (
		<View className="h-14 flex-row items-center justify-between border-b border-slate-200/80 bg-white px-4">
			<View className="flex-row items-center gap-2">
				<Text className="text-lg font-extrabold text-slate-900">
					Settings
				</Text>
				<View className="rounded-full bg-sky-50 px-2 py-0.5">
					<Text className="text-[10px] font-bold uppercase tracking-wide text-sky-600">
						POS
					</Text>
				</View>
			</View>
		</View>
	);
}
