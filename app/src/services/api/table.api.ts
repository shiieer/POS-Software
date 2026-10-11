import { CreateTablePayload, TableApi } from "@/types/api/table";
import { api } from "./client";

export async function fetchTablesApi() {
	const { data } = await api.get<TableApi[]>("/tables");
	return data;
}

export async function createTableApi(payload: CreateTablePayload) {
	const { data } = await api.post<TableApi>("/tables", payload);
	return data;
}

export async function deleteTableApi(id: number) {
	await api.delete(`/tables/${id}`);
}

export async function setTableActiveApi(id: number, isActive: boolean) {
	const { data } = await api.patch<TableApi>(`/tables/${id}/active`, null, {
		params: { is_active: isActive },
	});
	return data;
}

