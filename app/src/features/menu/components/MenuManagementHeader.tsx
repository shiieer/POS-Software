import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AvailabilityFilter } from "../types/menu";
import { useOrientationLayout } from "@/shared/hooks/useOrientationLayout";

const FILTER_LABEL: Record<AvailabilityFilter, string> = {
	all: "Filter",
	"in-stock": "In Stock",
	"out-of-stock": "Sold Out",
};

type Props = {
	availabilityFilter: AvailabilityFilter;
	onSelectFilter: (filter: AvailabilityFilter) => void;
	onAddItem?: () => void;
};

export default function MenuManagementHeader({
	availabilityFilter,
	onSelectFilter,
	onAddItem,
}: Props) {
	const { isLandscape } = useOrientationLayout();
	const [showFilterOptions, setShowFilterOptions] = useState(false);
	const filtered = availabilityFilter !== "all";
	const filterOptions: AvailabilityFilter[] = [
		"all",
		"in-stock",
		"out-of-stock",
	];

	return (
		<View
			className="relative z-50 mb-1 flex-row items-center justify-between px-4 pt-4"
			style={{ zIndex: 50, elevation: 20 }}
		>
			<View className="flex-1 pr-3">
				<Text className="text-xl font-bold text-[#111C2D]">
					Menu Management
				</Text>
				<Text className="mt-0.5 text-xs text-[#3F4850]">
					Manage live item availability, recipes & pricing
				</Text>
			</View>
			<View
				className="relative z-50 flex-row items-center gap-2"
				style={{ zIndex: 51 }}
			>
				<Pressable
					onPress={() => setShowFilterOptions((visible) => !visible)}
					className={`flex-row items-center gap-1.5 rounded-xl border bg-white px-3.5 py-1.5 shadow-sm ${
						filtered ? "border-[#0284C7]" : "border-[#BFC7D2]"
					}`}
				>
					<Ionicons name="options-outline" size={18} color="#0284C7" />
					<Text className="text-xs font-semibold text-[#111C2D]">
						{FILTER_LABEL[availabilityFilter]}
					</Text>
				</Pressable>
				{showFilterOptions ? (
					<View
						className="absolute top-11 z-50 min-w-[150px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
						style={{ zIndex: 52, elevation: 22 }}
					>
						{filterOptions.map((option) => (
							<Pressable
								key={option}
								onPress={() => {
									onSelectFilter(option);
									setShowFilterOptions(false);
								}}
								className={`flex-row items-center justify-between rounded-lg px-3 py-2.5 ${availabilityFilter === option ? "bg-sky-50" : ""}`}
							>
								<Text
									className={`text-xs font-semibold ${availabilityFilter === option ? "text-sky-700" : "text-slate-700"}`}
								>
									{FILTER_LABEL[option] === "Filter"
										? "All Items"
										: FILTER_LABEL[option]}
								</Text>
								{availabilityFilter === option ? (
									<Ionicons name="checkmark" size={16} color="#0284C7" />
								) : null}
							</Pressable>
						))}
					</View>
				) : null}
				{isLandscape && onAddItem ? (
					<Pressable
						onPress={onAddItem}
						className="flex-row items-center gap-1.5 rounded-xl bg-[#0284C7] px-3.5 py-1.5 shadow"
					>
						<Ionicons name="add" size={18} color="#FFFFFF" />
						<Text className="text-xs font-semibold text-white">New Item</Text>
					</Pressable>
				) : null}
			</View>
		</View>
	);
}
