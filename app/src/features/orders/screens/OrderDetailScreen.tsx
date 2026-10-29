import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import ScreenContainer from "@/shared/components/ScreenContainer";
import { useOrderDetail } from "../hooks/useOrderDetail";
import OrderDetailHeader from "../components/OrderDetailHeader";
import OrderDetailItemsCard from "../components/OrderDetailItemsCard";
import OrderDetailInfoCard from "../components/OrderDetailInfoCard";
import OrderDetailActions from "../components/OrderDetailActions";
import ConfirmOrderModal, {
	ConfirmOrderActionType,
} from "../components/ConfirmOrderModal";

type Props = {
	orderId: number;
	onBack: () => void;
};

export default function OrderDetailScreen({ orderId, onBack }: Props) {
	const {
		order,
		loading,
		updating,
		error,
		elapsedSeconds,
		isUrgent,
		startPreparing,
		markReady,
		markPaid,
		cancelOrder,
		printOrder,
	} = useOrderDetail(orderId);

	const [confirmAction, setConfirmAction] =
		useState<ConfirmOrderActionType | null>(null);

	const handleConfirm = async () => {
		if (!confirmAction) return;
		try {
			if (confirmAction === "start_preparing") {
				await startPreparing();
			} else if (confirmAction === "mark_paid") {
				await markPaid();
			} else if (confirmAction === "cancel") {
				await cancelOrder();
				setConfirmAction(null);
				onBack();
				return;
			}
		} finally {
			setConfirmAction(null);
		}
	};

	return (
		<ScreenContainer showHeader={false}>
			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#2563EB" />
				</View>
			) : error || !order ? (
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-center text-red-500">
						{error ?? "Order not found"}
					</Text>
				</View>
			) : (
				<>
					<OrderDetailHeader order={order} onBack={onBack} />

					<ScrollView
						className="flex-1"
						contentContainerClassName="px-4 py-4 gap-4 pb-8"
						showsVerticalScrollIndicator={false}
					>
						<OrderDetailItemsCard items={order.items} />

						<OrderDetailInfoCard
							order={order}
							elapsedSecond={elapsedSeconds}
							isUrgent={isUrgent}
						/>

						<OrderDetailActions
							order={order}
							updating={updating}
							onStartPreparing={() => setConfirmAction("start_preparing")}
							onMarkReady={markReady}
							onMarkPaid={() => setConfirmAction("mark_paid")}
							onCancel={() => setConfirmAction("cancel")}
							onPrint={printOrder}
						/>
					</ScrollView>

					<ConfirmOrderModal
						visible={!!confirmAction}
						actionType={confirmAction}
						orderCode={order.orderCode}
						orderTitle={order.title}
						totalAmount={order.totalAmount}
						paymentMethod={order.paymentMethod}
						paymentProofUrl={order.paymentProofUrl}
						loading={updating}
						onClose={() => setConfirmAction(null)}
						onConfirm={handleConfirm}
					/>
				</>
			)}
		</ScreenContainer>
	);
}
