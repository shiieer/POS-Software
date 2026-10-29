import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSplashAnimation } from "@/shared/hooks/useSplashAnimation";
import { useMerchantName } from "@/shared/hooks/useMerchantName";

type Props = {
	ready: boolean;
	onFinished: () => void;
};

export default function SplashScreen({ ready, onFinished }: Props) {
	const merchantName = useMerchantName();
	const { iconStyle, textStyle, tagStyle, containerStyle } = useSplashAnimation({
		ready,
		onFinished,
	});

	return (
		<Animated.View style={[StyleSheet.absoluteFill, styles.container, containerStyle]}>
			<View style={styles.glow} />

			<Animated.View style={[styles.iconWrap, iconStyle]}>
				<View style={styles.iconBg}>
					<MaterialCommunityIcons name="coffee" size={48} color="#FFFFFF" />
				</View>
			</Animated.View>

			<Animated.Text style={[styles.brand, textStyle]}>
				{merchantName}
			</Animated.Text>

			<Animated.Text style={[styles.tag, tagStyle]}>
				Point of Sale System
			</Animated.Text>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#F0F5FA",
		zIndex: 99,
	},
	glow: {
		position: "absolute",
		width: 280,
		height: 280,
		borderRadius: 140,
		backgroundColor: "#0284C7",
		opacity: 0.07,
	},
	iconWrap: {
		marginBottom: 24,
	},
	iconBg: {
		width: 96,
		height: 96,
		borderRadius: 28,
		backgroundColor: "#0284C7",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#0284C7",
		shadowOpacity: 0.35,
		shadowRadius: 20,
		shadowOffset: { width: 0, height: 8 },
		elevation: 12,
	},
	brand: {
		fontSize: 28,
		fontWeight: "800",
		color: "#111C2D",
		letterSpacing: -0.5,
		marginBottom: 6,
	},
	tag: {
		fontSize: 13,
		fontWeight: "600",
		color: "#0284C7",
		letterSpacing: 2,
		textTransform: "uppercase",
	},
});
