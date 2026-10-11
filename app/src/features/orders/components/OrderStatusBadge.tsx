import { View, Text } from "react-native";
import { PaymentMethodType, PaymentStatus } from "../types/order";

type Props = {
	status: PaymentStatus;
	paymentMethod?: PaymentMethodType;
};

export default function OrderStatusBadge({ status, paymentMethod }: Props) {
	const isPaid = status === "paid";
	const isQrisPending = !isPaid && paymentMethod === "qris";

	let badgeStyle = "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950";
	let textStyle = "text-amber-700 dark:text-amber-300";
	let label = isPaid ? "Paid" : "Unpaid";

	if (isPaid) {
		badgeStyle = "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950";
		textStyle = "text-emerald-700 dark:text-emerald-300";
		label = paymentMethod ? `PAID • ${paymentMethod.toUpperCase()}` : "PAID";
	} else if (isQrisPending) {
		badgeStyle = "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950";
		textStyle = "text-rose-700 dark:text-rose-300";
		label = "QRIS • PERLU KONFIRMASI";
	} else if (paymentMethod === "cash") {
		badgeStyle = "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950";
		textStyle = "text-amber-700 dark:text-amber-300";
		label = "CASH • BAYAR KASIR";
	}

	return (
		<View className={`rounded-md border px-2 py-0.5 ${badgeStyle}`}>
			<Text className={`font-mono text-[10px] font-bold uppercase tracking-wider ${textStyle}`}>
				{label}
			</Text>
		</View>
	);
}
