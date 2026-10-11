import { useState, useEffect } from "react";
import { useQrisSettings } from "./hooks/useQrisSettings";
import { useMenu } from "./hooks/useMenu";
import { useTable } from "./hooks/useTable";
import { useCart } from "./hooks/useCart";
import Header from "./components/Header";
import CategoryTabs from "./components/CategoryTabs";
import MenuList from "./components/MenuList";
import CartBar from "./components/CartBar";
import CheckoutModal from "./components/CheckoutModal";
import OrderSuccess from "./components/OrderSuccess";
import InvalidQR from "./components/InvalidQR";
import CustomerNotificationCenter from "./components/CustomerNotificationCenter";
import OrderDetailModal from "./components/OrderDetailModal";
import { useCustomerOrderNotifications } from "./hooks/useCustomerOrderNotifications";

function App() {
	const { tableId, tableName, status } = useTable();
	const { merchantName: storeName, qrisImageUrl } = useQrisSettings();
	const { items: menuItems, categories, loading, error: menuError } = useMenu();
	const {
		items: cartItems,
		addItem,
		removeItem,
		clearCart,
		totalItems,
		totalPrice,
		submitOrder,
		submitting,
		orderResult,
		error: cartError,
	} = useCart(tableId);

	const notifications = useCustomerOrderNotifications(tableId);

	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [selectedNotificationOrderId, setSelectedNotificationOrderId] = useState<number | null>(null);

	const activeCategory = selectedCategory || categories[0] || "";

	// Track the order in an effect, not during render
	useEffect(() => {
		if (orderResult && !notifications.records.some((record) => record.order.id === orderResult.id)) {
			notifications.trackOrder(orderResult);
		}
	}, [orderResult, notifications.records, notifications.trackOrder]);

	function openBell() {
		notifications.markAllNotificationsSeen();
		setIsDrawerOpen(true);
	}

	function selectNotificationOrder(orderId: number) {
		notifications.markNotificationSeen(orderId);
		setSelectedNotificationOrderId(orderId);
		setIsDrawerOpen(false);
	}

	useEffect(() => {
		if (notifications.requestedOrderId === null) return;
		if (orderResult) return;
		selectNotificationOrder(notifications.requestedOrderId);
		notifications.clearRequestedOrder();
	}, [notifications.requestedOrderId, orderResult]);

	function handleNewOrder() {
		clearCart();
	}

	if (status === "loading") {
		return (
			<div className="min-h-screen w-full bg-surface flex items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
					<p className="text-xs text-outline font-medium">Verifying table...</p>
				</div>
			</div>
		);
	}

	if (status === "invalid" || status === "no_qr") {
		return <InvalidQR reason={status} />;
	}

	if (orderResult && !isCheckoutOpen) {
		const refreshedOrder = notifications.records.find(
			(record) => record.order.id === orderResult.id,
		)?.order ?? orderResult;
		return (
			<OrderSuccess
				order={refreshedOrder}
				onNewOrder={handleNewOrder}
				qrisImageUrl={qrisImageUrl}
				notifications={notifications}
			/>
		);
	}

	return (
		<div className="bg-surface text-on-surface min-h-screen w-full flex flex-col antialiased selection:bg-secondary-container selection:text-on-secondary-container">
			<header className="bg-surface/90 backdrop-blur-md w-full top-0 sticky border-b border-surface-container-highest/60 z-40">
				<Header
					storeName={storeName}
					tableName={tableName}
					hasNotification={notifications.unreadCount > 0}
					onBellClick={openBell}
				/>

				{categories.length > 0 && (
					<CategoryTabs
						categories={categories}
						activeCategory={activeCategory}
						onSelect={setSelectedCategory}
					/>
				)}
			</header>

			<main className="flex-grow px-4 py-4 pb-36 flex flex-col gap-3.5">
				{menuError && (
					<div className="p-3.5 bg-error-container/30 border border-error/20 rounded-2xl text-xs text-error font-medium">
						Cannot connect to backend: {menuError}
					</div>
				)}

				{cartError && (
					<div className="p-3.5 bg-error-container/30 border border-error/20 rounded-2xl text-xs text-error font-medium">
						Order error: {cartError}
					</div>
				)}

				{loading ? (
					<div className="py-20 flex flex-col items-center justify-center gap-3">
						<div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
						<p className="text-xs text-outline font-medium">Loading menu...</p>
					</div>
				) : (
					<MenuList
						items={menuItems}
						cartItems={cartItems}
						activeCategory={activeCategory}
						onAddItem={addItem}
						onRemoveItem={removeItem}
					/>
				)}
			</main>

			<CartBar
				totalItems={totalItems}
				totalPrice={totalPrice}
				tableName={tableName}
				submitting={submitting}
				onSubmit={() => setIsCheckoutOpen(true)}
			/>

			<CheckoutModal
				isOpen={isCheckoutOpen}
				onClose={() => setIsCheckoutOpen(false)}
				items={cartItems}
				totalPrice={totalPrice}
				tableName={tableName}
				qrisImageUrl={qrisImageUrl}
				submitting={submitting}
				onConfirm={async (customerName, notes, paymentMethod) => {
					const result = await submitOrder(customerName, notes, paymentMethod);
					return Boolean(result);
				}}
			/>

			{isDrawerOpen && (
				<CustomerNotificationCenter
					records={notifications.records}
					onClose={() => setIsDrawerOpen(false)}
					onSelectOrder={selectNotificationOrder}
				/>
			)}
			{selectedNotificationOrderId !== null && (() => {
				const selectedOrder = notifications.records.find(
					(record) => record.order.id === selectedNotificationOrderId,
				)?.order;
				return selectedOrder ? (
					<OrderDetailModal
						order={selectedOrder}
						onClose={() => setSelectedNotificationOrderId(null)}
					/>
				) : null;
			})()}
		</div>
	);
}

export default App;
