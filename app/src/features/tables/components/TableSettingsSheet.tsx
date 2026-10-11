import { useRef } from "react";
import {
	Animated,
	Modal,
	PanResponder,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TableApi } from "@/types/api/table";

type Props = {
	table: TableApi | null;
	active: boolean;
	updating: boolean;
	onActiveChange: (active: boolean) => void;
	onClose: () => void;
	onSave: () => void;
	onViewQr: (table: TableApi) => void;
	onDelete: (table: TableApi) => void;
};

export default function TableSettingsSheet({
	table,
	active,
	updating,
	onActiveChange,
	onClose,
	onSave,
	onViewQr,
	onDelete,
}: Props) {
	const insets = useSafeAreaInsets();
	const sheetY = useRef(new Animated.Value(0)).current;
	const panResponder = useRef(
		PanResponder.create({
			onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 4,
			onPanResponderMove: (_, gesture) => {
				if (gesture.dy > 0) sheetY.setValue(gesture.dy);
			},
			onPanResponderRelease: (_, gesture) => {
				if (gesture.dy > 110) {
					Animated.timing(sheetY, {
						toValue: 700,
						duration: 160,
						useNativeDriver: true,
					}).start(() => {
						onClose();
						sheetY.setValue(0);
					});
				} else {
					Animated.spring(sheetY, {
						toValue: 0,
						useNativeDriver: true,
					}).start();
				}
			},
		}),
	).current;

	return (
		<Modal visible={!!table} transparent animationType="slide" onRequestClose={onClose}>
			<View className="flex-1 justify-end bg-[#111C2D]/45">
				<Animated.View
					style={{
						transform: [{ translateY: sheetY }],
						maxHeight: "92%",
						width: "100%",
						alignSelf: "stretch",
						flexDirection: "column",
						borderTopLeftRadius: 28,
						borderTopRightRadius: 28,
						backgroundColor: "#FFFFFF",
						paddingHorizontal: 20,
						paddingTop: 12,
						paddingBottom: Math.max(insets.bottom, 16),
					}}
				>
					<View {...panResponder.panHandlers} className="mb-4 h-6 items-center justify-center">
						<View className="h-1 w-12 rounded-full bg-slate-300" />
					</View>
					<View className="mb-5">
						<Text className="text-lg font-extrabold text-[#111C2D]">{table?.name} Settings</Text>
						<Text className="mt-1 text-xs text-slate-500">Table {table?.id} · QR assigned</Text>
					</View>

					<ScrollView style={{ flexGrow: 0, flexShrink: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
						<Text className="mb-2 text-[11px] font-bold tracking-widest text-slate-500">TABLE STATUS</Text>
						<View className="mb-5 flex-row rounded-2xl bg-[#EEF2FF] p-1">
							{([
								{ active: true, label: "Active", icon: "radio-button-on" },
								{ active: false, label: "Maintenance", icon: "construct-outline" },
							] as const).map((option) => (
								<Pressable
									key={option.label}
									onPress={() => onActiveChange(option.active)}
									className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3 ${active === option.active ? "border border-[#DCE4F2] bg-white" : ""}`}
								>
									<Ionicons name={option.icon} size={16} color={active === option.active ? (option.active ? "#0284C7" : "#BE123C") : "#94A3B8"} />
									<Text className={`text-xs font-bold ${active === option.active ? (option.active ? "text-[#0284C7]" : "text-rose-700") : "text-slate-500"}`}>
										{option.label}
									</Text>
								</Pressable>
							))}
						</View>

						<Text className="mb-2 text-[11px] font-bold tracking-widest text-slate-500">CONFIGURATION & DETAILS</Text>
						<View className="mb-5 overflow-hidden rounded-2xl bg-[#EEF2FF]">
							<View className="flex-row items-center justify-between border-b border-white px-4 py-3">
								<View className="flex-row items-center gap-3"><Ionicons name="grid-outline" size={17} color="#64748B" /><Text className="text-sm text-slate-600">Table identifier</Text></View>
								<Text className="text-sm font-bold text-[#0284C7]">{table?.name}</Text>
							</View>
							<View className="flex-row items-center justify-between px-4 py-3">
								<View className="flex-row items-center gap-3"><Ionicons name="qr-code-outline" size={17} color="#64748B" /><Text className="text-sm text-slate-600">QR code</Text></View>
								<Text className="text-sm font-semibold text-slate-700">Assigned</Text>
							</View>
						</View>

						<Text className="mb-2 text-[11px] font-bold tracking-widest text-slate-500">QR CODE MANAGEMENT</Text>
						<View className="mb-5 overflow-hidden rounded-2xl bg-[#EEF2FF]">
							<Pressable onPress={() => table && onViewQr(table)} className="flex-row items-center px-4 py-3.5">
								<Ionicons name="qr-code-outline" size={19} color="#0284C7" />
								<View className="ml-3 flex-1"><Text className="text-sm font-bold text-slate-700">View current QR code</Text><Text className="mt-0.5 text-[11px] text-slate-500">Opens the menu linked to this table</Text></View>
								<Ionicons name="chevron-forward" size={17} color="#94A3B8" />
							</Pressable>
						</View>

						<Text className="mb-2 text-[11px] font-bold tracking-widest text-rose-600">DANGER ZONE</Text>
						<Pressable onPress={() => table && onDelete(table)} className="mb-2 flex-row items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-100 py-3">
							<Ionicons name="trash-outline" size={16} color="#BE123C" />
							<Text className="text-sm font-bold text-rose-700">Delete {table?.name}</Text>
						</Pressable>
						<Text className="mb-4 text-center text-[10px] text-slate-500">This deletes the table and saved QR image. Orders are kept without a table assignment.</Text>
					</ScrollView>

					<View className="flex-row gap-3 border-t border-slate-100 pt-3">
						<Pressable onPress={onClose} className="flex-1 items-center rounded-xl border border-slate-200 py-3"><Text className="font-bold text-slate-700">Cancel</Text></Pressable>
						<Pressable onPress={onSave} disabled={updating} className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-[#0284C7] py-3"><Ionicons name="checkmark" size={18} color="white" /><Text className="font-bold text-white">{updating ? "Saving..." : "Save Changes"}</Text></Pressable>
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
}
