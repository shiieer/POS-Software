import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ShiftMetrics } from "../types/order";

type Props = {
	metrics: ShiftMetrics;
};

const cardClass =
	"w-full max-w-sm overflow-hidden rounded-2xl border border-sky-100/90 bg-white/90 p-3 dark:border-slate-800 dark:bg-slate-900/90";

export default function ShiftOverview({ metrics }: Props) {
	return (
		<View className="px-4 pt-3">
			<View className={cardClass}>
				<Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
					In Queue
				</Text>
				<View className="mt-1 flex-row items-baseline gap-1">
					<Text className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
						{metrics.inQueue}
					</Text>
					<Text className="text-[10px] font-semibold text-sky-600 dark:text-sky-400">
						tik
					</Text>
				</View>
				<View className="mt-1 flex-row items-center">
					<Ionicons name="trending-up" size={13} color="#34D399" />
					<Text className="ml-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
						+{metrics.newCount} new
					</Text>
				</View>
			</View>
		</View>
	);
}
