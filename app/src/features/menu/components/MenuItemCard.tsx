import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { ManagedMenuItem } from "../types/menu";
import { formatRp } from "@/utils";
import AvailabilitySwitch from "./AvailabilitySwitch";

type Props = {
	item: ManagedMenuItem;
	featured?: boolean;
	onPress: () => void;
	onToggle: (item: ManagedMenuItem) => void;
	onDelete?: (item: ManagedMenuItem) => void;
};

export default function MenuItemCard({
	item,
	featured = false,
	onPress,
	onToggle,
	onDelete,
}: Props) {
	const available = item.isAvailable;

	return (
		<View
			className={`relative mb-3 overflow-hidden rounded-2xl border p-3.5 shadow-sm ${
				available
					? "border-[#BFC7D2]/70 bg-white"
					: "border-red-200 bg-white/70 opacity-85"
			}`}
		>
			<View
				className={`absolute bottom-0 left-0 top-0 w-1.5 rounded-l-2xl ${
					available ? "bg-[#0284C7]" : "bg-[#BA1A1A]"
				}`}
			/>

			<View className="flex-row items-center justify-between gap-3 pl-1">
				<Pressable
					onPress={onPress}
					className="min-w-0 flex-1 flex-row items-center gap-3"
				>
					<View className="relative">
						<View
							className={`h-14 w-14 overflow-hidden rounded-xl border border-[#BFC7D2]/70 bg-[#F0F3FF] ${
								available ? "" : "opacity-70"
							}`}
						>
							{item.image ? (
								<Image
									source={{ uri: item.image }}
									style={{ width: "100%", height: "100%" }}
									contentFit="cover"
								/>
							) : (
								<View className="flex-1 items-center justify-center">
									<Ionicons
										name="cafe-outline"
										size={20}
										color="#707881"
									/>
								</View>
							)}
						</View>
						{featured ? (
							<View className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#0284C7]" />
						) : null}
					</View>

					<View className="min-w-0 flex-1">
						<View className="flex-row flex-wrap items-center gap-1.5">
							<Text
								className={`text-sm font-bold text-[#111C2D] ${
									available
										? ""
										: "line-through decoration-red-400"
								}`}
								numberOfLines={1}
							>
								{item.name}
							</Text>
							{featured ? (
								<View className="rounded bg-sky-100 px-1.5 py-0.5">
									<Text className="text-[10px] font-bold uppercase tracking-wider text-[#006194]">
										Popular
									</Text>
								</View>
							) : null}
						</View>

						{available ? (
							<Text
								className="mt-0.5 text-xs text-[#3F4850]"
								numberOfLines={1}
							>
								{item.description?.trim() || item.category}
							</Text>
						) : (
							<View className="mt-0.5 flex-row items-center gap-1">
								<Ionicons
									name="warning"
									size={14}
									color="#DC2626"
								/>
								<Text className="text-xs font-semibold text-red-600">
									Sold Out Today
								</Text>
							</View>
						)}

						<View className="mt-1 flex-row items-center gap-2">
							<Text
								className={`text-xs font-bold ${
									available
										? "text-[#006194]"
										: "text-[#707881] line-through"
								}`}
							>
								{formatRp(item.price)}
							</Text>
							<Text
								className={`text-[11px] font-medium ${
									available
										? "text-[#707881]"
										: "font-semibold text-red-500"
								}`}
							>
								{available ? item.category : "0 in stock"}
							</Text>
						</View>
					</View>
				</Pressable>

				<View className="flex-row items-center gap-2">
					<Pressable
						onPress={onPress}
						className="h-8 w-8 items-center justify-center rounded-xl border border-[#BFC7D2]"
						accessibilityLabel="Edit item"
					>
						<Ionicons name="pencil" size={16} color="#3F4850" />
					</Pressable>
					{onDelete ? (
						<Pressable
							onPress={() => onDelete(item)}
							className="h-8 w-8 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 active:bg-rose-100"
							accessibilityLabel="Delete item"
						>
							<Ionicons name="trash-outline" size={16} color="#E11D48" />
						</Pressable>
					) : null}
					<AvailabilitySwitch
						value={available}
						onValueChange={() => onToggle(item)}
					/>
				</View>
			</View>
		</View>
	);
}
