import { Container } from "@/components/container";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SYMPTOM_SECTIONS = [
	{
		title: "Sintomas leves",
		items: ["Dor de cabeça", "Náusea leve"],
	},
	{
		title: "Sintomas moderados",
		items: ["Dor intensa", "Febre alta"],
	},
	{
		title: "Sintomas críticos",
		items: ["Dor no peito", "Desidratação grave"],
	},
] as const;

type SymptomId = `${number}-${number}`;

export default function ReportSymptomScreen() {
	const router = useRouter();
	const [selected, setSelected] = useState<Set<SymptomId>>(new Set());
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const selectedList = useMemo(() => Array.from(selected), [selected]);

	const toggleSymptom = (id: SymptomId) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const handleConfirm = () => {
		console.log("Symptoms prepared", selectedList);
		setShowConfirmModal(true);
	};

	const handleSend = () => {
		console.log("Symptoms notified", selectedList);
		setShowConfirmModal(false);
	};

	const handleCloseModal = () => {
		setShowConfirmModal(false);
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
					<Text style={styles.title}>Relatar sintoma</Text>
				</View>

				{SYMPTOM_SECTIONS.map((section, sectionIndex) => (
					<View key={section.title} style={styles.section}>
						<Text style={styles.sectionTitle}>{section.title}</Text>
						{section.items.map((item, itemIndex) => {
							const symptomId = `${sectionIndex}-${itemIndex}` as SymptomId;
							const isSelected = selected.has(symptomId);
							return (
								<TouchableOpacity
									key={item}
									style={[styles.symptomCard, isSelected && styles.symptomCardSelected]}
									activeOpacity={0.85}
									onPress={() => toggleSymptom(symptomId)}
								>
									<Text style={styles.symptomText}>{item}</Text>
									<View
										style={[styles.checkbox, isSelected && styles.checkboxSelected]}
									>
										{isSelected ? (
											<Ionicons name="checkmark" size={16} color="#FFFFFF" />
										) : null}
									</View>
								</TouchableOpacity>
							);
						})}
					</View>
				))}
			</ScrollView>

			<View style={styles.footer}>
				<TouchableOpacity style={styles.confirmButton} activeOpacity={0.9} onPress={handleConfirm}>
					<Text style={styles.confirmButtonText}>Confirmar</Text>
				</TouchableOpacity>
			</View>

			<Modal transparent visible={showConfirmModal} animationType="fade">
				<View style={styles.modalOverlay}>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>Notificar sintoma ao médico</Text>
						<Text style={styles.modalDescription}>
							Por favor, confirme clicando em "Enviar" para que possamos informar seu médico.
						</Text>
						<TouchableOpacity style={styles.modalPrimaryButton} activeOpacity={0.9} onPress={handleSend}>
							<Text style={styles.modalPrimaryButtonText}>Enviar</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.modalSecondaryButton} activeOpacity={0.9} onPress={handleCloseModal}>
							<Text style={styles.modalSecondaryButtonText}>Voltar</Text>
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
		paddingTop: 24,
		paddingBottom: 32,
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
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 15,
		fontWeight: "600",
		color: "#1F2933",
		marginBottom: 12,
	},
	symptomCard: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderWidth: 1,
		borderColor: "#C8D3F9",
		borderRadius: 16,
		paddingVertical: 14,
		paddingHorizontal: 18,
		marginBottom: 10,
		backgroundColor: "#FFFFFF",
	},
	symptomCardSelected: {
		borderColor: "#2F66F5",
	},
	symptomText: {
		fontSize: 15,
		color: "#1F2933",
		fontWeight: "500",
	},
	checkbox: {
		width: 22,
		height: 22,
		borderRadius: 6,
		borderWidth: 1.5,
		borderColor: "#97A5D3",
		alignItems: "center",
		justifyContent: "center",
	},
	checkboxSelected: {
		backgroundColor: "#2F66F5",
		borderColor: "#2F66F5",
	},
	footer: {
		paddingHorizontal: 24,
		paddingBottom: 32,
	},
	confirmButton: {
		width: "100%",
		backgroundColor: "#2F66F5",
		borderRadius: 16,
		paddingVertical: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	confirmButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
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
		paddingVertical: 28,
		paddingHorizontal: 24,
		alignItems: "center",
	},
	modalTitle: {
		fontSize: 17,
		fontWeight: "600",
		color: "#1F2933",
		marginBottom: 12,
	},
	modalDescription: {
		fontSize: 13,
		color: "#6B7280",
		textAlign: "center",
		marginBottom: 24,
		lineHeight: 20,
	},
	modalPrimaryButton: {
		width: "100%",
		backgroundColor: "#2F66F5",
		borderRadius: 16,
		paddingVertical: 14,
		alignItems: "center",
		marginBottom: 12,
	},
	modalPrimaryButtonText: {
		color: "#FFFFFF",
		fontWeight: "600",
		fontSize: 15,
	},
	modalSecondaryButton: {
		width: "100%",
		borderRadius: 16,
		paddingVertical: 14,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#D1D5DB",
	},
	modalSecondaryButtonText: {
		color: "#1F2933",
		fontWeight: "500",
		fontSize: 15,
	},
});
