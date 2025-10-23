import { apiClient } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";
import type { TeamMemberStatus } from "./data";

export type ProfessionalDirectoryParameters = {
	query?: string;
	status?: TeamMemberStatus;
	limit?: number;
	offset?: number;
	includeSummary?: boolean;
};

export type ProfessionalDirectoryResponse = components["schemas"]["PaginatedUsers"];

export async function fetchProfessionals(params: ProfessionalDirectoryParameters = {}) {
	const { query, status, limit, offset, includeSummary = true } = params;

	const { data, error } = await apiClient.GET("/professionals", {
		params: {
			query: {
				q: query?.trim() ? query.trim() : undefined,
				status,
				limit,
				offset,
				includeSummary,
			},
		},
	});

	if (error) {
		throw error;
	}

	const fallback: ProfessionalDirectoryResponse = {
		data: [],
		meta: {
			total: 0,
			limit: limit ?? 0,
			offset: offset ?? 0,
			statusCounts: includeSummary
				? {
					total: 0,
					active: 0,
					inactive: 0,
				}
				: undefined,
		},
	};

	return data ?? fallback;
}
