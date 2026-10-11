import { Modal, Pressable, Text, View } from "react-native";
import { TableApi } from "@/types/api/table";

type Props = {
	table: TableApi | null;
	onCancel: () => void;
	onConfirm: () => void;
};

export default function DeleteTableModal({ table, onCancel, onConfirm }: Props) {
	return (
		<Modal visible={!!table} transparent animationType="fade" onRequestClose={onCancel}>
			<View className="flex-1 items-center justify-center bg-black/40 px-6">
				<View className="w-full max-w-sm rounded-2xl bg-white p-5">
					<Text className="text-lg font-bold text-[#111C2D]">Delete table?</Text>
					<Text className="mt-2 text-sm text-slate-600">
						Delete {table?.name} and its saved QR image? Orders will be kept without a table assignment.
					</Text>
					<View className="mt-5 flex-row justify-end gap-3">
						<Pressable onPress={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5">
							<Text className="font-semibold text-slate-700">Cancel</Text>
						</Pressable>
						<Pressable onPress={onConfirm} className="rounded-xl bg-rose-600 px-4 py-2.5">
							<Text className="font-semibold text-white">Delete</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}
