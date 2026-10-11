import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { MoreDestination, MoreItem } from "../types/more";
import MoreOption from "../components/MoreOption";
import ScreenContainer from "@/shared/components/ScreenContainer";
import MoreHeader from "../components/MoreHeader";
import ProfileCard from "../components/ProfileCard";
import SnapshotGrid from "../components/SnapshotGrid";
import LogoutModal from "@/shared/components/LogoutModal";
import { useMoreOverview } from "../hooks/useMoreOverview";

type Props = {
	onNavigate: (destination: MoreDestination) => void;
};

export default function MoreScreen({ onNavigate }: Props) {
	const snapshot = useMoreOverview();
	const [alertsOn, setAlertsOn] = useState(true);
	const [showLogout, setShowLogout] = useState(false);

	const operations: MoreItem[] = [
		{
			key: "staff",
			label: "Staff Management",
			icon: "people-outline",
			destination: "staff",
			badge: String(snapshot.staff),
		},
		{
			key: "tables",
			label: "Table Layout",
			icon: "grid-outline",
			destination: "tables",
		},
		{
			key: "reports",
			label: "Shift Reports",
			icon: "stats-chart-outline",
			destination: "reports",
		},
		{
			key: "qris",
			label: "QRIS Payment Settings",
			icon: "qr-code-outline",
			destination: "qris",
		},
	];

	const personal: MoreItem[] = [
		{
			key: "profile",
			label: "My Profile",
			icon: "person-outline",
			destination: "profile",
		},
		{
			key: "notifications",
			label: "Notifications",
			icon: "notifications-outline",
			showToggle: true,
		},
	];

	const system: MoreItem[] = [
		{ key: "settings", label: "App Settings", icon: "settings-outline", destination: "settings" },
		{ key: "help", label: "Help & Support", icon: "help-circle-outline" },
		{ key: "logout", label: "Log Out", icon: "log-out-outline", danger: true },
	];

	function handlePress(item: MoreItem) {
		if (item.showToggle) return;
		if (item.key === "logout") {
			setShowLogout(true);
			return;
		}
		if (item.destination) onNavigate(item.destination);
	}

	function renderSection(title: string, items: MoreItem[]) {
		return (
			<View className="mb-5">
				<Text className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
					{title}
				</Text>
				<View className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-sm">
					{items.map((item, index) => (
						<MoreOption
							key={item.key}
							item={item}
							isLast={index === items.length - 1}
							onPress={() => handlePress(item)}
							toggleValue={item.showToggle ? alertsOn : undefined}
							onToggle={
								item.showToggle ? setAlertsOn : undefined
							}
						/>
					))}
				</View>
			</View>
		);
	}

	return (
		<ScreenContainer showHeader={false}>
			<MoreHeader />
			<ScrollView
				className="flex-1"
				contentContainerClassName="px-4 py-4 pb-10"
				showsVerticalScrollIndicator={false}
			>
				<ProfileCard onEditProfile={() => onNavigate("profile")} />
				<SnapshotGrid snapshot={snapshot} />
				{renderSection("Operations", operations)}
				{renderSection("Personal", personal)}
				{renderSection("System", system)}
			</ScrollView>
			<LogoutModal
				visible={showLogout}
				onClose={() => setShowLogout(false)}
			/>
		</ScreenContainer>
	);
}
