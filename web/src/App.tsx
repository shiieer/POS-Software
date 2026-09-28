import { useState } from "react";
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

function App() {
	const { tableId, tableName, status } = useTable();
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

	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

	const activeCategory = selectedCategory || categories[0] || "";

	if (status === "loading") {
		return (
			<div className="min-h-screen bg-surface flex items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
					<p className="text-xs text-outline font-medium">Verifying table...</p>
				</div>
			</div>
		);
	}

	if (status === "invalid" || status === "no_qr") {
		return <InvalidQR reason={status} />;
	}

	if (orderResult) {
		return <OrderSuccess order={orderResult} onNewOrder={clearCart} />;
	}

	return (
		<div className="bg-surface text-on-surface min-h-screen flex flex-col max-w-md mx-auto antialiased shadow-sm selection:bg-secondary-container selection:text-on-secondary-container">
			<header className="bg-surface/90 backdrop-blur-md w-full top-0 sticky border-b border-surface-container-highest/60 z-40">
				<Header storeName="Kedai AFFO" tableName={tableName} />

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
						<div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
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
				submitting={submitting}
				onConfirm={async (customerName, notes) => {
					await submitOrder(customerName, notes);
					setIsCheckoutOpen(false);
				}}
			/>
		</div>
	);
}

export default App;
