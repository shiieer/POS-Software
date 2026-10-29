import { UserRole } from "@/types/api/user";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMerchantName } from "@/shared/hooks/useMerchantName";

type Props = {
	visible: boolean;
	username: string;
	password: string;
	role: UserRole;
	saving: boolean;
	onChangeUsername: (value: string) => void;
	onChangePassword: (value: string) => void;
	onChangeRole: (value: UserRole) => void;
	onClose: () => void;
	onSubmit: () => void;
};

export default function AddStaffModal({
	visible,
	username,
	password,
	role,
	saving,
	onChangeUsername,
	onChangePassword,
	onChangeRole,
	onClose,
	onSubmit,
}: Props) {
	const merchantName = useMerchantName();
	return (
		<Modal visible={visible} transparent animationType="fade">
			<View className="flex-1 items-center justify-center bg-slate-900/40 px-4">
				<View className="w-full max-w-md overflow-hidden rounded-2xl border border-sky-100 bg-white">
					<View className="flex-row items-center justify-between border-b border-sky-100/80 bg-sky-50/50 p-5">
						<View className="flex-row items-center gap-2.5">
							<View className="h-8 w-8 items-center justify-center rounded-xl bg-sky-100">
								<Ionicons
									name="person-add-outline"
									size={18}
									color="#0284C7"
								/>
							</View>
							<View>
								<Text className="text-base font-bold text-slate-900">
									Add New Staff
								</Text>
								<Text className="text-[11px] text-slate-400">
									Invite member to {merchantName}
								</Text>
							</View>
						</View>
						<Pressable
							onPress={onClose}
							className="h-8 w-8 items-center justify-center rounded-xl"
						>
							<Ionicons name="close" size={20} color="#94A3B8" />
						</Pressable>
					</View>

					<View className="gap-4 p-5">
						<View className="gap-1.5">
							<Text className="text-xs font-semibold text-slate-700">
								Username
							</Text>
							<View className="flex-row items-center rounded-xl border border-sky-200/80 bg-[#F8FAFF] px-3.5">
								<Text className="mr-1 text-xs font-medium text-slate-400">
									@
								</Text>
								<TextInput
									value={username}
									onChangeText={onChangeUsername}
									placeholder="alex.j"
									autoCapitalize="none"
									placeholderTextColor="#94A3B8"
									className="h-[44px] flex-1 py-0 text-sm text-slate-900"
								/>
							</View>
						</View>

						<View className="gap-1.5">
							<Text className="text-xs font-semibold text-slate-700">
								Temporary Password
							</Text>
							<TextInput
								value={password}
								onChangeText={onChangePassword}
								placeholder="••••••••"
								secureTextEntry
								placeholderTextColor="#94A3B8"
								className="h-[44px] rounded-xl border border-sky-200/80 bg-[#F8FAFF] px-3.5 text-sm text-slate-900"
							/>
						</View>

						<View className="gap-1.5">
							<Text className="text-xs font-semibold text-slate-700">
								Assigned Role
							</Text>
							<View className="flex-row gap-2">
								{(["staff", "admin"] as UserRole[]).map(
									(option) => (
										<Pressable
											key={option}
											onPress={() => onChangeRole(option)}
											className={`flex-1 items-center rounded-xl py-2.5 ${
												role === option
													? "bg-[#0284C7]"
													: "border border-sky-200/80 bg-[#F8FAFF]"
											}`}
										>
											<Text
												className={`text-xs font-semibold capitalize ${
													role === option
														? "text-white"
														: "text-slate-700"
												}`}
											>
												{option === "admin"
													? "Admin"
													: "Staff"}
											</Text>
										</Pressable>
									),
								)}
							</View>
						</View>
					</View>

					<View className="flex-row justify-end gap-2.5 border-t border-sky-100 bg-slate-50/70 p-4">
						<Pressable
							onPress={onClose}
							className="rounded-xl border border-slate-200 px-4 py-2.5"
						>
							<Text className="text-xs font-semibold text-slate-600">
								Cancel
							</Text>
						</Pressable>
						<Pressable
							onPress={onSubmit}
							disabled={saving}
							className="rounded-xl bg-[#0284C7] px-4 py-2.5"
						>
							<Text className="text-xs font-semibold text-white">
								{saving ? "Saving..." : "Create Account"}
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}
