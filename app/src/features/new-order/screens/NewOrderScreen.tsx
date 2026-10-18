import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import ScreenContainer from "@/shared/components/ScreenContainer";
import CategoryFilter from "../components/CategoryFilter";
import ProductGrid from "../components/ProductGrid";
import CartPanel from "../components/CartPanel";
import CartBar from "../components/CartBar";
import ItemDetailModal from "../components/ItemDetailModal";
import { useNewOrder } from "../hooks/useNewOrder";
import { MenuItem } from "@/types/menu";
import { CartItem } from "../types/cart";
import Toast from "@/shared/components/Toast";
import { useOrientationLayout } from "@/shared/hooks/useOrientationLayout";

export default function NewOrderScreen() {
	const {
		categories,
		selectedCategories,
		selectedCategoryLabel,
		toggleCategory,
		filteredItems,
		loading,
		error,
		successMessage,
		cart,
		cartCount,
		cartTotal,
		menuItems,
		getItemQuantity,
		getItemNote,
		increaseItem,
		decreaseItem,
		updateItemNote,
		clearCart,
		submitOrder,
		submitting,
	} = useNewOrder();
	const { isLandscape, width } = useOrientationLayout();
	const [editingItem, setEditingItem] = useState<{
		menuItemId: number;
		name: string;
		note?: string;
	} | null>(null);
	const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
	const [isPaid, setIsPaid] = useState(false);

	const handleDecreaseFromMenu = (item: MenuItem) => {
		decreaseItem(item.id);
	};

	const handleEditDetailFromMenu = (item: MenuItem) => {
		setEditingItem({
			menuItemId: item.id,
			name: item.name,
			note: getItemNote(item.id),
		});
	};

	const handleEditDetailFromCart = (item: CartItem) => {
		setEditingItem({
			menuItemId: item.menuItemId,
			name: item.name,
			note: item.note,
		});
	};

	const railWidth = isLandscape ? 200 : 0;
	const sidebarWidth = isLandscape ? 336 : 0;
	const catalogWidth = Math.max(280, width - railWidth - sidebarWidth);

	const cartActions = {
		onIncrease: (id: number) => {
			const item = menuItems.find((menuItem) => menuItem.id === id);
			if (item) increaseItem(item);
		},
		onDecrease: decreaseItem,
		onUpdateNote: updateItemNote,
		onEditDetail: handleEditDetailFromCart,
		onClear: clearCart,
		onSubmit: () => submitOrder(paymentMethod, isPaid),
		paymentMethod,
		isPaid,
		onPaymentMethodChange: setPaymentMethod,
		onIsPaidChange: setIsPaid,
	};

	const catalog = (
		<View className="min-w-0 flex-1">
			<CategoryFilter
				categories={categories}
				selected={selectedCategories}
				onSelect={toggleCategory}
			/>
			<ProductGrid
				items={filteredItems}
				categoryLabel={selectedCategoryLabel}
				contentWidth={catalogWidth}
				bottomInset={isLandscape ? 24 : cartCount > 0 ? 8 : 24}
				getItemQuantity={getItemQuantity}
				getItemNote={getItemNote}
				onIncreaseItem={increaseItem}
				onDecreaseItem={handleDecreaseFromMenu}
				onEditDetail={handleEditDetailFromMenu}
			/>
		</View>
	);

	return (
		<ScreenContainer>
			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#0284C7" />
				</View>
			) : error ? (
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-center text-red-500">{error}</Text>
				</View>
			) : (
				<>
					{isLandscape ? (
						<View className="flex-1 flex-row">
							{catalog}
							<CartPanel
								items={cart}
								total={cartTotal}
								submitting={submitting}
								{...cartActions}
							/>
						</View>
					) : (
						<>
							{catalog}
							<CartBar
								itemCount={cartCount}
								total={cartTotal}
								submitting={submitting}
								items={cart}
								{...cartActions}
							/>
						</>
					)}

					<ItemDetailModal
						visible={Boolean(editingItem)}
						item={editingItem}
						onClose={() => setEditingItem(null)}
						onSave={(id, note) => updateItemNote(id, note)}
					/>

					<Toast message={successMessage} type="success" />
				</>
			)}
		</ScreenContainer>
	);
}
