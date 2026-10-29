import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MoreSnapshot } from "../types/more";
import { formatRp } from "@/utils";

type Props = {
	snapshot: MoreSnapshot;
	isAdmin?: boolean;
};

function compactRp(value: number) {
	if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1)}jt`;
	if (value >= 1_000) return `Rp${Math.round(value / 1_000)}k`;
	return formatRp(value);
}

const TILES: {
	key: keyof MoreSnapshot;
	label: string;
	icon: React.ComponentProps<typeof Ionicons>["name"];
	format: (value: number) => string;
}[] = [
	{ key: "staff", label: "Staff", icon: "people-outline", format: String },
	{ key: "tables", label: "Tables", icon: "grid-outline", format: String },
	{
		key: "openTickets",
		label: "Open",
		icon: "receipt-outline",
		format: String,
	},
	{
		key: "sales",
		label: "Sales",
		icon: "cash-outline",
		format: compactRp,
	},
];

function SnapshotTile({
	tile,
	value,
}: {
	tile: (typeof TILES)[number];
	value: number;
}) {
	return (
		<View className="flex-1 rounded-2xl border border-slate-200/80 bg-white p-3">
			<View className="mb-2 h-8 w-8 items-center justify-center rounded-xl bg-sky-50">
				<Ionicons name={tile.icon} size={16} color="#0284C7" />
			</View>
			<Text className="text-lg font-extrabold text-slate-900">
				{tile.format(value)}
			</Text>
			<Text className="text-[11px] font-semibold text-slate-500">
				{tile.label}
			</Text>
		</View>
	);
}

export default function SnapshotGrid({ snapshot, isAdmin = true }: Props) {
	return (
		<View className="mb-5">
			<Text className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
				Store Snapshot
			</Text>
			<View className="gap-2.5">
				{isAdmin ? (
					<>
						<View className="flex-row gap-2.5">
							{TILES.slice(0, 2).map((tile) => (
								<SnapshotTile
									key={tile.key}
									tile={tile}
									value={snapshot[tile.key]}
								/>
							))}
						</View>
						<View className="flex-row gap-2.5">
							{TILES.slice(2).map((tile) => (
								<SnapshotTile
									key={tile.key}
									tile={tile}
									value={snapshot[tile.key]}
								/>
							))}
						</View>
					</>
				) : (
					<View className="flex-row gap-2.5">
						<SnapshotTile tile={TILES[1]} value={snapshot.tables} />
						<SnapshotTile tile={TILES[2]} value={snapshot.openTickets} />
					</View>
				)}
			</View>
		</View>
	);
}
