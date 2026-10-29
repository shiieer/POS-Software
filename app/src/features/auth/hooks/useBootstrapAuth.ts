import { useCallback, useEffect, useState } from "react";
import {
	clearToken,
	getToken,
} from "@/services/storage/tokenStorage";
import { onUnauthorized } from "@/services/auth/session";
import { fetchMeApi } from "@/services/api/auth.api";

export function useBootstrapAuth() {
	const [ready, setReady] = useState(false);
	const [authenticated, setAuthenticated] = useState(false);

	const refreshAuth = useCallback(async () => {
		const token = await getToken();
		if (!token) {
			setAuthenticated(false);
			setReady(true);
			return;
		}

		try {
			await fetchMeApi();
			setAuthenticated(true);
		} catch {
			await clearToken();
			setAuthenticated(false);
		} finally {
			setReady(true);
		}
	}, []);

	useEffect(() => {
		refreshAuth();
	}, [refreshAuth]);

	useEffect(() => {
		return onUnauthorized(() => {
			setAuthenticated(false);
		});
	}, []);

	return { ready, authenticated, refreshAuth };
}
