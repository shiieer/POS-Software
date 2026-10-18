import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { formatRp } from "@/utils";
import { MenuItem } from "@/types/menu";
import QuantityStepper from "./QuantityStepper";

type Props = {
	item: MenuItem;
	cardWidth: number;
	quantity: number;
	note?: string;
	onIncrease: (item: MenuItem) => void;
	onDecrease: (item: MenuItem) => void;
	onEditDetail?: (item: MenuItem) => void;
};

export default function ProductCard({
	item,
	cardWidth,
	quantity,
	note,
	onIncrease,
	onDecrease,
	onEditDetail,
}: Props) {
	const selected = quantity > 0;
	const chilled =
		item.category.toLowerCase().includes("cold") ||
		item.name.toLowerCase().includes("cold") ||
		item.name.toLowerCase().includes("ice");

	return (
		<Pressable
			onPress={() => onIncrease(item)}
			className={`mb-3.5 overflow-hidden rounded-2xl border bg-white p-3 ${
				selected ? "border-cyan-300" : "border-slate-200/90"
			}`}
			style={{
				width: cardWidth,
				shadowColor: selected ? "#0284C7" : "#000",
				shadowOpacity: selected ? 0.12 : 0.03,
				shadowRadius: selected ? 16 : 6,
				shadowOffset: { width: 0, height: 2 },
				elevation: selected ? 3 : 1,
			}}
		>
			<View
				className={`relative mb-2.5 h-28 items-center justify-center overflow-hidden rounded-xl border ${
					chilled
						? "border-cyan-100 bg-cyan-50"
						: "border-sky-100/80 bg-sky-50"
				}`}
			>
				{item.image ? (
					<Image
						source={{ uri: item.image }}
						style={{ width: "100%", height: "100%" }}
						contentFit="cover"
						transition={200}
					/>
				) : (
					<Ionicons
						name={chilled ? "snow-outline" : "cafe-outline"}
						size={36}
						color="#0284C7"
					/>
				)}
				{selected ? (
					<View className="absolute right-2 top-2 h-6 min-w-[24px] items-center justify-center rounded-full bg-white/90 px-1.5">
						<Text className="text-xs font-bold text-brand-blue">
							{quantity}
						</Text>
					</View>
				) : null}
			</View>

			<View className="mb-0.5 flex-row items-center gap-1.5">
				<Text
					className="flex-1 truncate text-[14px] font-bold tracking-tight text-slate-900"
					numberOfLines={1}
				>
					{item.name}
				</Text>
				{chilled ? (
					<View className="rounded bg-cyan-100 px-1.5 py-0.5">
						<Text className="text-[9px] font-bold text-brand-primary">
							CHILLED
						</Text>
					</View>
				) : null}
			</View>
			<Text
				className="mb-2 text-[11px] text-slate-500"
				numberOfLines={1}
			>
				{item.description?.trim() || "Tap to add to ticket"}
			</Text>

			{selected ? (
				<Pressable
					onPress={(e) => {
						e.stopPropagation?.();
						onEditDetail?.(item);
					}}
					className="mb-2 flex-row items-center gap-1 rounded-md bg-sky-50 px-2 py-1"
				>
					<Ionicons
						name={note ? "document-text" : "add-circle-outline"}
						size={12}
						color="#0284C7"
					/>
					<Text
						className="flex-1 text-[10px] font-semibold text-sky-700"
						numberOfLines={1}
					>
						{note || "Add detail"}
					</Text>
					{!!note && (
						<Ionicons name="pencil" size={10} color="#0284C7" />
					)}
				</Pressable>
			) : null}

			<View className="flex-row items-center justify-between border-t border-slate-100 pt-2">
				<Text className="text-[15px] font-extrabold text-slate-900">
					{formatRp(item.price)}
				</Text>
				{selected ? (
					<QuantityStepper
						quantity={quantity}
						onIncrease={() => onIncrease(item)}
						onDecrease={() => onDecrease(item)}
						size="sm"
					/>
				) : (
					<View className="h-7 w-7 items-center justify-center rounded-lg bg-cyan-50">
						<Ionicons name="add" size={16} color="#0284C7" />
					</View>
				)}
			</View>
		</Pressable>
	);
}
