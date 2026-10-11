import {
	ActivityIndicator,
	FlatList,
	Pressable,
	Text,
	View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMenuManagement } from "../hooks/useMenuManagement";
import ScreenContainer from "@/shared/components/ScreenContainer";
import MenuManagementHeader from "../components/MenuManagementHeader";
import MenuCategoryFilter from "../components/MenuCategoryFilter";
import MenuSearchBanner from "../components/MenuSearchBanner";
import MenuItemCard from "../components/MenuItemCard";
import { ManagedMenuItem } from "../types/menu";
import Toast from "@/shared/components/Toast";

type Props = {
	onAddItem: () => void;
	onEditItem: (item: ManagedMenuItem) => void;
	successMessage?: string | null;
};

export default function MenuScreen({
	onAddItem,
	onEditItem,
	successMessage,
}: Props) {
	const {
		items,
		stats,
		categories,
		selectedCategories,
		toggleCategory,
		searchQuery,
		setSearchQuery,
		availabilityFilter,
		setAvailabilityFilter,
		loading,
		error,
		toggleAvailability,
	} = useMenuManagement();

	return (
		<ScreenContainer>
			<MenuManagementHeader
				availabilityFilter={availabilityFilter}
				onSelectFilter={setAvailabilityFilter}
				onAddItem={onAddItem}
			/>

			<MenuCategoryFilter
				categories={categories}
				selected={selectedCategories}
				onSelect={toggleCategory}
				allCount={stats.total}
			/>

			<MenuSearchBanner
				value={searchQuery}
				onChangeText={setSearchQuery}
				activeCount={stats.active}
				soldOutCount={stats.soldOut}
			/>

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#0284C7" />
				</View>
			) : error ? (
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-center text-red-500">{error}</Text>
				</View>
			) : (
				<View className="flex-1">
					<FlatList
						className="flex-1"
						data={items}
						keyExtractor={(item) => String(item.id)}
						contentContainerClassName="px-4 py-3 pb-24"
						showsVerticalScrollIndicator={false}
						ListEmptyComponent={
							<Text className="mt-10 text-center text-brand-muted">
								No menu items found
							</Text>
						}
						renderItem={({ item, index }) => (
							<MenuItemCard
								item={item}
								featured={index === 0 && item.isAvailable}
								onPress={() => onEditItem(item)}
								onToggle={toggleAvailability}
							/>
						)}
					/>

					<Toast message={successMessage ?? null} type="success" />

					<Pressable
						onPress={onAddItem}
						className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue shadow-lg shadow-sky-500/30"
						accessibilityLabel="Add menu item"
					>
						<Ionicons name="add" size={30} color="#FFFFFF" />
					</Pressable>
				</View>
			)}
		</ScreenContainer>
	);
}
