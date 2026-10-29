import { useState } from "react";
import { MoreDestination } from "./types/more";
import { TableScreen } from "../tables";
import MoreScreen from "./screens/MoreScreen";
import { StaffScreen } from "../staff";
import { ReportsScreen } from "../reports";
import { ProfileScreen } from "../profile";
import QrisSettingsScreen from "./screens/QrisSettingsScreen";
import PosSettingsScreen from "./screens/PosSettingsScreen";
import { useUserRole } from "@/shared/hooks/useUserRole";

export default function MoreNavigator() {
	const { isAdmin } = useUserRole();
	const [destination, setDestination] = useState<MoreDestination | null>(
		null,
	);

	if (destination === "tables") {
		return <TableScreen onBack={() => setDestination(null)} />;
	}

	if (destination === "staff" && isAdmin) {
		return <StaffScreen onBack={() => setDestination(null)} />;
	}

	if (destination === "reports" && isAdmin) {
		return <ReportsScreen onBack={() => setDestination(null)} />;
	}

	if (destination === "profile") {
		return <ProfileScreen onBack={() => setDestination(null)} />;
	}

	if (destination === "qris") {
		return <QrisSettingsScreen onBack={() => setDestination(null)} />;
	}

	if (destination === "settings" && isAdmin) {
		return <PosSettingsScreen onBack={() => setDestination(null)} />;
	}

	return <MoreScreen onNavigate={(dest) => setDestination(dest)} />;
}
