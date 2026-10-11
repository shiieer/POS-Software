export function formatCurrency(value: number): string {
	return value >= 100
		? `Rp ${value.toLocaleString("id-ID")}`
		: `$${value.toFixed(2)}`;
}
