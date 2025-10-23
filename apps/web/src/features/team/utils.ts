import type { TeamMemberStatus } from "./data";

const STATUS_META: Record<TeamMemberStatus, { label: string; className: string }> = {
	active: {
		label: "Ativo",
		className: "bg-[#E8F2FF] text-[#1F56B9]",
	},
	inactive: {
		label: "Inativo",
		className: "bg-[#FDE8E8] text-[#B91C1C]",
	},
};

const DEFAULT_STATUS_META = {
	label: "Status desconhecido",
	className: "bg-[#F9FAFB] text-[#6B7280]",
};

const ROLE_LABELS: Record<string, string> = {
	admin: "Admin",
	professional: "Profissional",
};

export function getStatusBadge(status: TeamMemberStatus) {
	return STATUS_META[status] ?? DEFAULT_STATUS_META;
}

export function formatDate(value?: string | null) {
	if (!value) {
		return "—";
	}

	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(parsed);
}

export function formatRoles(roles: string[]) {
	if (roles.length === 0) {
		return "—";
	}

	return roles.map((role) => ROLE_LABELS[role] ?? role).join(", ");
}
