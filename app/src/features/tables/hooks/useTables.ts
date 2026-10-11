import { createTableApi, deleteTableApi, fetchTablesApi, setTableActiveApi } from "@/services/api/table.api";
import { TableApi } from "@/types/api/table";
import { getErrorMessage } from "@/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

export type TableFilter = "all" | "active" | "inactive";

export function useTables() {
	const [tables, setTables] = useState<TableApi[]>([]);
	const [filter, setFilter] = useState<TableFilter>("all");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await fetchTablesApi();
			setTables(Array.isArray(data) ? data : []);
		} catch (err) {
			setError(getErrorMessage(err, "Failed to load tables"));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const counts = useMemo(() => {
		const active = tables.filter((t) => t.is_active).length;
		return {
			all: tables.length,
			active,
			inActive: tables.length - active,
		};
	}, [tables]);

	const filtered = useMemo(() => {
		if (filter === "active") return tables.filter((t) => t.is_active);
		if (filter === "inactive") return tables.filter((t) => !t.is_active);
		return tables;
	}, [tables, filter]);

	async function addTable(name: string) {
		setSaving(true);
		try {
			const created = await createTableApi({ name: name.trim() });
			setTables((prev) => [...prev, created]);
			return created;
		} catch (err) {
			throw new Error(getErrorMessage(err, "Failed to add table"));
		} finally {
			setSaving(false);
		}
	}

	async function removeTable(id: number) {
		try {
			await deleteTableApi(id);
			setTables((prev) => prev.filter((table) => table.id !== id));
		} catch (err) {
			throw new Error(getErrorMessage(err, "Failed to delete table"));
		}
	}

	async function setTableActive(id: number, isActive: boolean) {
		try {
			const updated = await setTableActiveApi(id, isActive);
			setTables((prev) => prev.map((table) => table.id === id ? updated : table));
		} catch (err) {
			throw new Error(getErrorMessage(err, "Failed to update table status"));
		}
	}

	return {
		tables: filtered,
		counts,
		filter,
		setFilter,
		loading,
		saving,
		error,
		addTable,
		removeTable,
		setTableActive,
		reload: load,
	};
}
