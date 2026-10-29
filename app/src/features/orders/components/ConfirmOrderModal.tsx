import { ActivityIndicator, Image, Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type ConfirmOrderActionType = "start_preparing" | "mark_paid" | "cancel";

type Props = {
	visible: boolean;
	actionType: ConfirmOrderActionType | null;
	orderCode?: string;
	orderTitle?: string;
	totalAmount?: number;
	paymentMethod?: string;
	paymentProofUrl?: string | null;
	loading?: boolean;
	onClose: () => void;
	onConfirm: () => void;
};

export default function ConfirmOrderModal({
	visible,
	actionType,
	orderCode = "",
	orderTitle = "",
	totalAmount = 0,
	paymentMethod = "cash",
	paymentProofUrl,
	loading = false,
	onClose,
	onConfirm,
}: Props) {
	if (!actionType) return null;

	const config = {
		start_preparing: {
			icon: "cafe" as const,
			iconBg: "bg-sky-100 dark:bg-sky-950",
			iconColor: "#0284C7",
			title: "Start Preparing Order?",
			message: `Start preparing order #${orderCode}${
				orderTitle ? ` (${orderTitle})` : ""
			}?`,
			btnText: "Start Preparing",
			btnBg: "bg-sky-600 active:bg-sky-700",
		},
		mark_paid: {
			icon: "checkmark-circle" as const,
			iconBg: "bg-emerald-100 dark:bg-emerald-950",
			iconColor: "#10B981",
			title: "Confirm Payment?",
			message: `Mark order #${orderCode} as paid via ${paymentMethod.toUpperCase()}${
				totalAmount ? ` for Rp ${totalAmount.toLocaleString("id-ID")}` : ""
			}?`,
			btnText: "Mark as Paid",
			btnBg: "bg-emerald-600 active:bg-emerald-700",
		},
		cancel: {
			icon: "alert-circle" as const,
			iconBg: "bg-rose-100 dark:bg-rose-950",
			iconColor: "#E11D48",
			title: "Cancel Order?",
			message: `Are you sure you want to cancel order #${orderCode}? This action cannot be undone.`,
			btnText: "Yes, Cancel Order",
			btnBg: "bg-rose-600 active:bg-rose-700",
		},
	}[actionType];

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<View className="flex-1 items-center justify-center bg-slate-900/50 px-6">
				<View className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
					<View className="items-center text-center">
						<View
							className={`mb-4 h-14 w-14 items-center justify-center rounded-2xl ${config.iconBg}`}
						>
							<Ionicons
								name={config.icon}
								size={28}
								color={config.iconColor}
							/>
						</View>

						<Text className="text-center text-base font-bold text-slate-900 dark:text-slate-100">
							{config.title}
						</Text>

						<Text className="mt-2 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
							{config.message}
						</Text>

						{actionType === "mark_paid" && paymentProofUrl ? (
							<View className="mt-3 w-full">
								<Text className="mb-1 text-center text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
									Bukti Pembayaran QRIS:
								</Text>
								<View className="h-36 w-full overflow-hidden rounded-xl border border-emerald-300 bg-slate-50 dark:border-emerald-800 dark:bg-slate-800">
									<Image
										source={{ uri: paymentProofUrl }}
										className="h-full w-full"
										resizeMode="contain"
									/>
								</View>
							</View>
						) : null}
					</View>

					<View className="mt-6 flex-row gap-3">
						<Pressable
							onPress={onClose}
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
							className={`flex-1 items-center justify-center rounded-2xl py-3 shadow-md ${config.btnBg}`}
						>
							{loading ? (
								<ActivityIndicator size="small" color="#FFFFFF" />
							) : (
								<Text className="text-xs font-bold text-white">
									{config.btnText}
								</Text>
							)}
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}
