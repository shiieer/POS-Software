interface HeaderProps {
	storeName: string;
	tableName: string;
	hasNotification?: boolean;
	onBellClick: () => void;
}

export default function Header({ storeName, tableName, hasNotification = false, onBellClick }: HeaderProps) {
	return (
		<div className="flex items-center justify-between px-5 py-3.5 w-full">
			{/* Store identity */}
			<div className="flex items-center gap-2.5">
				<div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-secondary-container flex items-center justify-center shadow-sm shadow-primary/20 text-white">
					<span className="material-symbols-outlined text-[20px]">
						local_cafe
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<span className="text-[17px] font-bold tracking-tight text-on-surface">
						{storeName}
					</span>
					<span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-surface-container px-1.5 py-0.5 rounded-md">
						POS
					</span>
				</div>
			</div>

			{/* Right side: bell + table pill */}
			<div className="flex items-center gap-2">
				{/* Notification bell — always visible */}
				<button
					type="button"
					onClick={onBellClick}
					aria-label={hasNotification ? "Ada pembaruan pesanan" : "Lihat status pesanan"}
					className="relative flex h-9 w-9 items-center justify-center rounded-full border border-surface-container-highest bg-surface-container-low text-outline shadow-sm transition-colors hover:bg-surface-container hover:text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
				>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						className="h-[18px] w-[18px]"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
						<path d="M10 21h4" />
					</svg>
					{hasNotification && (
						<span
							aria-hidden="true"
							className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-surface-container-low bg-rose-500"
						/>
					)}
				</button>

				{/* Table pill */}
				<div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-full border border-surface-container-highest shadow-sm">
					<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
					<span className="text-[12px] font-bold text-on-surface tracking-wide uppercase">
						{tableName}
					</span>
				</div>
			</div>
		</div>
	);
}
