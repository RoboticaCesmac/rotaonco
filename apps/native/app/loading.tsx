import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function LoadingScreen() {
	const router = useRouter();
	const { redirect, delay } = useLocalSearchParams<{ redirect?: string; delay?: string }>();

	useEffect(() => {
		const nextRoute = (() => {
			switch (redirect) {
				case "/(drawer)":
				case "/(drawer)/patient-login":
				case "/(drawer)/professional-login":
					return redirect;
				default:
					return "/(drawer)";
			}
		})();

		const parsedDelay = typeof delay === "string" ? Number(delay) : undefined;
		const ms = Number.isFinite(parsedDelay) && parsedDelay !== undefined ? parsedDelay : 1000;

		const timeout = setTimeout(() => {
			router.replace(nextRoute);
		}, ms);

		return () => clearTimeout(timeout);
	}, [redirect, delay, router]);

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<View style={styles.content}>
				<Image
					source={require("../assets/images/healthcross.png")}
					style={styles.logo}
					resizeMode="contain"
				/>
				<ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 32 }} />
				<Text style={styles.message}>Carregando...</Text>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#0E47A1",
		alignItems: "center",
		justifyContent: "center",
	},
	content: {
		alignItems: "center",
	},
	logo: {
		width: 160,
		height: 160,
	},
	message: {
		marginTop: 24,
		fontSize: 16,
		fontWeight: "600",
		color: "#FFFFFF",
	},
});
