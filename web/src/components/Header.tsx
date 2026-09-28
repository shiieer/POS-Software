interface HeaderProps {
	storeName: string;
	tableName: string;
}

export default function Header({ storeName, tableName }: HeaderProps) {
	return (
		<div className="flex items-center justify-between px-5 py-3.5 w-full">
			<div className="flex items-center gap-2.5">
				<div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-secondary-container flex items-center justify-center shadow-sm shadow-primary/20 text-white">
					<span className="material-symbols-outlined text-[20px]">
						local_cafe
					</span>
				</div>
				<div>
					<div className="flex items-center gap-1.5">
						<span className="text-[17px] font-bold tracking-tight text-on-surface">
							{storeName}
						</span>
						<span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-surface-container px-1.5 py-0.5 rounded-md">
							POS
						</span>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-full border border-surface-container-highest shadow-sm">
				<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
				<span className="text-[12px] font-bold text-on-surface tracking-wide uppercase">
					{tableName}
				</span>
			</div>
		</div>
	);
}
