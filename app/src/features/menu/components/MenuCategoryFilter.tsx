import { ScrollView, Pressable, Text } from "react-native";
import { ALL_ITEMS } from "../types/menu";

type Props = {
	categories: string[];
	selected: string[];
	onSelect: (category: string) => void;
	allCount: number;
};

export default function MenuCategoryFilter({
	categories,
	selected,
	onSelect,
	allCount,
}: Props) {
	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			className="flex-grow-0"
			contentContainerClassName="gap-2 px-4 py-2"
		>
			{categories.map((category) => {
				const isActive = selected.includes(category);
				const label =
					category === ALL_ITEMS
						? `All Items (${allCount})`
						: category;

				return (
					<Pressable
						key={category}
						onPress={() => onSelect(category)}
						className={`rounded-full px-4 py-2 ${
							isActive
								? "bg-brand-blue shadow-sm"
								: "border border-[#BFC7D2]/80 bg-white"
						}`}
					>
						<Text
							className={`text-xs font-semibold ${
								isActive ? "text-white" : "text-[#3F4850]"
							}`}
						>
							{label}
						</Text>
					</Pressable>
				);
			})}
		</ScrollView>
	);
}
