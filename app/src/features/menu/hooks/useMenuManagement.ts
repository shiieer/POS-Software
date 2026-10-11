import { useCallback, useEffect, useMemo, useState } from "react";
import { ALL_ITEMS, AvailabilityFilter, ManagedMenuItem } from "../types/menu";
import { fetchMenuApi, updateMenuItemApi } from "@/services/api/menu.api";
import { getMenuCategories, mapManagedMenuItem } from "../utils/mapMenuItem";
import { getErrorMessage } from "@/utils";

export function useMenuManagement() {
	const [items, setItems] = useState<ManagedMenuItem[]>([]);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([ALL_ITEMS]);
	const [searchQuery, setSearchQuery] = useState("");
	const [availabilityFilter, setAvailabilityFilter] =
		useState<AvailabilityFilter>("all");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadMenu = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await fetchMenuApi(false);
			setItems(Array.isArray(data) ? data.map(mapManagedMenuItem) : []);
		} catch (err) {
			setError(getErrorMessage(err, "Failed to load menu"));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadMenu();
	}, [loadMenu]);

	const existingCategories = useMemo(() => getMenuCategories(items), [items]);

	const categories = useMemo(
		() => [ALL_ITEMS, ...existingCategories],
		[existingCategories],
	);

	const stats = useMemo(() => {
		const active = items.filter((item) => item.isAvailable).length;
		return {
			total: items.length,
			active,
			soldOut: items.length - active,
		};
	}, [items]);

	const filteredItems = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		return items.filter((item) => {
			const matchCategory =
				selectedCategories.includes(ALL_ITEMS) ||
				selectedCategories.includes(item.category);
			const matchStock =
				availabilityFilter === "all" ||
				(availabilityFilter === "in-stock" && item.isAvailable) ||
				(availabilityFilter === "out-of-stock" && !item.isAvailable);
			const matchSearch =
				!query ||
				item.name.toLowerCase().includes(query) ||
				item.category.toLowerCase().includes(query) ||
				(item.description ?? "").toLowerCase().includes(query);
			return matchCategory && matchStock && matchSearch;
		});
	}, [items, selectedCategories, availabilityFilter, searchQuery]);

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

	const toggleAvailability = async (item: ManagedMenuItem) => {
		const next = !item.isAvailable;
		setItems((prev) =>
			prev.map((row) =>
				row.id === item.id ? { ...row, isAvailable: next } : row,
			),
		);
		try {
			await updateMenuItemApi(item.id, { is_available: next });
		} catch (err) {
			setItems((prev) =>
				prev.map((row) =>
					row.id === item.id
						? { ...row, isAvailable: item.isAvailable }
						: row,
				),
			);
			setError(getErrorMessage(err, "Failed to update items"));
		}
	};

	return {
		items: filteredItems,
		stats,
		categories,
		existingCategories,
		selectedCategories,
		toggleCategory,
		searchQuery,
		setSearchQuery,
		availabilityFilter,
		setAvailabilityFilter,
		loading,
		error,
		refresh: loadMenu,
		toggleAvailability,
	};
}
