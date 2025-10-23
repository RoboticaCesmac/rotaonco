import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAppointment, fetchAppointmentsList } from "./api";
import type {
	AppointmentsListParams,
	AppointmentsListResponse,
	AppointmentCreateInput,
} from "./api";

const APPOINTMENTS_SCOPE = "appointments";

export function useAppointmentsList(params: AppointmentsListParams) {
	return useQuery<AppointmentsListResponse>({
		queryKey: [APPOINTMENTS_SCOPE, params],
		queryFn: () => fetchAppointmentsList(params),
		staleTime: 30 * 1000,
		placeholderData: (previous) => previous,
	});
}

export function useCreateAppointment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: [APPOINTMENTS_SCOPE, "create"],
		mutationFn: (input: AppointmentCreateInput) => createAppointment(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_SCOPE] });
		},
	});
}
