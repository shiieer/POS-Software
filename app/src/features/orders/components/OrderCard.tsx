import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getElapsedSeconds } from "@/utils";
import { useAppTheme } from "@/shared/theme/ThemeProvider";
import { Order } from "../types/order";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderTimerBadge from "./OrderTimerBadge";
import OrderItemList from "./OrderItemList";
import OrderActionButtons from "./OrderActionButtons";
import { getOrderCardTheme } from "../utils/orderCardTheme";

type Props = {
	order: Order;
	onPress: () => void;
	onStartPreparing: (orderId: number) => void;
	onPrint: (orderId: number) => void;
	onMarkReady: (orderId: number) => void;
	onMarkServed: (orderId: number) => void;
	isLandscape?: boolean;
	cardWidth?: number;
};

export default function OrderCard({
	order,
	onPress,
	onStartPreparing,
	onPrint,
	onMarkReady,
	onMarkServed,
	isLandscape,
	cardWidth,
}: Props) {
	const { isDark } = useAppTheme();
	const [now, setNow] = useState(Date.now());
	const theme = getOrderCardTheme(order, isDark);
	const elapsedSeconds = getElapsedSeconds(order.createdAt, now);
	const showBag = order.locationType === "to-go";

	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(timer);
	}, []);

	return (
		<Pressable
			onPress={onPress}
			className={`mb-3.5 overflow-hidden rounded-3xl border ${theme.card}`}
			style={[
				{
					shadowColor: isDark ? "#000000" : "#0EA5E9",
					shadowOpacity: isDark ? 0.35 : 0.08,
					shadowRadius: 16,
					shadowOffset: { width: 0, height: 4 },
					elevation: 2,
				},
				isLandscape
					? {
							width: cardWidth,
							aspectRatio: 4 / 3,
						}
					: undefined,
			]}
		>
			<View className={`h-1 ${theme.accent}`} />

			<View className={isLandscape ? "flex-1 justify-between p-3" : "p-4"}>
				<View className="mb-2 flex-row items-start justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
					<View className="flex-1 pr-2">
						<View className="flex-row flex-wrap items-center gap-1.5">
							<Text
								className={`${
									isLandscape ? "text-base" : "text-lg"
								} font-bold tracking-tight text-slate-900 dark:text-slate-100`}
								numberOfLines={1}
							>
								{order.title}
							</Text>
							{order.tag ? (
								<View
									className={`flex-row items-center gap-1 rounded-full border px-1.5 py-0.5 ${theme.tagWrap}`}
								>
									{showBag ? (
										<Ionicons
											name="bag-handle-outline"
											size={11}
											color={theme.tagIcon}
										/>
									) : null}
									<Text
										className={`font-mono text-[10px] font-bold ${theme.tagText}`}
									>
										{order.tag}
									</Text>
								</View>
							) : null}
						</View>

						<Text
							className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400"
							numberOfLines={1}
						>
							{order.orderCode} • {order.sourceLabel}
						</Text>
					</View>

					<View className="items-end gap-1">
						<OrderTimerBadge
							elapsedSeconds={elapsedSeconds}
							wrapClass={theme.timerWrap}
							color={theme.timer}
							iconColor={theme.timerIcon}
							urgent={theme.timerUrgent}
						/>
						<OrderStatusBadge
							status={order.paymentStatus}
							paymentMethod={order.paymentMethod}
						/>
					</View>
				</View>

				{order.paymentMethod === "qris" && order.paymentStatus === "unpaid" ? (
					<View className="mb-2 flex-row items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 dark:border-rose-900/60 dark:bg-rose-950/60">
						<Ionicons name="alert-circle" size={14} color="#E11D48" />
						<Text className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
							Konfirmasi QRIS Diperlukan (Cek Notif Bank/GoBiz)
						</Text>
					</View>
				) : null}

				{isLandscape ? (
					<ScrollView
						className="my-0.5 flex-1"
						showsVerticalScrollIndicator={false}
						nestedScrollEnabled
					>
						<OrderItemList items={order.items} compact />
					</ScrollView>
				) : (
					<OrderItemList items={order.items} />
				)}

				{order.status !== "cancelled" ? (
					<View onStartShouldSetResponder={() => true}>
						<OrderActionButtons
							status={order.status}
							primaryClass={theme.primary}
							primaryTextClass={theme.primaryText}
							onStartPreparing={() => onStartPreparing(order.id)}
							onPrint={() => onPrint(order.id)}
							onMarkReady={() => onMarkReady(order.id)}
							onMarkServed={() => onMarkServed(order.id)}
						/>
					</View>
				) : null}
			</View>
		</Pressable>
	);
}
