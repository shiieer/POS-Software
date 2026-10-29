import "../global.css";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigation from "@/app/AppNavigation";
import { LoginScreen, useBootstrapAuth } from "@/features/auth";
import { ThemeProvider } from "@/shared/theme/ThemeProvider";
import SplashScreen from "@/shared/components/SplashScreen";

export default function App() {
	const { ready, authenticated, refreshAuth } = useBootstrapAuth();
	const [splashDone, setSplashDone] = useState(false);

	return (
		<SafeAreaProvider>
			<ThemeProvider>
				{!splashDone && (
					<SplashScreen ready={ready} onFinished={() => setSplashDone(true)} />
				)}

				{splashDone && (
					!authenticated ? (
						<LoginScreen onAuthenticated={refreshAuth} />
					) : (
						<AppNavigation />
					)
				)}
			</ThemeProvider>
		</SafeAreaProvider>
	);
}
