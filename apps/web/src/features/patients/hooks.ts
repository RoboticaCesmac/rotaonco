import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	fetchPatientsList,
	fetchPatientsMetrics,
	fetchPatientDetail,
	updatePatient,
	createPatient,
	type PatientsListParams,
	type PatientsMetrics,
	type PatientStage,
	type PatientStatus,
	type PatientDetail,
	type PatientUpdateInput,
	type PatientCreateInput,
} from "./api";

export type PatientsFilters = {
	q?: string;
	status?: PatientStatus;
	stage?: PatientStage;
	page: number;
	limit: number;
};

const PATIENTS_SCOPE = "patients";

function sanitizeListParams(filters: PatientsFilters): PatientsListParams {
	const limit = Math.max(1, filters.limit);
	const page = Math.max(1, filters.page);
	return {
		q: filters.q?.trim() ? filters.q.trim() : undefined,
		status: filters.status,
		stage: filters.stage,
		limit,
		offset: (page - 1) * limit,
	};
}

export function usePatientsMetrics() {
	return useQuery<PatientsMetrics>({
		queryKey: [PATIENTS_SCOPE, "metrics"],
		queryFn: fetchPatientsMetrics,
		staleTime: 60 * 1000,
	});
}

export function usePatientsList(filters: PatientsFilters) {
	const params = sanitizeListParams(filters);
	return useQuery({
		queryKey: [
			PATIENTS_SCOPE,
			"list",
			{
				q: params.q ?? "",
				status: params.status ?? "all",
				stage: params.stage ?? "all",
				limit: params.limit ?? 10,
				offset: params.offset ?? 0,
			},
		],
		queryFn: () => fetchPatientsList(params),
		placeholderData: keepPreviousData,
	});
}

export function usePatientDetail(patientId: number | null) {
	return useQuery<PatientDetail>({
		queryKey: [PATIENTS_SCOPE, "detail", patientId],
		enabled: typeof patientId === "number",
		queryFn: () => {
			if (typeof patientId !== "number") {
				throw new Error("Paciente não informado");
			}
			return fetchPatientDetail(patientId);
		},
		staleTime: 30 * 1000,
		gcTime: 5 * 60 * 1000,
	});
}

export function useUpdatePatient(patientId: number | null) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: [PATIENTS_SCOPE, "update", patientId],
		mutationFn: async (input: PatientUpdateInput) => {
			if (typeof patientId !== "number") {
				throw new Error("Paciente não selecionado");
			}
			return updatePatient(patientId, input);
		},
		onSuccess: (_data, _variables, _context) => {
			if (typeof patientId === "number") {
				queryClient.invalidateQueries({ queryKey: [PATIENTS_SCOPE, "detail", patientId] });
			}
			queryClient.invalidateQueries({ queryKey: [PATIENTS_SCOPE, "list"] });
		},
	});
}

export function useCreatePatient() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: [PATIENTS_SCOPE, "create"],
		mutationFn: async (input: PatientCreateInput) => {
			return createPatient(input);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [PATIENTS_SCOPE, "list"] });
			queryClient.invalidateQueries({ queryKey: [PATIENTS_SCOPE, "metrics"] });
		},
	});
}
