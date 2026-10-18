import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchMeApi } from "@/services/api/auth.api";
import { fetchSalesReportApi } from "@/services/api/report.api";
import { getPeriodRange } from "@/features/reports/utils/dateRange";
import { UserApi } from "@/types/api/user";
import { getErrorMessage } from "@/utils";
import { getInitials } from "../utils/profileFormat";

export type ProfileView = {
	user: UserApi;
	displayName: string;
	initials: string;
	roleLabel: string;
	joinedLabel: string;
	tenureLabel: string;
	ordersToday: number;
};

function calcTenure(from: Date, now = new Date()) {
	let months =
		(now.getFullYear() - from.getFullYear()) * 12 +
		(now.getMonth() - from.getMonth());
	if (now.getDate() < from.getDate()) months -= 1;
	months = Math.max(0, months);
	const years = Math.floor(months / 12);
	const rest = months % 12;
	if (years === 0) return `${rest} mo${rest === 1 ? "" : "s"}`;
	if (rest === 0) return `${years} yr${years === 1 ? "" : "s"}`;
	return `${years} yr${years === 1 ? "" : "s"} ${rest} mo${rest === 1 ? "" : "s"}`;
}

export function useProfile() {
	const [user, setUser] = useState<UserApi | null>(null);
	const [ordersToday, setOrdersToday] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const today = getPeriodRange("today");
			const [me, report] = await Promise.all([
				fetchMeApi(),
				fetchSalesReportApi({
					start_date: today.start_date,
					end_date: today.end_date,
				}).catch(() => null),
			]);
			setUser(me);
			setOrdersToday(report?.total_orders ?? 0);
		} catch (err) {
			setError(getErrorMessage(err, "Failed to load profile"));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const profile = useMemo<ProfileView | null>(() => {
		if (!user) return null;
		const joined = new Date(user.created_at);
		return {
			user,
			displayName: user.username,
			initials: getInitials(user.username),
			roleLabel: user.role === "admin" ? "Admin" : "Staff",
			joinedLabel: joined.toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			}),
			tenureLabel: Number.isNaN(joined.getTime()) ? "—" : calcTenure(joined),
			ordersToday,
		};
	}, [user, ordersToday]);

	return { profile, loading, error, reload: load };
}
