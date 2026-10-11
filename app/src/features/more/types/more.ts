import { Ionicons } from "@expo/vector-icons";

export type MoreDestination = "tables" | "staff" | "profile" | "reports" | "qris" | "settings";

export type MoreItem = {
	key: string;
	label: string;
	icon: React.ComponentProps<typeof Ionicons>["name"];
	iconBg?: string;
	iconColor?: string;
	danger?: boolean;
	destination?: MoreDestination;
	badge?: string;
	showToggle?: boolean;
};

export type MoreSnapshot = {
	staff: number;
	tables: number;
	openTickets: number;
	sales: number;
};
