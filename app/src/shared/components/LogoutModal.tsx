import { useState } from "react";
import { Modal, Pressable, Text, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { logoutUser } from "@/services/auth/session";

type Props = {
	visible: boolean;
	onClose: () => void;
};

export default function LogoutModal({ visible, onClose }: Props) {
	const [loggingOut, setLoggingOut] = useState(false);

	const handleConfirm = async () => {
		try {
			setLoggingOut(true);
			await logoutUser();
			onClose();
		} finally {
			setLoggingOut(false);
		}
	};

	return (
		<Modal visible={visible} transparent animationType="fade">
			<View className="flex-1 items-center justify-center bg-[#111C2D]/50 px-5">
				<View className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
					<View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-rose-100">
						<Ionicons name="log-out-outline" size={24} color="#E11D48" />
					</View>
					<Text className="text-lg font-bold text-slate-900">Log Out</Text>
					<Text className="mt-1 text-sm font-medium text-slate-500">
						Are you sure you want to log out?
					</Text>
					<View className="mt-5 flex-row gap-3">
						<Pressable
							onPress={onClose}
							disabled={loggingOut}
							className="flex-1 items-center rounded-xl border border-slate-200 py-3"
						>
							<Text className="text-sm font-bold text-slate-600">Cancel</Text>
						</Pressable>
						<Pressable
							onPress={handleConfirm}
							disabled={loggingOut}
							className="flex-1 items-center justify-center rounded-xl bg-red-500 py-3 border border-slate-200 "
						>
							{loggingOut ? (
								<ActivityIndicator color="#FFFFFF" size="small" />
							) : (
								<Text className="text-sm font-bold text-white">Log Out</Text>
							)}
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}
