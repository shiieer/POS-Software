import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ManagedMenuItem } from "../types/menu";

type Props = {
	item: ManagedMenuItem | null;
	loading?: boolean;
	errorMessage?: string | null;
	onCancel: () => void;
	onConfirm: () => void;
};

export default function DeleteMenuItemModal({
	item,
	loading = false,
	errorMessage,
	onCancel,
	onConfirm,
}: Props) {
	if (!item) return null;

	return (
		<Modal
			visible={!!item}
			transparent
			animationType="fade"
			onRequestClose={onCancel}
		>
			<View className="flex-1 items-center justify-center bg-slate-900/50 px-6">
				<View className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
					<View className="items-center text-center">
						<View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950">
							<Ionicons name="trash-outline" size={28} color="#E11D48" />
						</View>

						<Text className="text-center text-base font-bold text-slate-900 dark:text-slate-100">
							Delete Menu Item?
						</Text>

						<Text className="mt-2 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
							Are you sure you want to delete{" "}
							<Text className="font-bold text-slate-800 dark:text-slate-200">
								"{item.name}"
							</Text>
							? Its image and data will be permanently removed from the system.
						</Text>

						{errorMessage ? (
							<Text className="mt-3 text-center text-xs font-semibold text-rose-600">
								{errorMessage}
							</Text>
						) : null}
					</View>

					<View className="mt-6 flex-row gap-3">
						<Pressable
							onPress={onCancel}
							disabled={loading}
							className="flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white py-3 active:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
						>
							<Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
								Cancel
							</Text>
						</Pressable>

						<Pressable
							onPress={onConfirm}
							disabled={loading}
							className="flex-1 items-center justify-center rounded-2xl bg-rose-600 py-3 shadow-md active:bg-rose-700"
						>
							{loading ? (
								<ActivityIndicator size="small" color="#FFFFFF" />
							) : (
								<Text className="text-xs font-bold text-white">
									Delete
								</Text>
							)}
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}
