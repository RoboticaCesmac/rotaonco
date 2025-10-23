import { apiClient } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";

export type Appointment = components["schemas"]["Appointment"];
export type AppointmentStatus = components["schemas"]["AppointmentStatus"];
export type AppointmentType = components["schemas"]["AppointmentType"];
export type PaginationMeta = components["schemas"]["PaginationMeta"];
export type PatientSummary = components["schemas"]["PatientSummary"];
export type AppointmentCreateInput = components["schemas"]["AppointmentCreateInput"];

export type AppointmentsListParams = {
	day?: string;
	status?: AppointmentStatus;
	limit?: number;
	offset?: number;
};

export type AppointmentListItem = Appointment & {
	patient?: PatientSummary | null;
};

export type AppointmentsListResponse = {
	data: AppointmentListItem[];
	meta: PaginationMeta;
};

const DEFAULT_META: PaginationMeta = {
	total: 0,
	limit: 10,
	offset: 0,
};

async function fetchPatientSummary(id: number): Promise<PatientSummary | null> {
	const { data, error } = await apiClient.GET("/patients/{id}", {
		params: { path: { id } },
	});

	if (error || !data) {
		return null;
	}

	return {
		id: data.id,
		fullName: data.fullName,
		cpf: data.cpf,
		stage: data.stage,
		status: data.status,
	};
}

export async function fetchAppointmentsList(params: AppointmentsListParams): Promise<AppointmentsListResponse> {
	const { data, error } = await apiClient.GET("/appointments", {
		params: {
			query: {
				day: params.day,
				status: params.status,
				limit: params.limit,
				offset: params.offset,
			},
		},
	});

	if (error) {
		throw error;
	}

	const appointments = data?.data ?? [];
	const meta = data?.meta ?? {
		...DEFAULT_META,
		limit: params.limit ?? DEFAULT_META.limit,
		offset: params.offset ?? DEFAULT_META.offset,
	};

	const uniquePatientIds = Array.from(new Set(appointments.map((item) => item.patientId).filter(Boolean)));
	const patientSummaries = new Map<number, PatientSummary>();

	if (uniquePatientIds.length > 0) {
		const patientPromises = uniquePatientIds.map(async (id) => {
			const summary = await fetchPatientSummary(id);
			return summary ? { id, summary } : null;
		});

		const results = await Promise.allSettled(patientPromises);
		for (const result of results) {
			if (result.status === "fulfilled" && result.value) {
				patientSummaries.set(result.value.id, result.value.summary);
			}
		}
	}

	const enriched = appointments
		.map((appointment) => {
			const patient = patientSummaries.get(appointment.patientId) ?? null;
			return {
				...appointment,
				patient,
			};
		})
		.sort((a, b) => {
			const left = new Date(a.startsAt ?? "").getTime();
			const right = new Date(b.startsAt ?? "").getTime();
			if (Number.isNaN(left) || Number.isNaN(right)) {
				return 0;
			}
			return left - right;
		});

	return { data: enriched, meta };
}

export async function createAppointment(input: AppointmentCreateInput): Promise<Appointment> {
	const { data, error } = await apiClient.POST("/appointments", {
		body: input,
	});

	if (error) {
		throw error;
	}

	if (!data) {
		throw new Error("Falha ao criar consulta");
	}

	return data;
}
