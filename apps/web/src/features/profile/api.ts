import { apiClient } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";

export type Professional = components["schemas"]["User"];

export async function fetchCurrentProfessional() {
	const { data, error } = await apiClient.GET("/professionals/me");

	if (error) {
		throw error;
	}

	return data ?? null;
}
