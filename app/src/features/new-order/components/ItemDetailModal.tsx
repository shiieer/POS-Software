import { useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
	visible: boolean;
	item: { menuItemId: number; name: string; note?: string } | null;
	onClose: () => void;
	onSave: (menuItemId: number, note: string) => void;
};

const SUGGESTIONS = [
	"Less Ice",
	"No Ice",
	"Less Sugar",
	"No Sugar",
	"Extra Hot",
	"Takeaway",
	"Extra Shot",
];

export default function ItemDetailModal({
	visible,
	item,
	onClose,
	onSave,
}: Props) {
	const [noteText, setNoteText] = useState("");

	useEffect(() => {
		if (item) {
			setNoteText(item.note || "");
		}
	}, [item]);

	if (!item) return null;

	const handleToggleTag = (tag: string) => {
		const current = noteText.trim();
		if (!current) {
			setNoteText(tag);
			return;
		}

		const parts = current.split(",").map((p) => p.trim());
		if (parts.includes(tag)) {
			const filtered = parts.filter((p) => p !== tag);
			setNoteText(filtered.join(", "));
		} else {
			setNoteText([...parts, tag].join(", "));
		}
	};

	const handleSave = () => {
		onSave(item.menuItemId, noteText.trim());
		onClose();
	};

	const handleClear = () => {
		setNoteText("");
	};

	return (
		<Modal visible={visible} transparent animationType="fade">
			<View className="flex-1 items-center justify-center bg-[#111C2D]/50 px-5">
				<View className="w-full max-w-md rounded-3xl border border-sky-100 bg-white p-5 shadow-2xl">
					<View className="mb-4 flex-row items-center justify-between border-b border-slate-100 pb-3">
						<View className="min-w-0 flex-1 pr-3">
							<Text className="text-base font-bold text-slate-900">
								Item Detail & Notes
							</Text>
							<Text
								className="mt-0.5 text-xs font-semibold text-sky-600"
								numberOfLines={1}
							>
								{item.name}
							</Text>
						</View>
						<Pressable
							onPress={onClose}
							className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"
						>
							<Ionicons name="close" size={18} color="#64748B" />
						</Pressable>
					</View>

					<Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
						Quick Options
					</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						className="mb-4 flex-row"
						contentContainerStyle={{ gap: 6 }}
					>
						{SUGGESTIONS.map((tag) => {
							const isSelected = noteText
								.split(",")
								.map((p) => p.trim())
								.includes(tag);
							return (
								<Pressable
									key={tag}
									onPress={() => handleToggleTag(tag)}
									className={`rounded-full border px-3 py-1.5 ${
										isSelected
											? "border-sky-500 bg-sky-50"
											: "border-slate-200 bg-white"
									}`}
								>
									<Text
										className={`text-xs font-semibold ${
											isSelected ? "text-sky-700" : "text-slate-600"
										}`}
									>
										{tag}
									</Text>
								</Pressable>
							);
						})}
					</ScrollView>

					<Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
						Custom Instruction
					</Text>
					<TextInput
						value={noteText}
						onChangeText={setNoteText}
						placeholder="e.g. Less ice, normal sweet, separate sauce..."
						placeholderTextColor="#94A3B8"
						multiline
						numberOfLines={3}
						textAlignVertical="top"
						className="min-h-[88px] rounded-2xl border border-sky-100 bg-sky-50/40 p-3.5 text-sm font-medium text-slate-800"
					/>

					<View className="mt-5 flex-row items-center justify-between gap-3">
						{noteText.length > 0 ? (
							<Pressable
								onPress={handleClear}
								className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3"
							>
								<Text className="text-xs font-bold text-rose-600">
									Clear
								</Text>
							</Pressable>
						) : null}

						<Pressable
							onPress={onClose}
							className="flex-1 items-center rounded-xl border border-slate-200 py-3"
						>
							<Text className="text-sm font-bold text-slate-600">
								Cancel
							</Text>
						</Pressable>

						<Pressable
							onPress={handleSave}
							className="flex-1 items-center rounded-xl bg-[#0284c7] py-3 shadow-md shadow-sky-200"
						>
							<Text className="text-sm font-bold text-white">
								Save Detail
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}
