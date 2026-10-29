import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "@/shared/components/ScreenContainer";
import { useMerchantName } from "@/shared/hooks/useMerchantName";
import { useProfile } from "../hooks/useProfile";
import ProfileAvatarCard from "../components/ProfileAvatarCard";
import ProfileInfoRow from "../components/ProfileInfoRow";
import SectionCard from "../components/SectionCard";

type Props = {
	onBack: () => void;
};

export default function ProfileScreen({ onBack }: Props) {
	const merchantName = useMerchantName();
	const { profile, loading, error, updateUser } = useProfile();

	return (
		<ScreenContainer showHeader={false}>
			<View className="h-16 flex-row items-center justify-between border-b border-sky-100 bg-white/80 px-4">
				<Pressable
					onPress={onBack}
					className="h-10 w-10 items-center justify-center rounded-full"
					accessibilityLabel="Go back"
				>
					<Ionicons name="arrow-back" size={22} color="#334155" />
				</Pressable>

				<View className="items-center">
					<Text className="text-[10px] font-bold uppercase tracking-widest text-[#0284c7]">
						{merchantName} • POS
					</Text>
					<Text className="text-base font-bold text-slate-800">My Profile</Text>
				</View>

				<View className="h-10 w-10 items-center justify-center rounded-full">
					<Ionicons name="options-outline" size={20} color="#64748B" />
				</View>
			</View>

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#0284C7" />
				</View>
			) : error || !profile ? (
				<Text className="mt-10 px-6 text-center text-red-500">
					{error ?? "Profile not found"}
				</Text>
			) : (
				<ScrollView
					className="flex-1"
					contentContainerClassName="gap-4 px-4 py-5 pb-10"
					showsVerticalScrollIndicator={false}
				>
					<ProfileAvatarCard profile={profile} onAvatarUpdated={updateUser} />

					<SectionCard
						icon="id-card-outline"
						title="Account Information"
						badge="From account"
					>
						<View className="border-b border-slate-100">
							<ProfileInfoRow
								label="Username"
								value={`@${profile.user.username}`}
							/>
						</View>
						<View className="border-b border-slate-100">
							<ProfileInfoRow
								label="Role"
								value={profile.roleLabel}
							/>
						</View>
					</SectionCard>

					<SectionCard
						icon="storefront-outline"
						iconColor="#0284C7"
						title="Account Details"
						managed
					>
						<View className="border-b border-slate-100">
							<ProfileInfoRow
								label="Account ID"
								value={profile.user.account_code || String(profile.user.id)}
								mono
								badge={{
									label: profile.user.is_active ? "Active" : "Inactive",
									tone: profile.user.is_active ? "active" : "muted",
								}}
							/>
						</View>
						<View className="border-b border-slate-100">
							<ProfileInfoRow
								label="Joined Date"
								value={profile.joinedLabel}
								hint={profile.tenureLabel}
							/>
						</View>
					</SectionCard>
				</ScrollView>
			)}

		</ScreenContainer>
	);
}
