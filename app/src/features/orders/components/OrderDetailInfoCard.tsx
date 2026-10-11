import { View, Text } from "react-native";
import { formatRp, formatTime, formatWait } from "@/utils";
import { Order } from "../types/order";

function Row({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<View className="flex-row items-center justify-between py-2">
			<Text className="text-sm text-brand-slate dark:text-slate-400">{label}</Text>
			{children}
		</View>
	);
}

type Props = {
	order: Order;
	elapsedSecond: number;
	isUrgent?: boolean;
};

export default function OrderDetailInfoCard({
	order,
	elapsedSecond,
	isUrgent,
}: Props) {
	const subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);

	return (
		<View className="rounded-3xl border border-sky-100/90 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-900/90">
			<Text className="mb-2 text-base font-bold text-brand-dark dark:text-slate-100">
				Order Details
			</Text>

			<Row label="Table">
				<View className="rounded-md bg-brand-surface px-2 py-1 dark:bg-slate-800">
					<Text className="text-sm font-medium text-brand-dark dark:text-slate-100">
						{order.locationLabel}
					</Text>
				</View>
			</Row>

			<Row label="Time">
				<Text className="text-sm font-medium text-brand-dark dark:text-slate-100">
					{formatTime(order.createdAt)}
				</Text>
			</Row>

			<Row label="Wait Time">
				<Text
					className={`text-sm font-bold ${
						isUrgent ? "text-red-500" : "text-brand-dark dark:text-slate-100"
					}`}
				>
					{formatWait(elapsedSecond)}
				</Text>
			</Row>

			<Row label="Payment Method">
				<View className="rounded-md bg-brand-surface px-2 py-0.5 dark:bg-slate-800">
					<Text className="text-sm font-semibold uppercase text-brand-dark dark:text-slate-100">
						{order.paymentMethod === "qris" ? "QRIS" : "Cash (Kasir)"}
					</Text>
				</View>
			</Row>

			<Row label="Payment Status">
				<Text
					className={`text-sm font-bold ${
						order.paymentStatus === "paid"
							? "text-emerald-600 dark:text-emerald-400"
							: order.paymentMethod === "qris"
							? "text-rose-600 dark:text-rose-400"
							: "text-amber-600 dark:text-amber-400"
					}`}
				>
					{order.paymentStatus === "paid"
						? "Lunas (Paid)"
						: order.paymentMethod === "qris"
						? "Perlu Konfirmasi QRIS"
						: "Belum Dibayar (Kasir)"}
				</Text>
			</Row>

			<View className="my-3 border-t border-brand-border dark:border-slate-800" />

			<Row label="Subtotal">
				<Text className="text-sm text-brand-dark dark:text-slate-100">
					{formatRp(subtotal)}
				</Text>
			</Row>

			<View className="my-3 border-t border-brand-border dark:border-slate-800" />

			<View className="flex-row items-center justify-between">
				<Text className="text-base font-bold text-brand-dark dark:text-slate-100">
					Total
				</Text>
				<Text className="text-base font-bold text-brand-dark dark:text-slate-100">
					{formatRp(order.totalAmount)}
				</Text>
			</View>
		</View>
	);
}
