import { useState } from "react";
import { AddMenuItemForm, ManagedMenuItem } from "../types/menu";
import {
	createMenuItemApi,
	deleteMenuItemApi,
	updateMenuItemApi,
	uploadMenuImageApi,
} from "@/services/api/menu.api";
import { getErrorMessage } from "@/utils";

function toForm(item?: ManagedMenuItem | null): AddMenuItemForm {
	if (!item) {
		return {
			name: "",
			price: "",
			category: "",
			description: "",
			imageUri: null,
			isAvailable: true,
		};
	}

	return {
		name: item.name,
		price: String(item.price),
		category: item.category,
		description: item.description ?? "",
		imageUri: item.image,
		isAvailable: item.isAvailable,
	};
}

export function useAddMenuItem(
	existingCategories: string[],
	onSuccess: () => void,
	item?: ManagedMenuItem | null,
) {
	const [form, setForm] = useState<AddMenuItemForm>(() => toForm(item));
	const [categories, setCategories] = useState(existingCategories);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<
		Partial<Record<"name" | "price" | "category", string>>
	>({});

	const isEditing = !!item;

	function setField<K extends keyof AddMenuItemForm>(
		key: K,
		value: AddMenuItemForm[K],
	) {
		setForm((prev) => ({ ...prev, [key]: value }));
		setError(null);
		if (key === "name" || key === "price" || key === "category") {
			setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
		}
	}

	function selectCategory(category: string) {
		const value = category.trim();
		if (!value) return;
		setField("category", value);
		setCategories((prev) =>
			prev.includes(value) ? prev : [...prev, value],
		);
	}

	function validate() {
		const next: Partial<Record<"name" | "price" | "category", string>> = {};
		const price = Number(form.price.replace(",", "."));

		if (!form.name.trim()) next.name = "Item name is required";
		if (!form.price.trim() || Number.isNaN(price) || price <= 0) {
			next.price = "Enter a valid price";
		}
		if (!form.category.trim()) next.category = "Category is required";

		setFieldErrors(next);
		return Object.keys(next).length === 0;
	}

	function shouldUploadImage(uri: string | null): uri is string {
		if (!uri) return false;
		return !uri.startsWith("http://") && !uri.startsWith("https://");
	}

	async function submit() {
		if (!validate()) return;

		setSaving(true);
		setError(null);

		const payload = {
			name: form.name.trim(),
			description: form.description.trim() || null,
			price: Number(form.price.replace(",", ".")),
			category: form.category.trim(),
			is_available: form.isAvailable,
		};

		try {
			if (isEditing && item) {
				await updateMenuItemApi(item.id, payload);
				if (shouldUploadImage(form.imageUri)) {
					await uploadMenuImageApi(item.id, form.imageUri);
				}
			} else {
				const created = await createMenuItemApi(payload);
				if (shouldUploadImage(form.imageUri)) {
					await uploadMenuImageApi(created.id, form.imageUri);
				}
			}

			onSuccess();
		} catch (err) {
			setError(
				getErrorMessage(
					err,
					isEditing
						? "Failed to update item"
						: "Failed to create item",
				),
			);
		} finally {
			setSaving(false);
		}
	}

	async function deleteItem(): Promise<boolean> {
		if (!item) return false;
		setDeleting(true);
		setError(null);
		try {
			await deleteMenuItemApi(item.id);
			return true;
		} catch (err) {
			setError(getErrorMessage(err, "Failed to delete item"));
			return false;
		} finally {
			setDeleting(false);
		}
	}

	return {
		form,
		categories,
		saving,
		deleting,
		error,
		fieldErrors,
		isEditing,
		setField,
		selectCategory,
		submit,
		deleteItem,
	};
}
