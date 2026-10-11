import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserApi } from "@/types/api/user";

type Props = {
	visible: boolean;
	user: UserApi | null;
	password: string;
	confirmPassword: string;
	saving: boolean;
	onChangePassword: (value: string) => void;
	onChangeConfirmPassword: (value: string) => void;
	onClose: () => void;
	onSubmit: () => void;
};

export default function ResetStaffPasswordModal({
	visible,
	user,
	password,
	confirmPassword,
	saving,
	onChangePassword,
	onChangeConfirmPassword,
	onClose,
	onSubmit,
}: Props) {
	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<View className="flex-1 items-center justify-center bg-slate-900/40 px-4">
				<View className="w-full max-w-md overflow-hidden rounded-2xl border border-sky-100 bg-white">
					<View className="flex-row items-center justify-between border-b border-sky-100/80 bg-sky-50/50 p-5">
						<View className="flex-row items-center gap-2.5">
							<View className="h-9 w-9 items-center justify-center rounded-xl bg-sky-100">
								<Ionicons name="key-outline" size={18} color="#0284C7" />
							</View>
							<View>
								<Text className="text-base font-bold text-slate-900">Reset password</Text>
								<Text className="text-[11px] text-slate-500">
									{user ? `Set a new password for @${user.username}` : "Set a new staff password"}
								</Text>
							</View>
						</View>
						<Pressable onPress={onClose} className="h-8 w-8 items-center justify-center rounded-xl" accessibilityLabel="Close reset password dialog">
							<Ionicons name="close" size={20} color="#94A3B8" />
						</Pressable>
					</View>

					<View className="gap-4 p-5">
						<View className="gap-1.5">
							<Text className="text-xs font-semibold text-slate-700">New password</Text>
							<TextInput
								value={password}
								onChangeText={onChangePassword}
								placeholder="At least 6 characters"
								secureTextEntry
								autoCapitalize="none"
								placeholderTextColor="#94A3B8"
								className="h-[44px] rounded-xl border border-sky-200/80 bg-[#F8FAFF] px-3.5 text-sm text-slate-900"
							/>
						</View>
						<View className="gap-1.5">
							<Text className="text-xs font-semibold text-slate-700">Confirm new password</Text>
							<TextInput
								value={confirmPassword}
								onChangeText={onChangeConfirmPassword}
								placeholder="Enter the password again"
								secureTextEntry
								autoCapitalize="none"
								placeholderTextColor="#94A3B8"
								className="h-[44px] rounded-xl border border-sky-200/80 bg-[#F8FAFF] px-3.5 text-sm text-slate-900"
							/>
						</View>
						<Text className="text-[11px] leading-4 text-slate-500">
							The new password takes effect immediately. Share it securely with the staff member.
						</Text>
					</View>

					<View className="flex-row justify-end gap-2.5 border-t border-sky-100 bg-slate-50/70 p-4">
						<Pressable onPress={onClose} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2.5">
							<Text className="text-xs font-semibold text-slate-600">Cancel</Text>
						</Pressable>
						<Pressable onPress={onSubmit} disabled={saving || !user} className="rounded-xl bg-[#0284C7] px-4 py-2.5">
							<Text className="text-xs font-semibold text-white">
								{saving ? "Resetting…" : "Reset password"}
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}
