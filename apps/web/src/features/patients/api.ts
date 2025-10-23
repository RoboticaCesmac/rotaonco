import { apiClient } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";

export type PatientSummary = components["schemas"]["PatientSummary"];
export type PatientStatus = components["schemas"]["PatientStatus"];
export type PatientStage = components["schemas"]["PatientStage"];
export type PaginationMeta = components["schemas"]["PaginationMeta"];
export type PatientDetail = components["schemas"]["PatientDetail"];
export type PatientUpdateInput = components["schemas"]["PatientUpdateInput"];
export type Patient = components["schemas"]["Patient"];
export type PatientCreateInput = components["schemas"]["PatientCreateInput"];

export type PatientsListParams = {
	q?: string;
	status?: PatientStatus;
	stage?: PatientStage;
	limit?: number;
	offset?: number;
};

export type PatientsListResponse = {
	data: PatientSummary[];
	meta: PaginationMeta;
};

const DEFAULT_LIST_FALLBACK_META: PaginationMeta = {
	total: 0,
	limit: 10,
	offset: 0,
};

export async function fetchPatientsList(params: PatientsListParams): Promise<PatientsListResponse> {
	const { data, error } = await apiClient.GET("/patients", {
		params: {
			query: {
				q: params.q,
				status: params.status,
				stage: params.stage,
				limit: params.limit,
				offset: params.offset,
			},
		},
	});

	if (error) {
		throw error;
	}

	return {
		data: data?.data ?? [],
		meta: data?.meta ?? { ...DEFAULT_LIST_FALLBACK_META, limit: params.limit ?? 10, offset: params.offset ?? 0 },
	};
}

export type PatientsMetrics = {
	total: number;
	inTreatment: number;
	concluded: number;
	atRisk: number;
};

async function fetchPatientsCount(filters: { status?: PatientStatus; stage?: PatientStage }) {
	const { data, error } = await apiClient.GET("/patients", {
		params: {
			query: {
				status: filters.status,
				stage: filters.stage,
				limit: 1,
				offset: 0,
			},
		},
	});

	if (error) {
		throw error;
	}

	return data?.meta?.total ?? 0;
}

export async function fetchPatientsMetrics(): Promise<PatientsMetrics> {
	const [total, inTreatment, concluded, atRisk] = await Promise.all([
		fetchPatientsCount({}),
		fetchPatientsCount({ stage: "in_treatment" }),
		fetchPatientsCount({ stage: "post_treatment" }),
		fetchPatientsCount({ status: "at_risk" }),
	]);

	return {
		total,
		inTreatment,
		concluded,
		atRisk,
	};
}

export async function fetchPatientDetail(id: number): Promise<PatientDetail> {
	const { data, error } = await apiClient.GET("/patients/{id}", {
		params: { path: { id } },
	});

	if (error) {
		throw error;
	}

	if (!data) {
		throw new Error("Paciente não encontrado");
	}

	return data;
}

export async function updatePatient(id: number, input: PatientUpdateInput): Promise<Patient> {
	const { data, error } = await apiClient.PUT("/patients/{id}", {
		params: { path: { id } },
		body: input,
	});

	if (error) {
		throw error;
	}

	if (!data) {
		throw new Error("Falha ao atualizar paciente");
	}

	return data;
}

export async function createPatient(input: PatientCreateInput): Promise<Patient> {
	const { data, error } = await apiClient.POST("/patients", {
		body: input,
	});

	if (error) {
		throw error;
	}

	if (!data) {
		throw new Error("Falha ao criar paciente");
	}

	return data;
}
