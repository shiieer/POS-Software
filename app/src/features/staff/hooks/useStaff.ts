import {
	createUserApi,
	fetchUsersApi,
	updateUserApi,
} from "@/services/api/user.api";
import { CreateUserPayload, UserApi } from "@/types/api/user";
import { getErrorMessage } from "@/utils";
import { useCallback, useEffect, useState } from "react";

export function useStaff() {
	const [staff, setStaff] = useState<UserApi[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await fetchUsersApi();
			setStaff(Array.isArray(data) ? data : []);
		} catch (err) {
			setError(getErrorMessage(err, "Failed to load staff"));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	async function addStaff(payload: CreateUserPayload) {
		setSaving(true);
		try {
			const created = await createUserApi(payload);
			setStaff((prev) => [...prev, created]);
			return created;
		} catch (err) {
			throw new Error(getErrorMessage(err, "Failed to add staff"));
		} finally {
			setSaving(false);
		}
	}

	async function toggleActive(userId: number, currentActive: boolean) {
		const nextActive = !currentActive;
		setStaff((prev) =>
			prev.map((u) => (u.id === userId ? { ...u, is_active: nextActive } : u)),
		);
		try {
			const updated = await updateUserApi(userId, { is_active: nextActive });
			setStaff((prev) =>
				prev.map((u) => (u.id === userId ? updated : u)),
			);
			return updated;
		} catch (err) {
			setStaff((prev) =>
				prev.map((u) => (u.id === userId ? { ...u, is_active: currentActive } : u)),
			);
			throw new Error(getErrorMessage(err, "Failed to update staff status"));
		}
	}

	async function resetPassword(userId: number, password: string) {
		setSaving(true);
		try {
			const updated = await updateUserApi(userId, { password });
			setStaff((prev) =>
				prev.map((user) => (user.id === userId ? updated : user)),
			);
			return updated;
		} catch (err) {
			throw new Error(getErrorMessage(err, "Failed to reset password"));
		} finally {
			setSaving(false);
		}
	}

	return {
		staff,
		loading,
		saving,
		error,
		addStaff,
		toggleActive,
		resetPassword,
		reload: load,
	};
}
