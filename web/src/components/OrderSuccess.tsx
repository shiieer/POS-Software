import type { OrderOut } from "../types";

interface OrderSuccessProps {
  order: OrderOut;
  onNewOrder: () => void;
}

export default function OrderSuccess({ order, onNewOrder }: OrderSuccessProps) {
  const formattedTotal =
    order.total_amount >= 100
      ? `Rp ${order.total_amount.toLocaleString("id-ID")}`
      : `$${order.total_amount.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-3xl shadow-lg border border-surface-container-highest/80 p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
          <span className="material-symbols-outlined text-[32px]">check_circle</span>
        </div>

        <h2 className="text-xl font-bold text-on-surface mb-1">
          Order Submitted!
        </h2>
        <p className="text-sm text-outline mb-6">
          Your order #{order.id} has been sent to the kitchen
        </p>

        <div className="bg-surface-container-low rounded-2xl p-4 mb-6 text-left border border-surface-container-highest">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-on-surface-variant">Order ID</span>
            <span className="font-semibold text-on-surface">#{order.id}</span>
          </div>
          {order.table_name && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-on-surface-variant">Table</span>
              <span className="font-semibold text-on-surface">
                {order.table_name}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm mb-2">
            <span className="text-on-surface-variant">Status</span>
            <span className="font-semibold text-primary capitalize">
              {order.status}
            </span>
          </div>
          <div className="border-t border-surface-container-highest my-3"></div>
          {order.items.map((item) => {
            const formattedItemSubtotal =
              item.subtotal >= 100
                ? `Rp ${item.subtotal.toLocaleString("id-ID")}`
                : `$${item.subtotal.toFixed(2)}`;

            return (
              <div key={item.id} className="flex justify-between text-sm mb-1">
                <span className="text-on-surface-variant">
                  {item.menu_item_name} × {item.quantity}
                </span>
                <span className="text-on-surface font-medium">
                  {formattedItemSubtotal}
                </span>
              </div>
            );
          })}
          <div className="border-t border-surface-container-highest my-3"></div>
          <div className="flex justify-between text-base font-bold">
            <span className="text-on-surface">Total</span>
            <span className="text-primary">
              {formattedTotal}
            </span>
          </div>
        </div>

        <button
          onClick={onNewOrder}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary via-[#0284c7] to-secondary text-white font-bold transition-all shadow-md shadow-primary/20 active:scale-[0.98]"
        >
          Order More
        </button>
      </div>
    </div>
  );
}
