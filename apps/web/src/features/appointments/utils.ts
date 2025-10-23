import type { AppointmentStatus, AppointmentType } from "./api";

const TYPE_LABELS: Record<AppointmentType, string> = {
	triage: "Triagem",
	treatment: "Tratamento",
	return: "Retorno",
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
	scheduled: "Agendada",
	confirmed: "Confirmada",
	completed: "Concluída",
	no_show: "Falta",
	canceled: "Cancelada",
};

const STATUS_ACCENTS: Partial<Record<AppointmentStatus, string>> = {
	scheduled: "bg-[#F3F6FD] text-[#3663D8]",
	confirmed: "bg-[#DEF7EC] text-[#047857]",
	completed: "bg-[#E6F4FF] text-[#1D4ED8]",
	no_show: "bg-[#FEF3C7] text-[#92400E]",
	canceled: "bg-[#FEE2E2] text-[#B91C1C]",
};

export function getAppointmentTypeLabel(type: AppointmentType) {
	return TYPE_LABELS[type] ?? "Consulta";
}

export function getAppointmentStatusLabel(status: AppointmentStatus) {
	return STATUS_LABELS[status] ?? "Desconhecido";
}

export function getAppointmentStatusAccent(status: AppointmentStatus) {
	return STATUS_ACCENTS[status] ?? "bg-[#F3F6FD] text-[#3663D8]";
}

export function formatAppointmentDate(startsAt: string | undefined | null) {
	if (!startsAt) {
		return "Data não informada";
	}
	const date = new Date(startsAt);
	if (Number.isNaN(date.getTime())) {
		return "Data inválida";
	}
	const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
	const parts = dateFormatter.formatToParts(date);
	const day = parts.find((part) => part.type === "day")?.value ?? "";
	const month = parts.find((part) => part.type === "month")?.value ?? "";
	const year = parts.find((part) => part.type === "year")?.value ?? "";
	const hour = parts.find((part) => part.type === "hour")?.value ?? "";
	const minute = parts.find((part) => part.type === "minute")?.value ?? "";

	return `${day} ${month}${year ? `, ${year}` : ""} às ${hour}:${minute}`;
}

export function toISODateString(date: Date) {
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, "0");
	const day = `${date.getDate()}`.padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function parseISODate(value: string | undefined, fallback: Date): Date {
	if (!value) {
		return fallback;
	}
	const [year, month, day] = value.split("-").map(Number);
	if (
		Number.isNaN(year) ||
		Number.isNaN(month) ||
		Number.isNaN(day) ||
		year < 1970 ||
		month < 1 ||
		month > 12 ||
		day < 1 ||
		day > 31
	) {
		return fallback;
	}
	const parsed = new Date(year, month - 1, day);
	if (Number.isNaN(parsed.getTime())) {
		return fallback;
	}
	return parsed;
}

export const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function getMonthMatrix(anchor: Date) {
	const firstDayOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
	const startDay = firstDayOfMonth.getDay();
	const startDate = new Date(firstDayOfMonth);
	startDate.setDate(firstDayOfMonth.getDate() - startDay);

	const weeks: Date[][] = [];
	for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
		const week: Date[] = [];
		for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
			const current = new Date(startDate);
			current.setDate(startDate.getDate() + weekIndex * 7 + dayIndex);
			week.push(current);
		}
		weeks.push(week);
	}

	return weeks;
}
