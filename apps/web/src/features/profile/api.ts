import { apiClient } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";

export type Professional = components["schemas"]["User"];
export type ProfessionalProfileUpdateInput = components["schemas"]["ProfessionalProfileUpdateInput"];
export type ProfessionalPasswordUpdateInput = {
	newPassword: string;
	confirmPassword: string;
};

export async function fetchCurrentProfessional() {
	const { data, error } = await apiClient.GET("/professionals/me");

	if (error) {
		throw error;
	}

	return data ?? null;
}

export async function updateCurrentProfessional(input: ProfessionalProfileUpdateInput) {
	const { data, error } = await apiClient.PATCH("/professionals/me", {
		body: input,
	});

	if (error) {
		throw error;
	}

	return data ?? null;
}

export async function updateCurrentProfessionalPassword(input: ProfessionalPasswordUpdateInput) {
	const { error } = await apiClient.PATCH("/professionals/me/password", {
		body: input,
	});

	if (error) {
		throw error;
	}
}
