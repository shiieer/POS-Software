import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
	title: string;
	onClose: () => void;
	onDelete?: () => void;
};

export default function AddItemHeader({ title, onClose, onDelete }: Props) {
	return (
		<View className="h-16 flex-row items-center justify-between border-b border-sky-100 bg-white/90 px-4">
			<Pressable
				onPress={onClose}
				className="h-10 w-10 items-center justify-center rounded-full"
			>
				<Ionicons name="arrow-back" size={22} color="#475569" />
			</Pressable>
			<View className="items-center">
				<Text className="text-lg font-bold tracking-tight text-slate-800">
					{title}
				</Text>
				<Text className="text-[11px] font-semibold uppercase tracking-wider text-sky-600">
					Menu Catalog
				</Text>
			</View>
			<View className="flex-row items-center">
				{onDelete ? (
					<Pressable
						onPress={onDelete}
						className="h-10 w-10 items-center justify-center rounded-full"
						accessibilityLabel="Delete item"
					>
						<Ionicons name="trash-outline" size={21} color="#E11D48" />
					</Pressable>
				) : null}
				<Pressable
					onPress={onClose}
					className="h-10 w-10 items-center justify-center rounded-full"
				>
					<Ionicons name="close" size={22} color="#64748B" />
				</Pressable>
			</View>
		</View>
	);
}
