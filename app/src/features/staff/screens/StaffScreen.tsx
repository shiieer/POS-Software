import { ActivityIndicator, Alert, FlatList, Text, View } from "react-native";
import { useStaff } from "../hooks/useStaff";
import { useState } from "react";
import { UserApi, UserRole } from "@/types/api/user";
import ScreenContainer from "@/shared/components/ScreenContainer";
import StaffHeader from "../components/StaffHeader";
import StaffOverview from "../components/StaffOverview";
import StaffCard from "../components/StaffCard";
import Toast from "@/shared/components/Toast";
import AddStaffModal from "../components/AddStaffModal";
import ResetStaffPasswordModal from "../components/ResetStaffPasswordModal";

type Props = {
	onBack: () => void;
};

export default function StaffScreen({ onBack }: Props) {
	const { staff, loading, saving, error, addStaff, toggleActive, resetPassword } = useStaff();
	const activeCount = staff.filter((user) => user.is_active).length;
	const [adding, setAdding] = useState(false);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState<UserRole>("staff");
	const [toast, setToast] = useState<string | null>(null);
	const [passwordTarget, setPasswordTarget] = useState<UserApi | null>(null);
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	function resetForm() {
		setUsername("");
		setPassword("");
		setRole("staff");
		setAdding(false);
	}

	async function submit() {
		if (username.trim().length < 3) {
			Alert.alert("Validation", "Username must be at least 3 characters");
			return;
		}
		if (password.trim().length < 6) {
			Alert.alert("Validation", "Username must be at least 6 characters");
			return;
		}

		try {
			await addStaff({
				username: username.trim(),
				password,
				role,
			});
			resetForm();
			setToast("Staff added");
		} catch (err) {
			Alert.alert(
				"Error",
				err instanceof Error ? err.message : "Failed to add staff",
			);
		}
	}

	async function handleToggleActive(userId: number, currentActive: boolean) {
		try {
			await toggleActive(userId, currentActive);
			setToast(`Staff set to ${!currentActive ? "Active" : "Inactive"}`);
		} catch (err) {
			Alert.alert(
				"Error",
				err instanceof Error ? err.message : "Failed to update staff status",
			);
		}
	}

	function closePasswordModal() {
		setPasswordTarget(null);
		setNewPassword("");
		setConfirmPassword("");
	}

	async function submitPasswordReset() {
		if (newPassword.length < 6) {
			Alert.alert("Validation", "Password must be at least 6 characters");
			return;
		}
		if (newPassword !== confirmPassword) {
			Alert.alert("Validation", "Passwords do not match");
			return;
		}
		if (!passwordTarget) return;

		try {
			await resetPassword(passwordTarget.id, newPassword);
			const username = passwordTarget.username;
			closePasswordModal();
			setToast(`Password reset for @${username}`);
		} catch (err) {
			Alert.alert(
				"Error",
				err instanceof Error ? err.message : "Failed to reset password",
			);
		}
	}

	return (
		<ScreenContainer showHeader={false}>
			<StaffHeader onBack={onBack} />
			<StaffOverview
				onAdd={() => setAdding(true)}
				total={staff.length}
				active={activeCount}
				inactive={staff.length - activeCount}
			/>

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#0284C7" />
				</View>
			) : error ? (
				<Text className="mt-10 px-6 text-center text-red-500">
					{error}
				</Text>
			) : (
				<FlatList
					className="flex-1"
					data={staff}
					keyExtractor={(item) => String(item.id)}
					contentContainerClassName="px-4 py-4 pb-10"
					ListEmptyComponent={
						<Text className="mt-10 text-center text-brand-muted">
							No staff found
						</Text>
					}
					renderItem={({ item }) => (
						<StaffCard
							user={item}
							onToggleActive={() => handleToggleActive(item.id, item.is_active)}
							onResetPassword={() => {
								setPasswordTarget(item);
								setNewPassword("");
								setConfirmPassword("");
							}}
						/>
					)}
				/>
			)}

			<Toast message={toast} type="success" />

			<AddStaffModal
				visible={adding}
				username={username}
				password={password}
				role={role}
				saving={saving}
				onChangeUsername={setUsername}
				onChangePassword={setPassword}
				onChangeRole={setRole}
				onClose={resetForm}
				onSubmit={submit}
			/>
			<ResetStaffPasswordModal
				visible={passwordTarget !== null}
				user={passwordTarget}
				password={newPassword}
				confirmPassword={confirmPassword}
				saving={saving}
				onChangePassword={setNewPassword}
				onChangeConfirmPassword={setConfirmPassword}
				onClose={closePasswordModal}
				onSubmit={submitPasswordReset}
			/>
		</ScreenContainer>
	);
}
