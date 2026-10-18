import { ScrollView, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getCategoryIcon } from "../utils/categoryIcon";

type Props = {
	categories: string[];
	selected: string[];
	onSelect: (category: string) => void;
};

export default function CategoryFilter({
	categories,
	selected,
	onSelect,
}: Props) {
	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			className="mt-3 flex-grow-0"
			contentContainerClassName="gap-2 px-4 py-1 mb-1"
		>
			{categories.map((category) => {
				const isActive = selected.includes(category);
				const icon = getCategoryIcon(category);

				return (
					<Pressable
						key={category}
						onPress={() => onSelect(category)}
						className={`flex-row items-center gap-1.5 rounded-full px-4 py-2 ${
							isActive
								? "bg-brand-blue"
								: "border border-slate-200/90 bg-white"
						}`}
						style={
							isActive
								? {
										shadowColor: "#0284C7",
										shadowOpacity: 0.28,
										shadowRadius: 6,
										shadowOffset: { width: 0, height: 2 },
									}
								: undefined
						}
					>
						<Ionicons
							name={icon}
							size={16}
							color={isActive ? "#FFFFFF" : "#475569"}
						/>
						<Text
							className={`text-[13px] ${
								isActive
									? "font-bold text-white"
									: "font-semibold text-slate-600"
							}`}
						>
							{category}
						</Text>
					</Pressable>
				);
			})}
		</ScrollView>
	);
}
