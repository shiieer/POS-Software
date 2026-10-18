import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchMenuApi } from "@/services/api/menu.api";
import { createOrderApi } from "@/services/api/order.api";
import { MenuItem } from "@/types/menu";
import { ALL_ITEMS, getErrorMessage } from "@/utils";
import { CartItem } from "../types/cart";
import { getCategoriesFromMenu, MapMenuItem } from "../utils/mapMenu";

export function useNewOrder() {
	const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
	const [categories, setCategories] = useState<string[]>([]);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([ALL_ITEMS]);
	const [cart, setCart] = useState<CartItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const loadMenu = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const data = await fetchMenuApi(true);
			const mapped = data.map(MapMenuItem);

			setMenuItems(mapped);
			const cats = getCategoriesFromMenu(mapped);
			setCategories([ALL_ITEMS, ...cats]);
			setSelectedCategories((prev) => prev.length ? prev : [ALL_ITEMS]);
		} catch (err) {
			setError(getErrorMessage(err, "Failed to load menu"));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadMenu();
	}, [loadMenu]);

	const filteredItems = useMemo(
		() =>
			selectedCategories.includes(ALL_ITEMS)
				? menuItems
				: menuItems.filter((item) => selectedCategories.includes(item.category)),
		[menuItems, selectedCategories],
	);

	const toggleCategory = (category: string) => {
		setSelectedCategories((current) => {
			if (category === ALL_ITEMS) return [ALL_ITEMS];

			const selected = current.filter((item) => item !== ALL_ITEMS);
			const next = selected.includes(category)
				? selected.filter((item) => item !== category)
				: [...selected, category];
			return next.length ? next : [ALL_ITEMS];
		});
	};
	const selectedCategoryLabel = selectedCategories.includes(ALL_ITEMS)
		? ALL_ITEMS
		: selectedCategories.join(", ");

	const getItemQuantity = (menuItemId: number) => {
		return cart.find((c) => c.menuItemId === menuItemId)?.quantity ?? 0;
	};

	const getItemNote = (menuItemId: number) => {
		return cart.find((c) => c.menuItemId === menuItemId)?.note;
	};

	const increaseItem = (item: MenuItem) => {
		setSuccessMessage(null);
		setCart((prev) => {
			const existing = prev.find((c) => c.menuItemId === item.id);
			if (existing) {
				return prev.map((c) =>
					c.menuItemId === item.id
						? { ...c, quantity: c.quantity + 1 }
						: c,
				);
			}
			return [
				...prev,
				{
					menuItemId: item.id,
					name: item.name,
					price: item.price,
					quantity: 1,
				},
			];
		});
	};

	const decreaseItem = (menuItemId: number) => {
		setSuccessMessage(null);
		setCart((prev) =>
			prev
				.map((c) =>
					c.menuItemId === menuItemId
						? { ...c, quantity: c.quantity - 1 }
						: c,
				)
				.filter((c) => c.quantity > 0),
		);
	};

	const updateItemNote = (menuItemId: number, note: string) => {
		setCart((prev) =>
			prev.map((c) =>
				c.menuItemId === menuItemId ? { ...c, note: note || undefined } : c,
			),
		);
	};

	const clearCart = () => {
		setCart([]);
	};

	const cartCount = useMemo(
		() => cart.reduce((sum, item) => sum + item.quantity, 0),
		[cart],
	);

	const cartTotal = useMemo(
		() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
		[cart],
	);

	const submitOrder = async (paymentMethod: "cash" | "qris" = "cash", isPaid = false) => {
		if (cart.length === 0) return;

		try {
			setSubmitting(true);
			setError(null);

			await createOrderApi({
				table_id: null,
				customer_name: "Walk-in",
				payment_method: paymentMethod,
				items: cart.map((item) => ({
					menu_item_id: item.menuItemId,
					quantity: item.quantity,
					notes: item.note ?? null,
				})),
			});

			setCart([]);
			setSuccessMessage(
				isPaid
					? `Order created · ${paymentMethod.toUpperCase()} paid`
					: "Order created · pending payment",
			);
		} catch (err) {
			setError(getErrorMessage(err, "Failed to submit order"));
		} finally {
			setSubmitting(false);
		}
	};

	return {
		categories,
		selectedCategories,
		selectedCategoryLabel,
		toggleCategory,
		filteredItems,
		loading,
		error,
		successMessage,
		cartCount,
		cartTotal,
		cart,
		menuItems,
		getItemQuantity,
		getItemNote,
		increaseItem,
		decreaseItem,
		updateItemNote,
		clearCart,
		submitOrder,
		submitting,
	};
}
