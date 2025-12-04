import { apiBaseUrl, apiClient } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";
import type { ReportKind } from "./data";

export type WaitTimesReport = components["schemas"]["WaitTimesReport"];
export type AttendanceReport = components["schemas"]["AttendanceReport"];
export type AdherenceReport = components["schemas"]["AdherenceReport"];
export type AlertsReport = components["schemas"]["AlertsReport"];

export type ReportRange = {
	start: string;
	end: string;
};

function toQueryParams(range: ReportRange) {
	return {
		query: {
			start: range.start,
			end: range.end,
		},
	};
}

export async function fetchWaitTimesReport(range: ReportRange) {
	const { data, error } = await apiClient.GET("/reports/wait-times", {
		params: toQueryParams(range),
	});
	if (error) {
		throw error;
	}
	return data ?? null;
}

export async function fetchAttendanceReport(range: ReportRange) {
	const { data, error } = await apiClient.GET("/reports/attendance", {
		params: toQueryParams(range),
	});
	if (error) {
		throw error;
	}
	return data ?? null;
}

export async function fetchAdherenceReport(range: ReportRange) {
	const { data, error } = await apiClient.GET("/reports/adherence", {
		params: toQueryParams(range),
	});
	if (error) {
		throw error;
	}
	return data ?? null;
}

export async function fetchAlertsReport(range: ReportRange) {
	const { data, error } = await apiClient.GET("/reports/alerts", {
		params: toQueryParams(range),
	});
	if (error) {
		throw error;
	}
	return data ?? null;
}

const EXCEL_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function extractFilename(contentDisposition: string | null) {
	if (!contentDisposition) {
		return null;
	}
	const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition);
	if (!match) {
		return null;
	}
	const encoded = match[1] ?? match[2];
	try {
		return decodeURIComponent(encoded);
	} catch {
		return encoded;
	}
}

export async function exportReportAsExcel(kind: ReportKind, range: ReportRange) {
	const params = new URLSearchParams({
		start: range.start,
		end: range.end,
	});
	const response = await fetch(`${apiBaseUrl}/reports/${kind}/export?${params.toString()}`, {
		method: "GET",
		headers: { Accept: EXCEL_MIME },
		credentials: "include",
	});
	if (!response.ok) {
		let message = "Não foi possível gerar a planilha de relatório.";
		try {
			const payload = await response.json();
			if (typeof payload?.message === "string" && payload.message.trim().length > 0) {
				message = payload.message;
			}
		} catch {
			// ignore JSON parse errors
		}
		throw new Error(message);
	}
	const blob = await response.blob();
	const inferredFilename = extractFilename(response.headers.get("content-disposition"));
	const fallback = `relatorio-${kind.replace(/_/g, "-")}-${range.start}-${range.end}.xlsx`;
	const filename = inferredFilename ?? fallback;
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.style.display = "none";
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}
