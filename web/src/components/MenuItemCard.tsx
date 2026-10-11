import type { MenuItem } from "../types";
import { formatCurrency } from "../utils/formatCurrency";

interface MenuItemCardProps {
	item: MenuItem;
	quantity?: number;
	onAdd: (item: MenuItem) => void;
	onRemove: (itemId: number) => void;
}

export default function MenuItemCard({
	item,
	quantity = 0,
	onAdd,
	onRemove,
}: MenuItemCardProps) {
	const formattedPrice = formatCurrency(item.price);

	return (
		<article className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest/80 p-3.5 flex gap-3.5 items-center relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
			<div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
			{item.image_url ? (
				<img
					src={item.image_url}
					alt={item.name}
					className="w-20 h-20 object-cover rounded-xl border border-surface-container-highest/50 shrink-0 shadow-inner"
				/>
			) : (
				<div className="w-20 h-20 rounded-xl border border-surface-container-highest/50 shrink-0 bg-surface-container-low flex items-center justify-center text-outline">
					<span className="material-symbols-outlined text-[24px]">
						local_cafe
					</span>
				</div>
			)}
			<div className="flex-grow min-w-0">
				<div className="flex justify-between items-start mb-1">
					<h3 className="text-[16px] font-bold text-on-surface truncate pr-1">
						{item.name}
					</h3>
					<span className="text-xs font-bold text-primary bg-surface-container-low px-2 py-0.5 rounded-lg border border-surface-container-highest shrink-0">
						{formattedPrice}
					</span>
				</div>
				<p className="text-[12px] text-on-surface-variant line-clamp-2 leading-relaxed">
					{item.description || "Freshly prepared to order."}
				</p>
			</div>

			{quantity === 0 ? (
				<button
					onClick={() => onAdd(item)}
					className="h-9 w-9 shrink-0 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary rounded-xl flex items-center justify-center transition-all active:scale-95 border border-primary/20 hover:border-transparent"
				>
					<span className="material-symbols-outlined text-[20px]">add</span>
				</button>
			) : (
				<div className="flex items-center gap-1.5 shrink-0 bg-surface-container-low p-1 rounded-xl border border-surface-container-highest">
					<button
						onClick={() => onRemove(item.id)}
						className="h-7 w-7 bg-surface-container-lowest hover:bg-error-container/40 text-on-surface hover:text-error rounded-lg flex items-center justify-center transition-all active:scale-90 border border-surface-container-highest"
					>
						<span className="material-symbols-outlined text-[16px]">
							remove
						</span>
					</button>
					<span className="text-sm font-bold text-on-surface w-5 text-center">
						{quantity}
					</span>
					<button
						onClick={() => onAdd(item)}
						className="h-7 w-7 bg-primary text-on-primary hover:opacity-90 rounded-lg flex items-center justify-center transition-all active:scale-90 shadow-xs"
					>
						<span className="material-symbols-outlined text-[16px]">add</span>
					</button>
				</div>
			)}
		</article>
	);
}
