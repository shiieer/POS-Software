import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/shared/theme/ThemeProvider";
import { Order } from "../types/order";
import OrderStatusBadge from "./OrderStatusBadge";
import KitchenStatusBadge from "./KitchenStatusBadge";

type Props = {
	order: Order;
	onBack: () => void;
};

export default function OrderDetailHeader({ order, onBack }: Props) {
	const { isDark } = useAppTheme();

	return (
		<View className="flex-row items-center justify-between border-b border-sky-100/80 bg-white/85 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/90">
			<View className="flex-row items-center">
				<Pressable onPress={onBack} className="mr-1 p-1">
					<Ionicons
						name="chevron-back"
						size={24}
						color={isDark ? "#F1F5F9" : "#0F172A"}
					/>
				</Pressable>

				<Text className="mr-2 text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
					{order.orderCode}
				</Text>
			</View>

			<View className="flex-row items-center gap-2">
				<OrderStatusBadge
					status={order.paymentStatus}
					paymentMethod={order.paymentMethod}
				/>
				<KitchenStatusBadge status={order.status} />
			</View>
		</View>
	);
}
