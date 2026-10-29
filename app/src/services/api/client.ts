import { create } from "axios";
import { API_BASE_URL } from "@/constants/api";
import { clearToken, getToken } from "../storage/tokenStorage";
import { notifyUnauthorized } from "../auth/session";

export const api = create({
	baseURL: API_BASE_URL,
	timeout: 15000,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use(async (config) => {
	const token = await getToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	if (typeof FormData !== "undefined" && config.data instanceof FormData) {
		if (typeof config.headers.delete === "function") {
			config.headers.delete("Content-Type");
		} else {
			delete config.headers["Content-Type"];
		}
	}

	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const status = error.response?.status;
		const url = String(error.config?.url ?? "");
		const isLoginRequest = url.includes("/auth/login");

		if (status === 401 && !isLoginRequest) {
			await clearToken();
			notifyUnauthorized();
		}

		return Promise.reject(error);
	},
);
