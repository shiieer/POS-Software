import { FlatList, Text, View } from "react-native";
import { GRID } from "@/constants/layout";
import { useGridColumns } from "@/shared/hooks/useGridColumns";
import { MenuItem } from "@/types/menu";
import ProductCard from "./ProductCard";

type Props = {
	items: MenuItem[];
	categoryLabel: string;
	getItemQuantity: (menuItemId: number) => number;
	getItemNote?: (menuItemId: number) => string | undefined;
	onIncreaseItem: (item: MenuItem) => void;
	onDecreaseItem: (item: MenuItem) => void;
	onEditDetail?: (item: MenuItem) => void;
	contentWidth?: number;
	bottomInset?: number;
};

export default function ProductGrid({
	items,
	categoryLabel,
	getItemQuantity,
	getItemNote,
	onIncreaseItem,
	onDecreaseItem,
	onEditDetail,
	contentWidth,
	bottomInset = 24,
}: Props) {
	const { numColumns, cardWidth } = useGridColumns(contentWidth);

	return (
		<FlatList
			data={items}
			key={numColumns}
			numColumns={numColumns}
			keyExtractor={(item) => String(item.id)}
			contentContainerStyle={{
				paddingHorizontal: GRID.padding,
				paddingBottom: bottomInset,
			}}
			columnWrapperStyle={numColumns > 1 ? { gap: GRID.gap } : undefined}
			ListHeaderComponent={
				<View className="mb-3 flex-row items-center justify-between px-1">
					<View className="flex-1 pr-3">
						<Text className="text-base font-bold tracking-tight text-slate-900">
							{categoryLabel}
						</Text>
						<Text className="text-xs font-medium text-slate-500">
							Tap any item to quickly add to current ticket
						</Text>
					</View>
					<View className="rounded-lg border border-slate-200 bg-white px-2.5 py-1">
						<Text className="text-xs font-semibold text-slate-500">
							{items.length} items
						</Text>
					</View>
				</View>
			}
			ListEmptyComponent={
				<Text className="mt-10 text-center text-brand-muted">
					No items in this category
				</Text>
			}
			renderItem={({ item }) => (
				<ProductCard
					item={item}
					cardWidth={cardWidth}
					quantity={getItemQuantity(item.id)}
					note={getItemNote?.(item.id)}
					onIncrease={onIncreaseItem}
					onDecrease={onDecreaseItem}
					onEditDetail={onEditDetail}
				/>
			)}
		/>
	);
}
