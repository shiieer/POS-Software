import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { StoredStaff } from "@/services/storage/staffStorage";
import { UserApi } from "@/types/api/user";
import { getDisplayName, getInitials } from "@/features/profile/utils/profileFormat";

type CrewMember = UserApi | StoredStaff;

type Props = {
	staff: CrewMember[];
	loading: boolean;
	selectedUsername: string;
	onSelect: (user: CrewMember) => void;
};

const PALETTES = [
	{ bg: "#0284c7", text: "#ffffff" },
	{ bg: "#fce7f3", text: "#be185d" },
	{ bg: "#fef3c7", text: "#b45309" },
	{ bg: "#dcfce7", text: "#16a34a" },
	{ bg: "#ede9fe", text: "#7c3aed" },
	{ bg: "#fee2e2", text: "#b91c1c" },
	{ bg: "#e0f2fe", text: "#0369a1" },
	{ bg: "#f0fdf4", text: "#15803d" },
];

function paletteFor(index: number, role: string) {
	if (role === "admin") return PALETTES[0];
	return PALETTES[(index % (PALETTES.length - 1)) + 1];
}

export default function QuickSwitchCrew({ staff, loading, selectedUsername, onSelect }: Props) {
	const visibleCrew = staff.slice(0, 4);

	return (
		<View style={{ marginBottom: 20 }}>
			<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
				<Text style={{ fontSize: 10, fontWeight: "700", letterSpacing: 1.2, color: "#94a3b8", textTransform: "uppercase" }}>
					Quick Switch Crew
				</Text>
				{staff.length > 4 ? <Text style={{ fontSize: 11, fontWeight: "600", color: "#0284c7" }}>+{staff.length - 4} more</Text> : null}
			</View>

			{loading ? (
				<View style={{ height: 72, alignItems: "center", justifyContent: "center" }}>
					<ActivityIndicator size="small" color="#0284c7" />
				</View>
			) : visibleCrew.length === 0 ? (
				<View style={{ height: 72, alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", borderStyle: "dashed" }}>
					<Text style={{ fontSize: 12, color: "#94a3b8", fontWeight: "500" }}>No active staff found</Text>
				</View>
			) : (
				<View style={{ flexDirection: "row", gap: 8 }}>
					{visibleCrew.map((user, index) => {
						const selected = selectedUsername === user.username;
						const palette = paletteFor(index, user.role);
						return (
							<Pressable
								key={user.username}
								onPress={() => onSelect(user)}
								style={{ flex: 1, alignItems: "center", paddingVertical: 10, paddingHorizontal: 4, borderRadius: 18, borderWidth: selected ? 2 : 1, borderColor: selected ? "#0284c7" : "#e2e8f0", backgroundColor: selected ? "#f0f9ff" : "#f8fafc" }}
							>
								<View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: palette.bg, alignItems: "center", justifyContent: "center", shadowColor: "#0f172a", shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
									<Text style={{ fontSize: 11, fontWeight: "700", color: palette.text }}>{getInitials(user.username)}</Text>
								</View>
								<Text numberOfLines={1} style={{ marginTop: 5, fontSize: 11, fontWeight: selected ? "700" : "500", color: selected ? "#0f172a" : "#64748b", textAlign: "center", width: "100%" }}>
									{getDisplayName(user.username)}
								</Text>
							</Pressable>
						);
					})}
				</View>
			)}
		</View>
	);
}
