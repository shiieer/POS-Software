import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatRp } from "@/utils";
import { CartItem } from "../types/cart";
import QuantityStepper from "./QuantityStepper";

type Props = {
	item: CartItem;
	onIncrease: (menuItemId: number) => void;
	onDecrease: (menuItemId: number) => void;
	onEditDetail?: (item: CartItem) => void;
};

export default function CartItemRow({
	item,
	onIncrease,
	onDecrease,
	onEditDetail,
}: Props) {
	const subtotal = item.price * item.quantity;

	return (
		<View className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
			<View className="flex-row items-center justify-between">
				<View className="min-w-0 flex-1 flex-row items-center gap-2.5">
					<View className="h-8 w-8 items-center justify-center rounded-lg bg-cyan-50">
						<Ionicons name="cafe-outline" size={17} color="#0284C7" />
					</View>
					<View className="min-w-0 flex-1">
						<Text
							className="truncate text-[13px] font-bold text-slate-800"
							numberOfLines={1}
						>
							{item.name}
						</Text>
						<Text className="text-[11px] text-slate-500">
							{formatRp(item.price)}
						</Text>
					</View>
				</View>

				<View className="flex-row items-center gap-2">
					<QuantityStepper
						quantity={item.quantity}
						onIncrease={() => onIncrease(item.menuItemId)}
						onDecrease={() => onDecrease(item.menuItemId)}
						size="sm"
					/>
					<Text className="w-16 text-right text-[12px] font-bold text-slate-900">
						{formatRp(subtotal)}
					</Text>
				</View>
			</View>

			<View className="mt-2 border-t border-slate-200/60 pt-1.5">
				{item.note ? (
					<Pressable
						onPress={() => onEditDetail?.(item)}
						className="flex-row items-center gap-1.5 rounded-lg bg-sky-50 px-2 py-1"
					>
						<Ionicons name="document-text-outline" size={12} color="#0284C7" />
						<Text
							className="flex-1 text-[11px] font-medium text-sky-800"
							numberOfLines={1}
						>
							{item.note}
						</Text>
						<Ionicons name="pencil-outline" size={12} color="#0284C7" />
					</Pressable>
				) : (
					<Pressable
						onPress={() => onEditDetail?.(item)}
						className="flex-row items-center gap-1 py-0.5"
					>
						<Ionicons name="add-circle-outline" size={13} color="#0284C7" />
						<Text className="text-[11px] font-medium text-sky-700">
							Add detail / note
						</Text>
					</Pressable>
				)}
			</View>
		</View>
	);
}
