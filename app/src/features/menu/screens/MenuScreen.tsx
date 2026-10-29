import { useState } from "react";
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
import DeleteMenuItemModal from "../components/DeleteMenuItemModal";
import { ManagedMenuItem } from "../types/menu";
import Toast from "@/shared/components/Toast";
import { getErrorMessage } from "@/utils";

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
		deleteMenuItem,
	} = useMenuManagement();

	const [deleteTarget, setDeleteTarget] = useState<ManagedMenuItem | null>(null);
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [toastMsg, setToastMsg] = useState<string | null>(null);

	const handleConfirmDelete = async () => {
		if (!deleteTarget) return;
		try {
			setDeleting(true);
			setDeleteError(null);
			await deleteMenuItem(deleteTarget.id);
			setToastMsg("Menu item deleted successfully");
			setDeleteTarget(null);
		} catch (err) {
			setDeleteError(
				getErrorMessage(err, "Failed to delete menu item"),
			);
		} finally {
			setDeleting(false);
		}
	};

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
								onDelete={(target) => {
									setDeleteError(null);
									setDeleteTarget(target);
								}}
							/>
						)}
					/>

					<Toast message={toastMsg ?? successMessage ?? null} type="success" />

					<Pressable
						onPress={onAddItem}
						className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue shadow-lg shadow-sky-500/30"
						accessibilityLabel="Add menu item"
					>
						<Ionicons name="add" size={30} color="#FFFFFF" />
					</Pressable>

					<DeleteMenuItemModal
						item={deleteTarget}
						loading={deleting}
						errorMessage={deleteError}
						onCancel={() => {
							setDeleteTarget(null);
							setDeleteError(null);
						}}
						onConfirm={handleConfirmDelete}
					/>
				</View>
			)}
		</ScreenContainer>
	);
}
