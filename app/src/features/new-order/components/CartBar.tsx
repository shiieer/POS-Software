import { useState } from "react";
import {
	View,
	Text,
	Pressable,
	ActivityIndicator,
	ScrollView,
	TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatRp } from "@/utils";
import { CartItem } from "../types/cart";
import QuantityStepper from "./QuantityStepper";

type Props = {
	itemCount: number;
	total: number;
	submitting: boolean;
	items: CartItem[];
	onSubmit: () => void;
	onIncrease: (menuItemId: number) => void;
	onDecrease: (menuItemId: number) => void;
	onUpdateNote: (menuItemId: number, note: string) => void;
	onEditDetail?: (item: CartItem) => void;
	onClear: () => void;
	paymentMethod: "cash" | "qris";
	isPaid: boolean;
	onPaymentMethodChange: (method: "cash" | "qris") => void;
	onIsPaidChange: (paid: boolean) => void;
};

export default function CartBar({
	itemCount,
	total,
	submitting,
	items,
	onSubmit,
	onIncrease,
	onDecrease,
	onUpdateNote,
	onEditDetail,
	onClear,
	paymentMethod,
	isPaid,
	onPaymentMethodChange,
	onIsPaidChange,
}: Props) {
	const [expanded, setExpanded] = useState(false);
	const [focusedNote, setFocusedNote] = useState<number | null>(null);

	if (itemCount <= 0) return null;

	return (
		<View className="px-4 pb-3 pt-1">
			{expanded && (
				<View
					className="mb-2 overflow-hidden rounded-2xl border border-sky-100 bg-white"
					style={{
						shadowColor: "#0284C7",
						shadowOpacity: 0.08,
						shadowRadius: 16,
						shadowOffset: { width: 0, height: -4 },
						elevation: 4,
					}}
				>
					<View className="flex-row items-center justify-between border-b border-sky-100 bg-sky-50/80 px-4 py-3">
						<View className="flex-row items-center gap-2">
							<Ionicons name="receipt-outline" size={17} color="#0284C7" />
							<Text className="text-[12px] font-bold uppercase tracking-wider text-slate-700">
								Order Details
							</Text>
							<View className="rounded-full bg-sky-100 px-2 py-0.5">
								<Text className="text-[10px] font-bold text-sky-700">
									{itemCount} item{itemCount !== 1 ? "s" : ""}
								</Text>
							</View>
						</View>
						<Pressable
							onPress={onClear}
							disabled={submitting}
							className="flex-row items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1"
						>
							<Ionicons name="trash-outline" size={13} color="#E11D48" />
							<Text className="text-[11px] font-semibold text-rose-600">
								Clear All
							</Text>
						</Pressable>
					</View>

					<ScrollView
						style={{ maxHeight: 300 }}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
						contentContainerStyle={{ padding: 12 }}
					>
						<View style={{ gap: 10 }}>
							{items.map((item) => {
								const subtotal = item.price * item.quantity;
								const isNoteFocused = focusedNote === item.menuItemId;

								return (
									<View
										key={item.menuItemId}
										className="overflow-hidden rounded-xl border border-sky-100 bg-sky-50/60"
									>
										<View className="flex-row items-center justify-between px-3 pt-2.5 pb-2">
											<View className="min-w-0 flex-1 flex-row items-center gap-2.5">
												<View className="h-8 w-8 items-center justify-center rounded-lg bg-sky-100">
													<Ionicons
														name="cafe-outline"
														size={16}
														color="#0284C7"
													/>
												</View>
												<View className="min-w-0 flex-1">
													<Text
														className="text-[13px] font-bold text-slate-800"
														numberOfLines={1}
													>
														{item.name}
													</Text>
													<Text className="text-[11px] text-slate-400">
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
												<Text className="w-16 text-right text-[12px] font-bold text-slate-800">
													{formatRp(subtotal)}
												</Text>
											</View>
										</View>

										<View
											className="mx-3 mb-2.5 flex-row items-center gap-1.5 overflow-hidden rounded-lg border border-sky-100 bg-white px-2.5 py-1.5"
											style={
												isNoteFocused ? { borderColor: "#0284C7" } : undefined
											}
										>
											<Ionicons
												name="pencil-outline"
												size={12}
												color={isNoteFocused ? "#0284C7" : "#94A3B8"}
											/>
											<TextInput
												value={item.note ?? ""}
												onChangeText={(text) =>
													onUpdateNote(item.menuItemId, text)
												}
												onFocus={() => setFocusedNote(item.menuItemId)}
												onBlur={() => setFocusedNote(null)}
												placeholder="Add note (e.g. less sugar, no ice...)"
												placeholderTextColor="#CBD5E1"
												className="flex-1 text-[12px] text-slate-700"
												style={{ paddingVertical: 0 }}
												returnKeyType="done"
											/>
											{!!item.note && (
												<Pressable
													onPress={() => onUpdateNote(item.menuItemId, "")}
												>
													<Ionicons
														name="close-circle"
														size={14}
														color="#CBD5E1"
													/>
												</Pressable>
											)}
											{onEditDetail ? (
												<Pressable
													onPress={() => onEditDetail(item)}
													className="rounded bg-sky-50 px-1.5 py-0.5"
												>
													<Text className="text-[10px] font-bold text-sky-700">
														Presets
													</Text>
												</Pressable>
											) : null}
										</View>
									</View>
								);
							})}
						</View>
					</ScrollView>

					<View className="flex-row items-center justify-between border-t border-sky-100 px-4 py-3">
						<Text className="text-[12px] font-semibold text-slate-500">
							Subtotal
						</Text>
						<Text className="text-[14px] font-extrabold text-slate-800">
							{formatRp(total)}
						</Text>
					</View>

					{/* Payment options */}
					<View className="border-t border-sky-100 px-4 pb-3 pt-2">
						<Text className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
							Payment
						</Text>
						{/* Method */}
						<View className="mb-2 flex-row gap-2">
							{(["cash", "qris"] as const).map((method) => (
								<Pressable
									key={method}
									onPress={() => onPaymentMethodChange(method)}
									className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border py-2 ${
										paymentMethod === method
											? "border-sky-400 bg-sky-50"
											: "border-slate-200 bg-white"
									}`}
								>
									<Ionicons
										name={method === "cash" ? "cash-outline" : "qr-code-outline"}
										size={14}
										color={paymentMethod === method ? "#0284C7" : "#94A3B8"}
									/>
									<Text className={`text-xs font-bold ${paymentMethod === method ? "text-sky-700" : "text-slate-400"}`}>
										{method === "cash" ? "Cash" : "QRIS"}
									</Text>
								</Pressable>
							))}
						</View>
						{/* Paid now toggle */}
						<Pressable
							onPress={() => onIsPaidChange(!isPaid)}
							className={`flex-row items-center justify-between rounded-xl border px-3 py-2.5 ${
								isPaid ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
							}`}
						>
							<View className="flex-row items-center gap-2">
								<Ionicons
									name={isPaid ? "checkmark-circle" : "ellipse-outline"}
									size={16}
									color={isPaid ? "#10B981" : "#94A3B8"}
								/>
								<Text className={`text-xs font-bold ${isPaid ? "text-emerald-700" : "text-slate-400"}`}>
									{isPaid ? "Paid now" : "Pay later"}
								</Text>
							</View>
							<Text className="text-[10px] text-slate-400">
								{isPaid ? "Mark as settled" : "Collect payment later"}
							</Text>
						</Pressable>
					</View>
				</View>
			)}

			<Pressable
				onPress={() => setExpanded((v) => !v)}
				className="flex-row items-center justify-between rounded-2xl border border-sky-200 bg-white px-4 py-3"
				style={{
					shadowColor: "#0284C7",
					shadowOpacity: 0.12,
					shadowRadius: 16,
					shadowOffset: { width: 0, height: 4 },
					elevation: 5,
				}}
			>
				<View className="flex-row items-center gap-3">
					<View className="h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
						<Text className="text-sm font-bold text-sky-700">{itemCount}</Text>
					</View>
					<View>
						<Text className="text-[11px] font-semibold uppercase tracking-wider text-sky-500">
							Subtotal
						</Text>
						<Text className="text-[17px] font-extrabold leading-tight text-slate-800">
							{formatRp(total)}
						</Text>
					</View>
				</View>

				<View className="flex-row items-center gap-2">
					<Ionicons
						name={expanded ? "chevron-down" : "chevron-up"}
						size={18}
						color="#94A3B8"
					/>
					<Pressable
						onPress={(e) => {
							e.stopPropagation?.();
							onSubmit();
						}}
						disabled={submitting}
						className="flex-row items-center gap-1.5 rounded-xl bg-[#0284c7] px-4 py-2.5"
					>
						{submitting ? (
							<ActivityIndicator color="#FFFFFF" size="small" />
						) : (
							<>
								<Text className="text-xs font-extrabold text-white">
									Create
								</Text>
							</>
						)}
					</Pressable>
				</View>
			</Pressable>
		</View>
	);
}
