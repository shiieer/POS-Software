import { View, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/shared/theme/ThemeProvider";
import { OrderStatus } from "../types/order";
import {
	getPrimaryActionIcon,
	getPrimaryActionLabel,
} from "../utils/orderCardTheme";

type Props = {
	status: OrderStatus;
	primaryClass: string;
	primaryTextClass: string;
	needsPaymentConfirm?: boolean;
	onConfirmPayment?: () => void;
	onStartPreparing: () => void;
	onPrint: () => void;
	onMarkReady: () => void;
	onMarkServed: () => void;
};

export default function OrderActionButtons({
	status,
	primaryClass,
	primaryTextClass,
	needsPaymentConfirm = false,
	onConfirmPayment,
	onStartPreparing,
	onPrint,
	onMarkReady,
	onMarkServed,
}: Props) {
	const { isDark } = useAppTheme();
	const label = needsPaymentConfirm
		? "Konfirmasi QRIS"
		: getPrimaryActionLabel(status);
	const icon = needsPaymentConfirm
		? ("checkmark-circle" as const)
		: getPrimaryActionIcon(status);

	const onPrimary = () => {
		if (needsPaymentConfirm) {
			onConfirmPayment?.();
			return;
		}
		if (status === "new") onStartPreparing();
		if (status === "preparing") onMarkReady();
		if (status === "ready") onMarkServed();
	};

	const buttonBgClass = needsPaymentConfirm
		? "bg-emerald-600 active:bg-emerald-700"
		: primaryClass;
	const buttonTextClass = needsPaymentConfirm
		? "text-white"
		: primaryTextClass;
	const shadowColor = needsPaymentConfirm
		? "#10B981"
		: status === "preparing"
			? "#10B981"
			: "#0284C7";

	return (
		<View className="flex-row items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
			<Pressable
				onPress={onPrint}
				className="h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-100/90 dark:border-slate-700 dark:bg-slate-800"
			>
				<Ionicons
					name="print-outline"
					size={18}
					color={isDark ? "#94A3B8" : "#475569"}
				/>
			</Pressable>

			{label ? (
				<Pressable
					onPress={onPrimary}
					className={`h-10 flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl ${buttonBgClass}`}
					style={{
						shadowColor,
						shadowOpacity: 0.25,
						shadowRadius: 8,
						shadowOffset: { width: 0, height: 4 },
						elevation: 3,
					}}
				>
					{icon ? (
						<Ionicons name={icon} size={17} color="#FFFFFF" />
					) : null}
					<Text
						className={`text-xs font-bold tracking-wide ${buttonTextClass}`}
					>
						{label}
					</Text>
				</Pressable>
			) : (
				<View className="h-10 flex-1 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 dark:border-sky-800 dark:bg-sky-950">
					<Text className="text-xs font-semibold text-sky-700 dark:text-sky-300">
						Served
					</Text>
				</View>
			)}
		</View>
	);
}
