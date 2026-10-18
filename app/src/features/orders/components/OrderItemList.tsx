import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatRp } from "@/utils";
import { useAppTheme } from "@/shared/theme/ThemeProvider";
import { OrderLineItem } from "../types/order";

type Props = {
	items: OrderLineItem[];
	compact?: boolean;
};

function isAlertNote(note: string) {
	const lower = note.toLowerCase();
	return (
		lower.includes("spicy") ||
		lower.includes("chili") ||
		lower.includes("hot") ||
		lower.includes("pedas") ||
		lower.includes("extra") ||
		lower.includes("side")
	);
}

export default function OrderItemList({ items, compact }: Props) {
	const { isDark } = useAppTheme();

	return (
		<View className={compact ? "gap-1.5 py-1" : "gap-2.5 py-3"}>
			{items.map((item, index) => {
				const alert = item.note ? isAlertNote(item.note) : false;

				return (
					<View
						key={item.id}
						className="flex-row items-start justify-between"
					>
						<View className="flex-1 flex-row items-start gap-2 pr-2">
							<View
								className={`mt-0.5 h-5 min-w-[20px] shrink-0 items-center justify-center rounded-lg px-0.5 ${
									index === 0
										? "bg-sky-100 dark:bg-sky-950"
										: "bg-slate-100 dark:bg-slate-800"
								}`}
							>
								<Text
									className={`font-mono text-xs font-bold ${
										index === 0
											? "text-sky-700 dark:text-sky-300"
											: "text-slate-700 dark:text-slate-300"
									}`}
								>
									{item.quantity}x
								</Text>
							</View>

							<View className="flex-1">
								<Text
									className={`${compact ? "text-xs" : "text-sm"} font-semibold text-slate-800 dark:text-slate-100`}
								>
									{item.name}
								</Text>
								{item.note ? (
									<View
										className={`mt-0.5 flex-row items-start gap-1 ${
											alert
												? "border-l-2 border-amber-400 pl-2"
												: ""
										}`}
									>
										{!alert ? (
											<Ionicons
												name="options-outline"
												size={12}
												color={
													isDark ? "#7DD3FC" : "#0284C7"
												}
											/>
										) : null}
										<Text
											className={`text-[11px] font-medium ${
												alert
													? "text-amber-700 dark:text-amber-300"
													: "text-sky-600 dark:text-sky-400"
											}`}
										>
											{item.note}
										</Text>
									</View>
								) : null}
							</View>
						</View>

						<Text className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
							{formatRp(item.subtotal)}
						</Text>
					</View>
				);
			})}
		</View>
	);
}
