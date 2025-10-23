import { Container } from "@/components/container";
import { Ionicons } from "@expo/vector-icons";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function HowItWorks() {
	const audios = [
		{
			title: "ROTA✚NÇO",
			description: "Toque aqui e ouça as instruções.",
			duration: "40 min",
		},
		{
			title: "ROTA✚NÇO",
			description: "Toque aqui para ouvir a explicação.",
			duration: "20 min",
		},
	];

	return (
		<Container>
			<ScrollView
				style={styles.content}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.header}>
					<View style={styles.backButton}>
						<Ionicons name="arrow-back" size={20} color="#111827" />
					</View>
					<Text style={styles.title}>Como funciona o app</Text>
				</View>

				<Text style={styles.sectionTitle}>Explicação em áudio</Text>
				{audios.map((audio, index) => (
					<View key={`${audio.title}-${index}`} style={styles.card}>
						<View style={styles.iconWrapper}>
							<Ionicons name="volume-high" size={22} color="#FFFFFF" />
						</View>
						<View style={styles.cardContent}>
							<Text style={styles.cardTitle}>{audio.title}</Text>
							<Text style={styles.cardDescription}>{audio.description}</Text>
							<View style={styles.cardFooter}>
								<Ionicons name="time" size={14} color="#6B7280" style={{ marginRight: 6 }} />
								<Text style={styles.cardDuration}>{audio.duration}</Text>
							</View>
						</View>
						<Image
							source={require("../../../assets/images/healthcross.png")}
							style={styles.brandMark}
							resizeMode="contain"
						/>
					</View>
				))}
			</ScrollView>
		</Container>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		paddingHorizontal: 24,
	},
	scrollContent: {
		paddingVertical: 32,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingBottom: 24,
	},
	backButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: "#D1D5DB",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 16,
	},
	title: {
		fontSize: 20,
		fontWeight: "700",
		color: "#1F2933",
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1F2933",
		marginBottom: 16,
	},
	card: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#D6E0FF",
		padding: 16,
		marginBottom: 12,
		backgroundColor: "#FFFFFF",
	},
	iconWrapper: {
		width: 44,
		height: 44,
		borderRadius: 12,
		backgroundColor: "#2346C4",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 16,
	},
	cardContent: {
		flex: 1,
	},
	cardTitle: {
		fontSize: 14,
		fontWeight: "700",
		color: "#2F66F5",
		marginBottom: 4,
	},
	cardDescription: {
		fontSize: 13,
		color: "#1F2933",
		marginBottom: 8,
	},
	cardFooter: {
		flexDirection: "row",
		alignItems: "center",
	},
	cardDuration: {
		fontSize: 12,
		color: "#6B7280",
	},
	brandMark: {
		width: 36,
		height: 36,
		marginLeft: 12,
	},
});
