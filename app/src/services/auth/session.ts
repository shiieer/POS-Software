import { clearToken } from "@/services/storage/tokenStorage";

type Listener = () => void;

const listeners = new Set<Listener>();

export function onUnauthorized(listener: Listener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function notifyUnauthorized() {
	listeners.forEach((listener) => {
		try {
			listener();
		} catch {}
	});
}

export async function logoutUser() {
	try {
		await clearToken();
	} finally {
		notifyUnauthorized();
	}
}
