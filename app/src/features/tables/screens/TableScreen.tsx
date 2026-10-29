import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TableApi } from "@/types/api/table";
import ScreenContainer from "@/shared/components/ScreenContainer";
import Toast from "@/shared/components/Toast";
import TableHeader from "../components/TableHeader";
import TableFilterBar from "../components/TableFilterBar";
import TableOverview from "../components/TableOverview";
import TableCard from "../components/TableCard";
import TableQrModal from "../components/TableQrModal";
import AddTableModal from "../components/AddTableModal";
import DeleteTableModal from "../components/DeleteTableModal";
import TableSettingsSheet from "../components/TableSettingsSheet";
import { useTables } from "../hooks/useTables";
import { useUserRole } from "@/shared/hooks/useUserRole";

type Props = {
	onBack: () => void;
};

export default function TableScreen({ onBack }: Props) {
	const { isAdmin } = useUserRole();
	const {
		tables,
		counts,
		filter,
		setFilter,
		loading,
		saving,
		error,
		addTable,
		removeTable,
		setTableActive,
	} = useTables();

	const [adding, setAdding] = useState(false);
	const [name, setName] = useState("");
	const [qrTable, setQrTable] = useState<TableApi | null>(null);
	const [toast, setToast] = useState<string | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<TableApi | null>(null);
	const [settingsTable, setSettingsTable] = useState<TableApi | null>(null);
	const [draftActive, setDraftActive] = useState(true);
	const [updating, setUpdating] = useState(false);

	function openSettings(table: TableApi) {
		if (!isAdmin) return;
		setDraftActive(table.is_active);
		setSettingsTable(table);
	}

	async function submitTable() {
		if (!name.trim()) return;
		try {
			await addTable(name);
			setName("");
			setAdding(false);
			setToast("Table added");
		} catch (err) {
			Alert.alert("Error", err instanceof Error ? err.message : "Failed to add table");
		}
	}

	async function saveSettings() {
		if (!settingsTable) return;
		try {
			setUpdating(true);
			if (draftActive !== settingsTable.is_active) {
				await setTableActive(settingsTable.id, draftActive);
			}
			setToast("Table settings saved");
			setSettingsTable(null);
		} catch (err) {
			Alert.alert("Error", err instanceof Error ? err.message : "Failed to update table status");
		} finally {
			setUpdating(false);
		}
	}

	async function confirmDeleteTable() {
		if (!deleteTarget) return;
		try {
			await removeTable(deleteTarget.id);
			if (qrTable?.id === deleteTarget.id) setQrTable(null);
			setToast("Table deleted");
			setDeleteTarget(null);
		} catch (err) {
			Alert.alert("Error", err instanceof Error ? err.message : "Failed to delete table");
		}
	}

	return (
		<ScreenContainer showHeader={false}>
			<TableHeader onBack={onBack} />
			<TableOverview onAdd={() => setAdding(true)} canAdd={isAdmin} />
			<TableFilterBar filter={filter} counts={counts} onSelect={setFilter} />

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#0284C7" />
				</View>
			) : error ? (
				<Text className="mt-10 text-center text-red-500">{error}</Text>
			) : (
				<FlatList
					className="flex-1"
					data={tables}
					keyExtractor={(table) => String(table.id)}
					numColumns={2}
					columnWrapperClassName="gap-3"
					contentContainerClassName="px-4 pb-10"
					ListEmptyComponent={
						<View className="mx-4 mt-10 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16">
							<View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-slate-100">
								<Ionicons name="grid-outline" size={28} color="#94A3B8" />
							</View>
							<Text className="text-base font-bold text-slate-600">No Tables Found</Text>
							<Text className="mt-1 text-center text-sm text-slate-400">
								{isAdmin
									? "Add a table to get started with QR ordering"
									: "Belum ada meja yang terdaftar."}
							</Text>
						</View>
					}
					renderItem={({ item }) => (
						<View className="flex-1">
							<TableCard
								table={item}
								isAdmin={isAdmin}
								onViewQr={() => setQrTable(item)}
								onManage={isAdmin ? () => openSettings(item) : undefined}
							/>
						</View>
					)}
				/>
			)}

			<Toast message={toast} type="success" />
			<TableQrModal table={qrTable} onClose={() => setQrTable(null)} />
			{isAdmin && (
				<>
					<AddTableModal
						visible={adding}
						name={name}
						saving={saving}
						onChangeName={setName}
						onClose={() => setAdding(false)}
						onSubmit={submitTable}
					/>
					<TableSettingsSheet
						table={settingsTable}
						active={draftActive}
						updating={updating}
						onActiveChange={setDraftActive}
						onClose={() => setSettingsTable(null)}
						onSave={saveSettings}
						onViewQr={(table) => {
							setSettingsTable(null);
							setQrTable(table);
						}}
						onDelete={(table) => {
							setSettingsTable(null);
							setDeleteTarget(table);
						}}
					/>
					<DeleteTableModal
						table={deleteTarget}
						onCancel={() => setDeleteTarget(null)}
						onConfirm={confirmDeleteTable}
					/>
				</>
			)}
		</ScreenContainer>
	);
}
