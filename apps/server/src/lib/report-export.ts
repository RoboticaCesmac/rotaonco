import * as XLSX from "xlsx";
import type { WorkBook } from "xlsx";

import type {
	AttendanceReport,
	WaitTimesReport,
	AdherenceReport,
	AlertsReport,
} from "../services/reports";

type ReportPeriod = {
	start: string;
	end: string;
};

type SummaryRow = Array<string | number>;

const DEFAULT_SHEET = "Resumo";

const STATUS_LABEL: Record<string, string> = {
	scheduled: "Agendadas",
	confirmed: "Confirmadas",
	completed: "Concluídas",
	no_show: "Não compareceu",
	canceled: "Canceladas",
};

const ALERT_SEVERITY_LABEL: Record<"low" | "medium" | "high", string> = {
	low: "Baixa",
	medium: "Média",
	high: "Alta",
};

const ALERT_STATUS_LABEL: Record<"open" | "acknowledged" | "closed", string> = {
	open: "Aberto",
	acknowledged: "Reconhecido",
	closed: "Fechado",
};

const EXCEL_MIME =
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function formatPercent(value: number) {
	const percent = Number.isFinite(value) ? value * 100 : 0;
	return `${percent.toFixed(2)}%`;
}

function formatDecimal(value: number) {
	if (!Number.isFinite(value)) {
		return 0;
	}
	return Number(value.toFixed(2));
}

function bookWithSummary(title: string, period: ReportPeriod, rows: SummaryRow[]) {
	const sheetRows: SummaryRow[] = [
		[title],
		["Período inicial", period.start],
		["Período final", period.end],
		[],
		...rows,
	];
	const workbook = XLSX.utils.book_new();
	const sheet = XLSX.utils.aoa_to_sheet(sheetRows);
	XLSX.utils.book_append_sheet(workbook, sheet, DEFAULT_SHEET);
	return workbook;
}

export function createAttendanceWorkbook(
	report: AttendanceReport,
	period: ReportPeriod,
) {
	const rows: SummaryRow[] = [
		["Status", "Quantidade"],
		[STATUS_LABEL.scheduled, report.totals.scheduled],
		[STATUS_LABEL.confirmed, report.totals.confirmed],
		[STATUS_LABEL.completed, report.totals.completed],
		[STATUS_LABEL.no_show, report.totals.noShow],
		["Taxa de cancelamento", formatPercent(report.totals.cancellationRate)],
	];
	return bookWithSummary("Relatório de presença", period, rows);
}

export function createWaitTimesWorkbook(
	report: WaitTimesReport,
	period: ReportPeriod,
) {
	const rows: SummaryRow[] = [
		["Métrica", "Dias"],
		["Tempo médio até triagem", formatDecimal(report.averageDaysToTriage)],
		["Tempo médio até tratamento", formatDecimal(report.averageDaysToTreatment)],
		["Tempo mediano na fila", formatDecimal(report.medianQueueTime)],
	];
	return bookWithSummary("Relatório de tempo", period, rows);
}

export function createAdherenceWorkbook(
	report: AdherenceReport,
	period: ReportPeriod,
) {
	const rows: SummaryRow[] = [
		["Resumo", "Quantidade"],
		["Consultas concluídas", report.totals.completedAppointments],
		["Relatos de sintomas", report.totals.symptomReportCount],
		[],
		["Pacientes", "Quantidade"],
		[
			"Com consultas concluídas",
			report.patients.withCompletedAppointments,
		],
		["Relatando sintomas", report.patients.reportingSymptoms],
		["Engajados (ambos)", report.patients.engaged],
		["Taxa de engajamento", formatPercent(report.patients.engagementRate)],
	];
	return bookWithSummary("Relatório de adesão", period, rows);
}

export function createAlertsWorkbook(
	report: AlertsReport,
	period: ReportPeriod,
) {
	const summaryRows: SummaryRow[] = [
		["Status", "Quantidade"],
		[ALERT_STATUS_LABEL.open, report.totals.status.open],
		[ALERT_STATUS_LABEL.acknowledged, report.totals.status.acknowledged],
		[ALERT_STATUS_LABEL.closed, report.totals.status.closed],
		[],
		["Severidade", "Quantidade"],
		[ALERT_SEVERITY_LABEL.low, report.totals.severity.low],
		[ALERT_SEVERITY_LABEL.medium, report.totals.severity.medium],
		[ALERT_SEVERITY_LABEL.high, report.totals.severity.high],
	];

	const workbook = bookWithSummary("Relatório de alertas", period, summaryRows);

	if (report.recent.length > 0) {
		const recentRows: SummaryRow[] = [
			["ID", "Paciente", "Tipo", "Severidade", "Status", "Criado em"],
			...report.recent.map((item) => [
				item.id,
				item.patientId,
				item.kind,
				ALERT_SEVERITY_LABEL[item.severity],
				ALERT_STATUS_LABEL[item.status],
				item.createdAt,
			]),
		];
		const recentSheet = XLSX.utils.aoa_to_sheet(recentRows);
		XLSX.utils.book_append_sheet(workbook, recentSheet, "Recentes");
	}

	return workbook;
}

export function writeWorkbookToArrayBuffer(workbook: WorkBook) {
	return XLSX.write(workbook, { bookType: "xlsx", type: "array" });
}

export function buildReportFilename(kind: string, period: ReportPeriod) {
	const normalized = kind
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9-_]+/g, "_")
		.replace(/_{2,}/g, "_")
		.replace(/^_+|_+$/g, "");
	return `relatorio_${normalized}_${period.start}_${period.end}.xlsx`;
}

export function getReportMimeType() {
	return EXCEL_MIME;
}

export type { ReportPeriod };
