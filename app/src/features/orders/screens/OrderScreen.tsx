import {
	ActivityIndicator,
	FlatList,
	Pressable,
	RefreshControl,
	Text,
	View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "@/shared/components/ScreenContainer";
import OrderStatusFilter from "../components/OrderStatusFilter";
import { useOrders } from "../hooks/useOrders";
import OrderCard from "../components/OrderCard";
import ShiftOverview from "../components/ShiftOverview";
import { useOrientationLayout } from "@/shared/hooks/useOrientationLayout";

type Props = {
	onOpenOrder: (orderId: number) => void;
};

export default function OrderScreen({ onOpenOrder }: Props) {
	const {
		filters,
		selectedFilter,
		setSelectedFilter,
		counts,
		metrics,
		orders,
		pendingQrisOrders,
		pendingQrisCount,
		loading,
		refreshing,
		error,
		refresh,
		startPreparing,
		markReady,
		markServed,
		printOrder,
	} = useOrders();
	const { isLandscape, width } = useOrientationLayout();

	const contentWidth = isLandscape ? Math.max(300, width - 200) : width;
	const gap = 14;
	const padding = 16;
	const numColumns = isLandscape
		? contentWidth >= 1200
			? 3
			: contentWidth >= 850
				? 3
				: 2
		: 1;
	const cardWidth = isLandscape
		? (contentWidth - padding * 2 - gap * (numColumns - 1)) / numColumns
		: undefined;

	return (
		<ScreenContainer>
			<ShiftOverview metrics={metrics} />
			<OrderStatusFilter
				filters={filters}
				selected={selectedFilter}
				counts={counts}
				onSelect={setSelectedFilter}
			/>

			{pendingQrisCount > 0 ? (
				<Pressable
					onPress={() => {
						if (pendingQrisOrders[0]) {
							onOpenOrder(pendingQrisOrders[0].id);
						}
					}}
					className="mx-4 mb-2 flex-row items-center justify-between rounded-2xl border border-rose-300 bg-rose-50 p-3 shadow-xs dark:border-rose-800 dark:bg-rose-950/80"
				>
					<View className="flex-row items-center gap-2.5 flex-1 pr-2">
						<View className="h-8 w-8 items-center justify-center rounded-xl bg-rose-500">
							<Ionicons name="notifications" size={18} color="#FFFFFF" />
						</View>
						<View className="flex-1">
							<Text className="text-xs font-bold text-rose-900 dark:text-rose-100">
								{pendingQrisCount} Pembayaran QRIS Menunggu Konfirmasi!
							</Text>
							<Text className="text-[10px] text-rose-700 dark:text-rose-300">
								Cek notifikasi masuk bank/GoBiz lalu tap untuk konfirmasi
							</Text>
						</View>
					</View>
					<View className="rounded-xl bg-rose-600 px-3 py-1.5">
						<Text className="text-[10px] font-bold text-white">Konfirmasi</Text>
					</View>
				</Pressable>
			) : null}

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#0284C7" />
				</View>
			) : error ? (
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-center text-red-500">{error}</Text>
				</View>
			) : (
				<FlatList
					key={isLandscape ? `grid-${numColumns}` : "list-1"}
					className="flex-1"
					data={orders}
					numColumns={numColumns}
					columnWrapperStyle={numColumns > 1 ? { gap } : undefined}
					keyExtractor={(item) => String(item.id)}
					contentContainerStyle={{
						paddingHorizontal: padding,
						paddingTop: 12,
						paddingBottom: 24,
					}}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={refresh}
							tintColor="#38BDF8"
						/>
					}
					ListEmptyComponent={
						<Text className="mt-10 text-center text-brand-slate dark:text-slate-400">
							No orders found
						</Text>
					}
					renderItem={({ item }) => (
						<OrderCard
							order={item}
							onPress={() => onOpenOrder(item.id)}
							onStartPreparing={startPreparing}
							onPrint={printOrder}
							onMarkReady={markReady}
							onMarkServed={markServed}
							isLandscape={isLandscape}
							cardWidth={cardWidth}
						/>
					)}
				/>
			)}
		</ScreenContainer>
	);
}
