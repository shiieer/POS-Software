import { formatCurrency } from "../utils/formatCurrency";

interface CartBarProps {
  totalItems: number;
  totalPrice: number;
  tableName: string;
  submitting: boolean;
  onSubmit: () => void;
}

export default function CartBar({
  totalItems,
  totalPrice,
  tableName,
  submitting,
  onSubmit,
}: CartBarProps) {
  if (totalItems === 0) return null;

  const formattedPrice = formatCurrency(totalPrice);

  return (
    <div className="fixed bottom-0 left-0 w-full px-4 py-4 z-50 bg-gradient-to-t from-surface via-surface/90 to-transparent pointer-events-none pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
      <div className="w-full">
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="w-full bg-gradient-to-r from-primary via-[#0284c7] to-secondary text-on-primary rounded-2xl py-3.5 px-5 flex items-center justify-between shadow-lg shadow-primary/30 pointer-events-auto active:scale-[0.98] transition-transform duration-150 border border-white/20 disabled:opacity-75"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <span
                className="material-symbols-outlined text-[19px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shopping_bag
              </span>
            </div>
            <div className="text-left">
              <span className="text-sm font-bold block leading-tight">
                {totalItems} {totalItems === 1 ? "Item" : "Items"} in Cart
              </span>
              <span className="text-[11px] text-primary-fixed/90 font-medium">
                {tableName} • Order Ready to Send
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight">
              {formattedPrice}
            </span>
            {submitting ? (
              <svg className="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}

