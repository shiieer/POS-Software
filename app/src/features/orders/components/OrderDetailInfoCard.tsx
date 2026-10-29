import { useState } from "react";
import { View, Text, Image, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
	const [showProofModal, setShowProofModal] = useState(false);
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

			{order.paymentProofUrl ? (
				<View className="my-2 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-800 dark:bg-emerald-950/40">
					<View className="mb-2 flex-row items-center justify-between">
						<View className="flex-row items-center gap-1.5">
							<Ionicons name="receipt-outline" size={16} color="#059669" />
							<Text className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
								Bukti Pembayaran QRIS
							</Text>
						</View>
						<Pressable
							onPress={() => setShowProofModal(true)}
							className="flex-row items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1"
						>
							<Ionicons name="expand" size={12} color="#FFFFFF" />
							<Text className="text-[11px] font-bold text-white">Perbesar</Text>
						</Pressable>
					</View>
					<Pressable
						onPress={() => setShowProofModal(true)}
						className="h-48 w-full overflow-hidden rounded-xl border border-emerald-200 bg-white dark:border-emerald-900 dark:bg-slate-900"
					>
						<Image
							source={{ uri: order.paymentProofUrl }}
							className="h-full w-full"
							resizeMode="contain"
						/>
					</Pressable>
				</View>
			) : order.paymentMethod === "qris" ? (
				<Row label="Bukti QRIS">
					<Text className="text-xs italic text-slate-400">Belum diunggah pelanggan</Text>
				</Row>
			) : null}

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

			<Modal
				visible={showProofModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowProofModal(false)}
			>
				<View className="flex-1 items-center justify-center bg-black/90 p-4">
					<View className="relative w-full max-w-lg items-center">
						<Pressable
							onPress={() => setShowProofModal(false)}
							className="mb-3 self-end flex-row items-center gap-1 rounded-full bg-white/20 px-3 py-1.5"
						>
							<Ionicons name="close" size={18} color="#FFFFFF" />
							<Text className="text-xs font-bold text-white">Tutup</Text>
						</Pressable>
						{order.paymentProofUrl && (
							<Image
								source={{ uri: order.paymentProofUrl }}
								className="h-[75vh] w-full rounded-2xl"
								resizeMode="contain"
							/>
						)}
					</View>
				</View>
			</Modal>
		</View>
	);
}
