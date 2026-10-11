import { ScrollView, Pressable, Text, View } from "react-native";
import { OrderFilter, OrderFilterCounts } from "../types/order";

type Props = {
	filters: OrderFilter[];
	selected: OrderFilter;
	counts: OrderFilterCounts;
	onSelect: (filter: OrderFilter) => void;
};

function countChip(filter: OrderFilter, active: boolean) {
	if (active) return "bg-white/20";
	if (filter === "New") return "bg-sky-100 dark:bg-sky-950";
	if (filter === "Preparing") return "bg-amber-100 dark:bg-amber-950";
	if (filter === "Ready") return "bg-emerald-100 dark:bg-emerald-950";
	if (filter === "Canceled") return "bg-rose-100 dark:bg-rose-950";
	return "bg-slate-200 dark:bg-slate-700";
}

function countText(filter: OrderFilter, active: boolean) {
	if (active) return "text-white";
	if (filter === "New") return "text-sky-700 dark:text-sky-300";
	if (filter === "Preparing") return "text-amber-800 dark:text-amber-300";
	if (filter === "Ready") return "text-emerald-700 dark:text-emerald-300";
	if (filter === "Canceled") return "text-rose-700 dark:text-rose-300";
	return "text-slate-600 dark:text-slate-300";
}

export default function OrderStatusFilter({
	filters,
	selected,
	counts,
	onSelect,
}: Props) {
	return (
		<View className="px-4 pt-3 pb-1">
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className="flex-grow-0 rounded-2xl border border-white/60 bg-slate-200/70 p-1 dark:border-slate-700 dark:bg-slate-800/80"
				contentContainerClassName="items-center gap-1"
			>
				{filters.map((filter) => {
					const isActive = filter === selected;
					const count = counts[filter];
					const label =
						filter === "All" && isActive
							? `All (${count})`
							: filter;

					return (
						<Pressable
							key={filter}
							onPress={() => onSelect(filter)}
							className={`flex-shrink-0 flex-row items-center gap-1 rounded-xl px-3 py-1.5 ${
								isActive
									? "bg-sky-600 shadow-md shadow-sky-500/25"
									: ""
							}`}
						>
							<Text
								className={`text-xs font-bold ${
									isActive
										? "text-white"
										: "font-semibold text-slate-600 dark:text-slate-300"
								}`}
							>
								{label}
							</Text>
							{filter !== "All" && count > 0 ? (
								<View
									className={`min-w-[18px] items-center rounded-full px-1.5 ${countChip(filter, isActive)}`}
								>
									<Text
										className={`font-mono text-[10px] font-bold ${countText(filter, isActive)}`}
									>
										{count}
									</Text>
								</View>
							) : null}
						</Pressable>
					);
				})}
			</ScrollView>
		</View>
	);
}
