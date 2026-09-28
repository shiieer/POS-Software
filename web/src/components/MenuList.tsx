import type { CartItem, MenuItem } from "../types";
import MenuItemCard from "./MenuItemCard";

interface MenuListProps {
	items: MenuItem[];
	cartItems: CartItem[];
	activeCategory: string;
	onAddItem: (item: MenuItem) => void;
	onRemoveItem: (itemId: number) => void;
}

export default function MenuList({
	items,
	cartItems,
	activeCategory,
	onAddItem,
	onRemoveItem,
}: MenuListProps) {
	const filtered = items.filter(
		(item) => item.category.toLowerCase() === activeCategory.toLowerCase(),
	);

	const getQuantity = (id: number) => {
		const found = cartItems.findLast((ci) => ci.menuItem.id === id);
		return found ? found.quantity : 0;
	};

	if (filtered.length === 0) {
		return (
			<div className="px-4 py-12 text-center text-outline text-sm">
				No items in this category yet.
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3.5">
			{filtered.map((item) => (
				<MenuItemCard
					key={item.id}
					item={item}
					quantity={getQuantity(item.id)}
					onAdd={onAddItem}
					onRemove={onRemoveItem}
				/>
			))}
		</div>
	);
}
