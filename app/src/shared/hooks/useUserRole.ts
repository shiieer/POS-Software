import { useEffect, useState } from "react";
import { getToken, getUserRoleFromToken } from "@/services/storage/tokenStorage";
import { fetchMeApi } from "@/services/api/auth.api";
import { onUnauthorized } from "@/services/auth/session";

export function useUserRole() {
	const [role, setRole] = useState<"admin" | "staff" | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		async function initRole() {
			const token = await getToken();
			if (!token) {
				if (isMounted) {
					setRole(null);
					setLoading(false);
				}
				return;
			}

			const parsedRole = getUserRoleFromToken(token);
			if (parsedRole && isMounted) {
				setRole(parsedRole);
				setLoading(false);
			}

			try {
				const me = await fetchMeApi();
				if (isMounted && me?.role) {
					setRole(me.role);
				}
			} catch {
				// handled by api interceptor if 401
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		}

		initRole();

		return onUnauthorized(() => {
			if (isMounted) {
				setRole(null);
			}
		});
	}, []);

	return {
		role,
		isAdmin: role === "admin",
		isStaff: role === "staff",
		loading,
	};
}
