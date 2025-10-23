import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
	Image,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useMemo, useState } from "react";

export default function ProfessionalLogin() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const isFormValid = useMemo(() => {
		return email.trim().length > 0 && password.trim().length > 0;
	}, [email, password]);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#0E47A1" }} edges={["top"]}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.select({ ios: "padding", android: "height" }) ?? "height"}
				enabled
			>
				<View style={styles.topContainer}>
					<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
						<Ionicons name="arrow-back" size={26} color="#FFFFFF" />
					</TouchableOpacity>
					<View style={styles.logoWrapper}>
						<Image
							source={require("../../assets/images/healthcross.png")}
							style={styles.logo}
							resizeMode="contain"
						/>
					</View>
				</View>

				<View style={styles.card}>
					<Text style={styles.title}>Vamos começar!</Text>
					<Text style={styles.subtitle}>Digite seu e-mail e senha</Text>

					<View style={styles.inputGroup}>
						<View style={styles.inputField}>
							<Ionicons name="mail-outline" size={18} color="#6B7280" style={{ marginRight: 12 }} />
							<TextInput
								style={styles.input}
								placeholder="E-mail"
								placeholderTextColor="#9CA3AF"
								autoCapitalize="none"
								keyboardType="email-address"
								value={email}
								onChangeText={setEmail}
							/>
						</View>

						<View style={styles.inputField}>
							<Ionicons name="lock-closed-outline" size={18} color="#6B7280" style={{ marginRight: 12 }} />
							<TextInput
								style={styles.input}
								placeholder="Senha de acesso"
								placeholderTextColor="#9CA3AF"
								secureTextEntry
								value={password}
								onChangeText={setPassword}
							/>
						</View>
					</View>

					<TouchableOpacity style={styles.forgotWrapper} activeOpacity={0.7}>
						<Text style={styles.forgotPassword}>Esqueceu sua senha?</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.primaryButton, isFormValid ? styles.primaryButtonEnabled : styles.primaryButtonDisabled]}
						activeOpacity={0.9}
						disabled={!isFormValid}
					>
						<Text style={styles.primaryButtonText}>Acessar</Text>
					</TouchableOpacity>

					<Text style={styles.separator}>Ou</Text>

					<TouchableOpacity
						style={styles.secondaryButton}
						activeOpacity={0.8}
						onPress={() => router.push("/(drawer)/patient-login")}
					>
						<Text style={styles.secondaryButtonText}>Usar PIN de 6 dígitos</Text>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>

			<View style={{ height: insets.bottom, backgroundColor: "#FFFFFF" }} />
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	topContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingTop: 24,
		paddingHorizontal: 24,
	},
	backButton: {
		position: "absolute",
		top: 32,
		left: 24,
		padding: 4,
	},
	logoWrapper: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		marginTop: -40,
	},
	logo: {
		width: 120,
		height: 120,
	},
	card: {
		backgroundColor: "#FFFFFF",
		borderTopLeftRadius: 36,
		borderTopRightRadius: 36,
		paddingHorizontal: 28,
		paddingVertical: 40,
	},
	title: {
		textAlign: "center",
		fontSize: 20,
		fontWeight: "700",
		color: "#1F2933",
	},
	subtitle: {
		marginTop: 12,
		textAlign: "center",
		fontSize: 14,
		color: "#6B7280",
	},
	inputGroup: {
		marginTop: 32,
	},
	inputField: {
		marginBottom: 16,
		height: 52,
		borderRadius: 14,
		backgroundColor: "#F8FAFC",
		borderWidth: 1,
		borderColor: "#E2E8F0",
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
	},
	input: {
		flex: 1,
		fontSize: 15,
		color: "#111827",
	},
	forgotPassword: {
		textAlign: "right",
		color: "#3376F5",
		fontSize: 14,
		fontWeight: "500",
	},
	forgotWrapper: {
		marginTop: 16,
		alignSelf: "flex-end",
		width: "100%",
	},
	primaryButton: {
		marginTop: 28,
		height: 48,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#2F66F5",
	},
	primaryButtonDisabled: {
		opacity: 0.6,
	},
	primaryButtonEnabled: {
		opacity: 1,
	},
	primaryButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
	separator: {
		marginTop: 24,
		textAlign: "center",
		fontSize: 15,
		color: "#6B7280",
	},
	secondaryButton: {
		marginTop: 16,
		height: 48,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "#2F66F5",
	},
	secondaryButtonText: {
		color: "#2F66F5",
		fontSize: 15,
		fontWeight: "600",
	},
});
