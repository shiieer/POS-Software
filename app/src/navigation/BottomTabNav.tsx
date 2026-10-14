import { useRef } from "react";
import { createBottomTabNavigator } from "expo-router/js-tabs";
import { Text, View, type ColorValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { NewOrderScreen } from "@/features/new-order";
import { OrdersNavigator } from "@/features/orders";
import { MenuNavigator } from "@/features/menu";
import { MoreNavigator } from "@/features/more";
import { RootTabParamList } from "./types";

const Tab = createBottomTabNavigator<RootTabParamList>();

function TabIcon({
	name,
	color,
	focused,
}: {
	name: keyof typeof Ionicons.glyphMap;
	color: ColorValue;
	focused: boolean;
}) {
	return (
		<View
			className={`items-center rounded-xl px-3 py-1 ${
				focused ? "bg-sky-50" : ""
			}`}
		>
			<Ionicons name={name} color={color as string} size={22} />
		</View>
	);
}

export default function BottomTabNav() {
	const menuResetRef = useRef<(() => void) | null>(null);

	return (
		<Tab.Navigator
			initialRouteName="NewOrder"
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					height: 76,
					paddingTop: 6,
					paddingBottom: 10,
					backgroundColor: "rgba(255,255,255,0.95)",
					borderTopColor: "rgba(191,199,210,0.8)",
					elevation: 8,
					shadowColor: "#000",
					shadowOpacity: 0.08,
					shadowRadius: 12,
					shadowOffset: { width: 0, height: -2 },
				},
				tabBarActiveTintColor: "#0284C7",
				tabBarInactiveTintColor: "#3F4850",
				tabBarLabelStyle: {
					fontSize: 11,
					fontWeight: "600",
					marginTop: 0,
				},
			}}
		>
			<Tab.Screen
				name="Orders"
				component={OrdersNavigator}
				options={{
					tabBarIcon: ({ color, focused }) => (
						<TabIcon
							name="receipt-outline"
							color={color}
							focused={focused}
						/>
					),
				}}
			/>

			<Tab.Screen
				name="NewOrder"
				component={NewOrderScreen}
				options={{
					tabBarLabel: ({ focused, color }) => (
						<Text
							className="mt-0.5 text-[11px]"
							style={{
								color,
								fontWeight: focused ? "700" : "600",
							}}
						>
							New Order
						</Text>
					),
					tabBarIcon: ({ color, focused }) => (
						<TabIcon
							name={focused ? "add-circle" : "add-circle-outline"}
							color={color}
							focused={focused}
						/>
					),
				}}
			/>

			<Tab.Screen
				name="Menu"
				options={{
					tabBarIcon: ({ color, focused }) => (
						<TabIcon
							name="book-outline"
							color={color}
							focused={focused}
						/>
					),
				}}
				listeners={{
					tabPress: () => {
						menuResetRef.current?.();
					},
				}}
			>
				{() => <MenuNavigator resetRef={menuResetRef} />}
			</Tab.Screen>

			<Tab.Screen
				name="More"
				component={MoreNavigator}
				options={{
					tabBarIcon: ({ color, focused }) => (
						<TabIcon
							name="ellipsis-horizontal"
							color={color}
							focused={focused}
						/>
					),
				}}
			/>
		</Tab.Navigator>
	);
}
