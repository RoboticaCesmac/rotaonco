import { useState } from "react";
import { Container } from "@/components/container";
import { Ionicons } from "@expo/vector-icons";
import {
	Image,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useRouter } from "expo-router";

const APPOINTMENTS = [
	{
		id: "1",
		doctor: "Dr. Alan Smith",
		specialty: "Cardiologista",
		date: "12 Nov, 2025 às 14:30",
		photo:
			"https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=160&q=80",
	},
	{
		id: "2",
		doctor: "Dr. Cristen Remarries",
		specialty: "Cardiologista",
		date: "12 Nov, 2025 às 14:30",
		photo:
			"https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=160&q=80",
	},
	{
		id: "3",
		doctor: "Dr. Darlene Robertson",
		specialty: "Cardiologista",
		date: "12 Nov, 2025 às 14:30",
		photo:
			"https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=160&q=80",
	},
	{
		id: "4",
		doctor: "Dr. Brooklyn Simmons",
		specialty: "Cardiologista",
		date: "12 Nov, 2025 às 14:30",
		photo:
			"https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=160&q=80",
	},
	{
		id: "5",
		doctor: "Dr. Eleanor Padilla",
		specialty: "Cardiologista",
		date: "12 Nov, 2025 às 14:30",
		photo:
			"https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=160&q=80",
	},
];

export default function PatientAppointmentsTab() {
	const router = useRouter();
	const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

	const closeModal = () => setSelectedAppointmentId(null);
	const handleConfirm = () => {
		console.log("Confirm attendance", selectedAppointmentId);
		closeModal();
	};
	const handleCancel = () => {
		console.log("Decline attendance", selectedAppointmentId);
		closeModal();
	};

	return (
		<Container>
			<ScrollView
				style={styles.content}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.header}>
					<TouchableOpacity
						style={styles.backButton}
						activeOpacity={0.8}
						onPress={() => router.back()}
					>
						<Ionicons name="arrow-back" size={20} color="#111827" />
					</TouchableOpacity>
					<Text style={styles.title}>Suas consultas</Text>
				</View>

				<Text style={styles.sectionTitle}>Consultas marcadas</Text>

				{APPOINTMENTS.map((appointment) => (
					<TouchableOpacity
						key={appointment.id}
						style={styles.card}
						activeOpacity={0.85}
						onPress={() => setSelectedAppointmentId(appointment.id)}
					>
						<Image source={{ uri: appointment.photo }} style={styles.avatar} />
						<View style={{ flex: 1 }}>
							<Text style={styles.cardDoctor}>{appointment.doctor}</Text>
							<Text style={styles.cardSpecialty}>{appointment.specialty}</Text>
							<View style={styles.cardInfoRow}>
								<Ionicons name="calendar" size={14} color="#6B7280" style={{ marginRight: 6 }} />
								<Text style={styles.cardDate}>{appointment.date}</Text>
							</View>
						</View>
					</TouchableOpacity>
				))}
			</ScrollView>

			<Modal transparent visible={selectedAppointmentId !== null} animationType="fade">
				<View style={styles.modalOverlay}>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>Consulta marcada</Text>
						<Text style={styles.modalDescription}>
							Confirme sua presença para que possamos manter seu atendimento como programado.
						</Text>
						<TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={handleConfirm}>
							<Text style={styles.primaryButtonText}>Confirmar presença</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.secondaryButton} activeOpacity={0.9} onPress={handleCancel}>
							<Text style={styles.secondaryButtonText}>Não poderei ir</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
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
		padding: 16,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#D6E0FF",
		marginBottom: 12,
		backgroundColor: "#FFFFFF",
	},
	avatar: {
		width: 56,
		height: 56,
		borderRadius: 18,
		marginRight: 16,
	},
	cardDoctor: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1F2933",
	},
	cardSpecialty: {
		marginTop: 2,
		fontSize: 13,
		color: "#6B7280",
	},
	cardInfoRow: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 12,
	},
	cardDate: {
		fontSize: 13,
		color: "#6B7280",
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(15, 23, 42, 0.35)",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 32,
	},
	modalCard: {
		width: "100%",
		borderRadius: 24,
		backgroundColor: "#FFFFFF",
		paddingVertical: 32,
		paddingHorizontal: 24,
		alignItems: "center",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#111827",
		marginBottom: 12,
	},
	modalDescription: {
		fontSize: 13,
		color: "#6B7280",
		textAlign: "center",
		marginBottom: 24,
		lineHeight: 20,
	},
	primaryButton: {
		width: "100%",
		backgroundColor: "#2F66F5",
		borderRadius: 16,
		paddingVertical: 14,
		alignItems: "center",
		marginBottom: 12,
	},
	primaryButtonText: {
		color: "#FFFFFF",
		fontWeight: "600",
		fontSize: 15,
	},
	secondaryButton: {
		width: "100%",
		borderRadius: 16,
		paddingVertical: 14,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#D1D5DB",
	},
	secondaryButtonText: {
		color: "#1F2933",
		fontWeight: "500",
		fontSize: 15,
	},
});
