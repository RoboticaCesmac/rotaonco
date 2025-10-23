import { Container } from "@/components/container";
import { Ionicons } from "@expo/vector-icons";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter, type Href } from "expo-router";

export default function PatientHome() {
	console.log("PatientHome render");
	const router = useRouter();
	type Shortcut = {
		icon: string;
		title: string;
		description: string;
		background: string;
		color: string;
		route?: Href;
	};

	const shortcuts: Shortcut[] = [
		{
			icon: "calendar",
			title: "Suas consultas",
			description: "Acompanhe seus agendamentos e veja o que vem por aí.",
			background: "#EEF2FF",
			color: "#2F66F5",
			route: "/(drawer)/(tabs)/appointments",
		},
		{
			icon: "chatbubbles",
			title: "Relatar sintoma",
			description: "Comunique seus sintomas de forma rápida e prática.",
			background: "#F4F3FF",
			color: "#6B4BFF",
			route: "/(drawer)/report-symptom",
		},
		{
			icon: "book",
			title: "Como funciona o app",
			description: "Aprenda a usar o app com uma explicação rápida e fácil.",
			background: "#E8FAF1",
			color: "#1ABC4B",
			route: "/(drawer)/(tabs)/profile",
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
					<Text style={styles.greeting}>Olá, Silvio 👋</Text>
					<Text style={styles.greetingSubtitle}>Como você está hoje?</Text>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Sua próxima consulta</Text>
					<View style={styles.appointmentCard}>
						<View style={styles.appointmentInfo}>
							<Text style={styles.doctorName}>Dr. Alan Smith</Text>
							<Text style={styles.doctorSpecialty}>Cardiologista</Text>
							<View style={styles.appointmentDetailRow}>
								<Ionicons name="calendar" size={16} color="#FFFFFF" style={styles.appointmentDetailIcon} />
								<Text style={styles.appointmentDetailText}>12 Nov, 2025 às 14:30</Text>
							</View>
							<View style={styles.appointmentDetailRow}>
								<Ionicons name="business" size={16} color="#FFFFFF" style={styles.appointmentDetailIcon} />
								<Text style={styles.appointmentDetailText}>Clínica Vida Saudável</Text>
							</View>
						</View>
						<Image
							source={{
								uri: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=240&q=80",
							}}
							style={styles.doctorImage}
							resizeMode="cover"
						/>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Seus atalhos</Text>
					{shortcuts.map((item, index) => (
						<TouchableOpacity
							key={item.title}
							style={[styles.shortcutCard, index === shortcuts.length - 1 ? { marginBottom: 0 } : null]}
							activeOpacity={item.route ? 0.85 : 1}
							onPress={() => {
								if (item.route) {
									router.push(item.route);
								}
							}}
						>
							<View style={[styles.shortcutIcon, { backgroundColor: item.background }]}>
								<Ionicons name={item.icon as any} size={20} color={item.color} />
							</View>
							<View style={{ flex: 1 }}>
								<Text style={styles.shortcutTitle}>{item.title}</Text>
								<Text style={styles.shortcutDescription}>{item.description}</Text>
							</View>
						</TouchableOpacity>
					))}
				</View>
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
		paddingBottom: 32,
	},
	header: {
		paddingTop: 16,
		paddingBottom: 24,
	},
	greeting: {
		fontSize: 26,
		fontWeight: "700",
		color: "#1F2933",
	},
	greetingSubtitle: {
		marginTop: 6,
		fontSize: 16,
		color: "#6B7280",
	},
	section: {
		marginBottom: 28,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1F2933",
		marginBottom: 16,
	},
	appointmentCard: {
		backgroundColor: "#2F66F5",
		borderRadius: 24,
		padding: 20,
		flexDirection: "row",
		alignItems: "center",
	},
	appointmentInfo: {
		flex: 1,
		marginRight: 20,
	},
	doctorName: {
		fontSize: 20,
		fontWeight: "700",
		color: "#FFFFFF",
	},
	doctorSpecialty: {
		marginTop: 4,
		fontSize: 14,
		color: "#E0EAFF",
	},
	appointmentDetailRow: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 12,
	},
	appointmentDetailIcon: {
		marginRight: 8,
	},
	appointmentDetailText: {
		fontSize: 13,
		color: "#FFFFFF",
	},
	doctorImage: {
		width: 96,
		height: 96,
		borderRadius: 20,
	},
	shortcutCard: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 18,
		borderWidth: 1,
		borderColor: "#D6E0FF",
		padding: 18,
		marginBottom: 14,
		backgroundColor: "#FFFFFF",
	},
	shortcutIcon: {
		width: 44,
		height: 44,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 16,
	},
	shortcutTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1F2933",
		marginBottom: 4,
	},
	shortcutDescription: {
		fontSize: 13,
		color: "#6B7280",
	},
});
