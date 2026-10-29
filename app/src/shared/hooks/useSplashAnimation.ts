import { useEffect } from "react";
import {
	useSharedValue,
	withDelay,
	withTiming,
	withSpring,
	runOnJS,
	Easing,
} from "react-native-reanimated";

type Options = {
	onFinished: () => void;
	ready: boolean;
};

const SPRING_CONFIG = { damping: 14, stiffness: 120, mass: 0.8 };

export function useSplashAnimation({ ready, onFinished }: Options) {
	const iconScale = useSharedValue(0.4);
	const iconOpacity = useSharedValue(0);

	const textOpacity = useSharedValue(0);
	const textTranslateY = useSharedValue(12);

	const tagOpacity = useSharedValue(0);

	const containerOpacity = useSharedValue(1);

	useEffect(() => {
		iconScale.value = withSpring(1, SPRING_CONFIG);
		iconOpacity.value = withTiming(1, { duration: 350 });

		textOpacity.value = withDelay(280, withTiming(1, { duration: 380 }));
		textTranslateY.value = withDelay(280, withTiming(0, { duration: 380, easing: Easing.out(Easing.quad) }));

		tagOpacity.value = withDelay(520, withTiming(1, { duration: 340 }));
	}, []);

	useEffect(() => {
		if (!ready) return;

		containerOpacity.value = withDelay(
			380,
			withTiming(0, { duration: 340, easing: Easing.in(Easing.quad) }, (finished) => {
				if (finished) runOnJS(onFinished)();
			}),
		);
	}, [ready]);

	return {
		iconStyle: {
			opacity: iconOpacity,
			transform: [{ scale: iconScale }],
		},
		textStyle: {
			opacity: textOpacity,
			transform: [{ translateY: textTranslateY }],
		},
		tagStyle: {
			opacity: tagOpacity,
		},
		containerStyle: {
			opacity: containerOpacity,
		},
	};
}
