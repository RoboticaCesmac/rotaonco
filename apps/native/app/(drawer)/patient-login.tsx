import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
	Image,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	StyleSheet,
	Platform,
	KeyboardAvoidingView,
} from "react-native";
import { useMemo, useRef, useState } from "react";

const CODE_LENGTH = 4;

export default function PatientLogin() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
	const inputRefs = useRef<Array<TextInput | null>>([]);
	const keyboardVerticalOffset = 0;

	const isCodeComplete = useMemo(
		() => code.every((digit) => digit.trim().length === 1),
		[code],
	);

	const handleDigitChange = (value: string, index: number) => {
		const sanitized = value.replace(/\D/g, "").slice(-1);
		setCode((prev) => {
			const next = [...prev];
			next[index] = sanitized;
			return next;
		});

		if (sanitized && index < CODE_LENGTH - 1) {
			setTimeout(() => inputRefs.current[index + 1]?.focus(), 10);
		}
	};

	const handleConfirm = () => {
		if (!isCodeComplete) {
			return;
		}

		router.replace("/(drawer)/(tabs)");
	};

	const handleKeyPress = (event: { nativeEvent: { key: string } }, index: number) => {
		if (event.nativeEvent.key !== "Backspace") {
			return;
		}

		const previousIndex = index > 0 ? index - 1 : 0;
		setCode((prev) => {
			const next = [...prev];
			if (next[index]) {
				next[index] = "";
			} else if (index > 0) {
				next[previousIndex] = "";
			}
			return next;
		});

		setTimeout(() => inputRefs.current[previousIndex]?.focus(), 10);
	};

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: "#0E47A1" }}
			edges={["top"]}
		>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.select({ ios: "padding", android: "height" }) ?? "height"}
				keyboardVerticalOffset={keyboardVerticalOffset}
				enabled
			>
				<View style={styles.topContainer}>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => router.back()}
					>
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
					<Text style={styles.subtitle}>Digite seu código de verificação</Text>

					<View style={styles.codeContainer}>
						{code.map((digit, index) => (
							<TextInput
								key={index}
								ref={(ref) => {
									inputRefs.current[index] = ref;
								}}
								style={styles.codeInput}
								keyboardType="number-pad"
								maxLength={1}
								value={digit}
								onChangeText={(value) => handleDigitChange(value, index)}
								onKeyPress={(event) => handleKeyPress(event, index)}
								selectionColor="#0E47A1"
								returnKeyType="done"
							/>
						))}
					</View>

					<TouchableOpacity
						style={[
							styles.primaryButton,
							isCodeComplete
								? styles.primaryButtonEnabled
								: styles.primaryButtonDisabled,
						]}
						onPress={handleConfirm}
						disabled={!isCodeComplete}
					>
						<Text style={styles.primaryButtonText}>Confirmar</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.helpWrapper}
						activeOpacity={0.7}
					>
						<Text style={styles.helpText}>Precisa de ajuda para acessar?</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.secondaryButton}>
						<Ionicons name="call" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
						<Text style={styles.secondaryButtonText}>Ligar para a clínica</Text>
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
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
		marginTop: -40,
	},
	logo: {
		width: 140,
		height: 140,
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
	codeContainer: {
		marginTop: 32,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	codeInput: {
		height: 64,
		width: 64,
		borderRadius: 16,
		backgroundColor: "#F1F5F9",
		textAlign: "center",
		fontSize: 24,
		color: "#0E47A1",
	},
	primaryButton: {
		marginTop: 32,
		height: 48,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
	},
	primaryButtonDisabled: {
		backgroundColor: "#9CA3AF",
	},
	primaryButtonEnabled: {
		backgroundColor: "#2F66F5",
	},
	primaryButtonText: {
		color: "#FFFFFF",
		fontWeight: "600",
		fontSize: 16,
	},
	helpWrapper: {
		marginTop: 24,
		alignItems: "center",
	},
	helpText: {
		color: "#3376F5",
		fontSize: 15,
		fontWeight: "500",
	},
	secondaryButton: {
		marginTop: 16,
		backgroundColor: "#1ABC4B",
		height: 48,
		borderRadius: 14,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	secondaryButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
});
