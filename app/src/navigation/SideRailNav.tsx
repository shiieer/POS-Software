import { JSX, useState } from "react";
import { View, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { OrdersNavigator } from "@/features/orders";
import { NewOrderScreen } from "@/features/new-order";
import { MenuNavigator } from "@/features/menu";
import { MoreNavigator } from "@/features/more";
import { SideTabKey } from "./types";

const TABS: {
	key: SideTabKey;
	label: string;
	icon: keyof typeof Ionicons.glyphMap;
}[] = [
	{ key: "Orders", label: "Orders", icon: "receipt-outline" },
	{ key: "NewOrder", label: "New Order", icon: "add-circle-outline" },
	{ key: "Menu", label: "Menu", icon: "book-outline" },
	{ key: "More", label: "More", icon: "ellipsis-horizontal" },
];

const SCREEN_MAP: Record<SideTabKey, () => JSX.Element> = {
	Orders: OrdersNavigator,
	NewOrder: NewOrderScreen,
	Menu: MenuNavigator,
	More: MoreNavigator,
};

export default function SideRailNav() {
	const [activeTab, setActiveTab] = useState<SideTabKey>("NewOrder");
	const ActiveScreen = SCREEN_MAP[activeTab];

	return (
		<SafeAreaView className="flex-1 flex-row bg-[#F0F5FA]">
			<View className="w-[200px] border-r border-[#D8E3FB]/80 bg-[#F0F5FA] px-3 py-4">
				<View className="flex-1 justify-between">
					<View className="gap-1.5">
						{TABS.filter((tab) => tab.key !== "More").map((tab) => {
							const isActive = tab.key === activeTab;

							return (
								<Pressable
									key={tab.key}
									onPress={() => setActiveTab(tab.key)}
									className={`flex-row items-center gap-3 rounded-xl px-3.5 py-2.5 ${
										isActive
											? "border border-[#BFC7D2]/60 bg-white shadow-sm"
											: ""
									}`}
								>
									<Ionicons
										name={tab.icon}
										size={20}
										color={isActive ? "#0284C7" : "#707881"}
									/>
									<Text
										className={`text-sm ${
											isActive
												? "font-bold text-[#006194]"
												: "font-semibold text-[#3F4850]"
										}`}
									>
										{tab.label}
									</Text>
								</Pressable>
							);
						})}
					</View>
					{TABS.filter((tab) => tab.key === "More").map((tab) => {
						const isActive = tab.key === activeTab;

						return (
							<Pressable
								key={tab.key}
								onPress={() => setActiveTab(tab.key)}
								className={`flex-row items-center gap-3 rounded-xl px-3.5 py-2.5 ${
									isActive
										? "border border-[#BFC7D2]/60 bg-white shadow-sm"
										: ""
								}`}
							>
								<Ionicons
									name={tab.icon}
									size={20}
									color={isActive ? "#0284C7" : "#707881"}
								/>
								<Text
									className={`text-sm ${
										isActive
											? "font-bold text-[#006194]"
											: "font-semibold text-[#3F4850]"
									}`}
								>
									{tab.label}
								</Text>
							</Pressable>
						);
					})}
				</View>
			</View>

			<View className="flex-1">
				<ActiveScreen />
			</View>
		</SafeAreaView>
	);
}
