import type { PatientStage, PatientStatus } from "./api";

export type StageFilterValue = PatientStage | "all";
export type StatusFilterValue = PatientStatus | "all";

export const stageFilterOptions: Array<{ value: StageFilterValue; label: string }> = [
	{ value: "all", label: "Todas as etapas" },
	{ value: "pre_triage", label: "Pré-triagem" },
	{ value: "in_treatment", label: "Em tratamento" },
	{ value: "post_treatment", label: "Pós-tratamento" },
];

export const statusFilterOptions: Array<{ value: StatusFilterValue; label: string }> = [
	{ value: "all", label: "Todos os status" },
	{ value: "active", label: "Ativo" },
	{ value: "inactive", label: "Inativo" },
	{ value: "at_risk", label: "Em risco" },
];

type BadgeInfo = {
	label: string;
	className: string;
};

export function getStageBadge(stage?: PatientStage | null): BadgeInfo {
	switch (stage) {
		case "pre_triage":
			return { label: "Pré-triagem", className: "bg-[#2563EB]/10 text-[#2563EB]" };
		case "in_treatment":
			return { label: "Em tratamento", className: "bg-[#3663D8] text-white" };
		case "post_treatment":
			return { label: "Pós-tratamento", className: "bg-[#34C759] text-white" };
		default:
			return { label: "Etapa indeterminada", className: "bg-[#E5E7EB] text-[#6B7280]" };
	}
}

export function getStatusBadge(status?: PatientStatus | null): BadgeInfo {
	switch (status) {
		case "active":
			return { label: "Ativo", className: "bg-[#2563EB]/10 text-[#2563EB]" };
		case "inactive":
			return { label: "Inativo", className: "bg-[#D1D5DB] text-[#4B5563]" };
		case "at_risk":
			return { label: "Em risco", className: "bg-[#F59E0B]/10 text-[#B45309]" };
		default:
			return { label: "Status indefinido", className: "bg-[#E5E7EB] text-[#6B7280]" };
	}
}
