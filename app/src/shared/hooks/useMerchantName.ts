import { useEffect, useState } from "react";
import { fetchQrisSettingApi } from "@/services/api/settings.api";

const DEFAULT_NAME = "POS System";

let cachedName: string | null = null;
const listeners = new Set<(name: string) => void>();

function notifyAll(name: string) {
	cachedName = name;
	listeners.forEach((fn) => fn(name));
}

export function useMerchantName(): string {
	const [name, setName] = useState<string>(cachedName ?? DEFAULT_NAME);

	useEffect(() => {
		listeners.add(setName);
		if (cachedName) {
			setName(cachedName);
		} else {
			fetchQrisSettingApi()
				.then((setting) => {
					const resolved = setting.merchant_name?.trim() || DEFAULT_NAME;
					notifyAll(resolved);
				})
				.catch(() => undefined);
		}
		return () => { listeners.delete(setName); };
	}, []);

	return name;
}
