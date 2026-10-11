import { useEffect, useState } from "react";
import { api } from "../api/client";

export function useQrisSettings() {
	const [qrisImageUrl, setQrisImageUrl] = useState("/qris.png");
	const [merchantName, setMerchantName] = useState("POS System");

	useEffect(() => {
		let active = true;
		api.getQrisSetting().then((setting) => {
			if (!active) return;
			if (setting.qris_image_url) setQrisImageUrl(setting.qris_image_url);
			if (setting.merchant_name) setMerchantName(setting.merchant_name);
		}).catch(() => undefined);

		return () => {
			active = false;
		};
	}, []);

	return { qrisImageUrl, merchantName };
}
