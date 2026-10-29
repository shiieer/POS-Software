import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Order } from "../types/order";

type Props = {
	order: Order;
	updating: boolean;
	onStartPreparing: () => void;
	onMarkReady: () => void;
	onMarkPaid: () => void;
	onCancel: () => void;
	onPrint: () => void;
};

export default function OrderDetailActions({
	order,
	updating,
	onStartPreparing,
	onMarkReady,
	onMarkPaid,
	onCancel,
	onPrint,
}: Props) {
	const isPaid = order.paymentStatus === "paid";
	const needsPaymentConfirm =
		order.paymentMethod === "qris" &&
		!isPaid &&
		order.status !== "cancelled";
	const canCancel =
		!isPaid &&
		order.status !== "ready" &&
		order.status !== "served" &&
		order.status !== "cancelled";

	return (
		<View className="gap-3">
			{needsPaymentConfirm ? (
				<Pressable
					onPress={() => onMarkPaid()}
					disabled={updating}
					className="flex-row items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 py-3.5"
					style={{
						shadowColor: "#10B981",
						shadowOpacity: 0.25,
						shadowRadius: 8,
						shadowOffset: { width: 0, height: 4 },
					}}
				>
					{updating ? (
						<ActivityIndicator color="#FFFFFF" />
					) : (
						<>
							<Ionicons
								name="checkmark-circle"
								size={17}
								color="#FFFFFF"
							/>
							<Text className="text-xs font-bold tracking-wide text-white">
								Konfirmasi QRIS
							</Text>
						</>
					)}
				</Pressable>
			) : order.status === "new" ? (
				<Pressable
					onPress={onStartPreparing}
					disabled={updating}
					className="flex-row items-center justify-center gap-1.5 rounded-2xl bg-sky-600 py-3.5"
					style={{
						shadowColor: "#0284C7",
						shadowOpacity: 0.25,
						shadowRadius: 8,
						shadowOffset: { width: 0, height: 4 },
					}}
				>
					{updating ? (
						<ActivityIndicator color="#FFFFFF" />
					) : (
						<>
							<Ionicons name="cafe-outline" size={17} color="#FFFFFF" />
							<Text className="text-xs font-bold tracking-wide text-white">
								Start Preparing
							</Text>
						</>
					)}
				</Pressable>
			) : null}

			{order.status === "preparing" ? (
				<Pressable
					onPress={onMarkReady}
					disabled={updating}
					className="flex-row items-center justify-center gap-1.5 rounded-2xl bg-emerald-500 py-3.5"
					style={{
						shadowColor: "#10B981",
						shadowOpacity: 0.25,
						shadowRadius: 8,
						shadowOffset: { width: 0, height: 4 },
					}}
				>
					{updating ? (
						<ActivityIndicator color="#FFFFFF" />
					) : (
						<>
							<Ionicons
								name="checkmark-circle"
								size={17}
								color="#FFFFFF"
							/>
							<Text className="text-xs font-bold tracking-wide text-white">
								Mark Order Ready
							</Text>
						</>
					)}
				</Pressable>
			) : null}

			<View className="flex-row gap-3">
				{!needsPaymentConfirm ? (
					<Pressable
						onPress={() => onMarkPaid()}
						disabled={updating || isPaid}
						className={`flex-1 items-center justify-center rounded-2xl border py-3 ${
							isPaid
								? "border-emerald-200 bg-emerald-50 opacity-70 dark:border-emerald-800 dark:bg-emerald-950"
								: "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
						}`}
					>
						<Text
							className={`text-xs font-bold ${
								isPaid
									? "text-emerald-700 dark:text-emerald-300"
									: "text-slate-800 dark:text-slate-100"
							}`}
						>
							{isPaid
								? `✓ Lunas (${order.paymentMethod.toUpperCase()})`
								: "Terima Kasir (Cash)"}
						</Text>
					</Pressable>
				) : null}

				<Pressable
					onPress={onCancel}
					disabled={updating || !canCancel}
					className={`flex-1 items-center rounded-2xl border py-3 ${canCancel ? "border-rose-200 bg-white dark:border-rose-800 dark:bg-slate-900" : "border-slate-200 bg-white opacity-40 dark:border-slate-700 dark:bg-slate-900"}`}
				>
					<Text
						className={`text-xs font-bold ${canCancel ? "text-rose-500" : "text-slate-400"}`}
					>
						Cancel Order
					</Text>
				</Pressable>
			</View>

			<Pressable
				onPress={onPrint}
				disabled={updating}
				className="flex-row items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-3 dark:border-slate-700 dark:bg-slate-800"
			>
				<Ionicons name="print-outline" size={18} color="#94A3B8" />
				<Text className="text-xs font-bold text-slate-700 dark:text-slate-200">
					Print Ticket
				</Text>
			</Pressable>
		</View>
	);
}
