import { and, eq, inArray, like, ne, or, sql, type SQL } from "drizzle-orm";

import { db } from "../db";
import { roles, userRoles, users } from "../db/schema/core";

export type ProfessionalOnboardingInput = {
	externalId: string;
	fullName: string;
	email: string;
	documentId: string;
	specialty: string;
	phone?: string | null;
};

export type ProfessionalOnboardingResult = {
	userId: number;
	isNewUser: boolean;
	roles: string[];
};

export class ProfessionalOnboardingError extends Error {
	constructor(public code: "INVALID_DOCUMENT" | "DOCUMENT_IN_USE" | "ROLE_NOT_FOUND" | "MISSING_ACCOUNT" ) {
		super(code);
		this.name = "ProfessionalOnboardingError";
	}
}

function sanitizeDocumentId(doc: string) {
	return doc.replace(/\D/g, "");
}

function sanitizePhone(phone?: string | null) {
	if (!phone) return null;
	const digits = phone.replace(/\D/g, "");
	return digits.length === 0 ? null : digits;
}

function clampLimit(limit?: number) {
	if (limit === undefined || limit === null) {
		return DEFAULT_LIST_LIMIT;
	}
	return Math.max(1, Math.min(limit, MAX_LIST_LIMIT));
}

function normalizeOffset(offset?: number) {
	if (offset === undefined || offset === null) {
		return 0;
	}
	return Math.max(0, offset);
}

function toIsoString(value: Date | string | null | undefined) {
	if (!value) {
		return null;
	}
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export interface ProfessionalOnboardingService {
	completeOnboarding(input: ProfessionalOnboardingInput): Promise<ProfessionalOnboardingResult>;
}

export function createProfessionalDirectoryService(): ProfessionalDirectoryService {
	return {
		async listProfessionals(params) {
			const limit = clampLimit(params.limit);
			const offset = normalizeOffset(params.offset);
			const search = params.q?.trim();
			const statusFilter = params.status;
			let whereClause: SQL<unknown> = eq(roles.name, PROFESSIONAL_ROLE_NAME);
			if (statusFilter) {
				const isActive = statusFilter === "active";
				whereClause = and(whereClause, eq(users.isActive, isActive)) as SQL<unknown>;
			}
			if (search && search.length > 0) {
				const normalizedSearch = search.replace(/\s+/g, "%");
				const pattern = `%${normalizedSearch}%`;
				whereClause = and(
					whereClause,
					or(
						like(users.name, pattern),
						like(users.email, pattern),
						like(users.specialty, pattern),
						like(users.documentId, pattern),
					),
				) as SQL<unknown>;
			}

			const rows = await db
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
					documentId: users.documentId,
					specialty: users.specialty,
					phone: users.phone,
					isActive: users.isActive,
					createdAt: users.createdAt,
					updatedAt: users.updatedAt,
				})
				.from(users)
				.innerJoin(userRoles, eq(userRoles.userId, users.id))
				.innerJoin(roles, eq(roles.id, userRoles.roleId))
				.where(whereClause)
				.groupBy(
					users.id,
					users.name,
					users.email,
					users.documentId,
					users.specialty,
					users.phone,
					users.isActive,
					users.createdAt,
					users.updatedAt,
				)
				.orderBy(users.name)
				.limit(limit)
				.offset(offset);

			let countQuery = db
				.select({ count: sql<number>`COUNT(DISTINCT ${users.id})` })
				.from(users)
				.innerJoin(userRoles, eq(userRoles.userId, users.id))
				.innerJoin(roles, eq(roles.id, userRoles.roleId))
				.where(whereClause);
			const [{ count: totalCount = 0 } = { count: 0 }] = await countQuery;

			const userIds = rows.map((row) => row.id);
			let roleRows: Array<{ userId: number; role: string }> = [];
			if (userIds.length > 0) {
				roleRows = await db
					.select({
						userId: userRoles.userId,
						role: roles.name,
					})
					.from(userRoles)
					.innerJoin(roles, eq(roles.id, userRoles.roleId))
					.where(inArray(userRoles.userId, userIds));
			}

			const rolesMap = new Map<number, string[]>();
			for (const row of roleRows) {
				const current = rolesMap.get(row.userId) ?? [];
				current.push(row.role);
				rolesMap.set(row.userId, current);
			}

			const data = rows.map((row) => ({
				id: row.id,
				name: row.name,
				email: row.email,
				documentId: row.documentId,
				specialty: row.specialty ?? null,
				phone: row.phone ?? null,
				isActive: Boolean(row.isActive),
				roles: rolesMap.get(row.id) ?? [],
				createdAt: toIsoString(row.createdAt),
				updatedAt: toIsoString(row.updatedAt),
			}));

			return {
				data,
				total: Number(totalCount) || 0,
				limit,
				offset,
			};
		},
		async getSummary() {
			const [active, inactive] = await Promise.all([
				countProfessionalsByStatus(true),
				countProfessionalsByStatus(false),
			]);
			return {
				total: active + inactive,
				active,
				inactive,
			};
		},
	};
}

async function countProfessionalsByStatus(isActive: boolean) {
	const [{ count = 0 } = { count: 0 }] = await db
		.select({ count: sql<number>`COUNT(DISTINCT ${users.id})` })
		.from(users)
		.innerJoin(userRoles, eq(userRoles.userId, users.id))
		.innerJoin(roles, eq(roles.id, userRoles.roleId))
		.where(and(eq(roles.name, PROFESSIONAL_ROLE_NAME), eq(users.isActive, isActive)));
	return Number(count) || 0;
}

const PROFESSIONAL_ROLE_NAME = "professional" as const;

const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 100;

export type ProfessionalListParams = {
	q?: string;
	status?: "active" | "inactive";
	limit?: number;
	offset?: number;
};

export type ProfessionalDirectoryResult = {
	data: Array<{
		id: number;
		name: string;
		email: string;
		documentId: string;
		specialty?: string | null;
		phone?: string | null;
		isActive: boolean;
		roles: string[];
		createdAt?: string | null;
		updatedAt?: string | null;
	}>;
	total: number;
	limit: number;
	offset: number;
};

export type ProfessionalStatusSummary = {
	total: number;
	active: number;
	inactive: number;
};

export interface ProfessionalDirectoryService {
	listProfessionals(params: ProfessionalListParams): Promise<ProfessionalDirectoryResult>;
	getSummary(): Promise<ProfessionalStatusSummary>;
}

export function createProfessionalOnboardingService(): ProfessionalOnboardingService {
	return {
		async completeOnboarding(input) {
			const documentDigits = sanitizeDocumentId(input.documentId);
			if (documentDigits.length !== 11) {
				throw new ProfessionalOnboardingError("INVALID_DOCUMENT");
			}

			const normalizedName = input.fullName.trim();
			const normalizedEmail = input.email.trim().toLowerCase();
			const normalizedSpecialty = input.specialty.trim();
			const normalizedPhone = sanitizePhone(input.phone);

			if (!normalizedName) {
				throw new ProfessionalOnboardingError("MISSING_ACCOUNT");
			}

			return db.transaction(async (tx) => {
				const existingUser = await tx.query.users.findFirst({
					where: eq(users.externalId, input.externalId),
				});

				if (existingUser && existingUser.documentId !== documentDigits) {
					const conflictingDocumentOwner = await tx.query.users.findFirst({
						where: and(eq(users.documentId, documentDigits), ne(users.id, existingUser.id)),
					});
					if (conflictingDocumentOwner) {
						throw new ProfessionalOnboardingError("DOCUMENT_IN_USE");
					}
				}

				if (!existingUser) {
					const conflictingDocumentOwner = await tx.query.users.findFirst({
						where: eq(users.documentId, documentDigits),
					});
					if (conflictingDocumentOwner) {
						throw new ProfessionalOnboardingError("DOCUMENT_IN_USE");
					}
				}

				let userId: number;
				let isNewUser = false;

				if (existingUser) {
					await tx
						.update(users)
						.set({
							name: normalizedName,
							email: normalizedEmail,
							documentId: documentDigits,
							specialty: normalizedSpecialty,
							phone: normalizedPhone,
							updatedAt: new Date(),
						})
						.where(eq(users.id, existingUser.id));
					userId = existingUser.id;
				} else {
					const insertResult = await tx.insert(users).values({
						externalId: input.externalId,
						name: normalizedName,
						email: normalizedEmail,
						documentId: documentDigits,
						specialty: normalizedSpecialty,
						phone: normalizedPhone,
						isActive: true,
					});

					const insertedId = Number((insertResult as { insertId?: number }).insertId);
					if (!insertedId || Number.isNaN(insertedId)) {
						const createdUser = await tx.query.users.findFirst({
							where: eq(users.externalId, input.externalId),
						});
						if (!createdUser) {
							throw new ProfessionalOnboardingError("MISSING_ACCOUNT");
						}
						userId = createdUser.id;
					} else {
						userId = insertedId;
					}
					isNewUser = true;
				}

				const [professionalRole] = await tx.select().from(roles).where(eq(roles.name, PROFESSIONAL_ROLE_NAME)).limit(1);
				if (!professionalRole) {
					throw new ProfessionalOnboardingError("ROLE_NOT_FOUND");
				}

				await tx
					.insert(userRoles)
					.values({
						userId,
						roleId: professionalRole.id,
					})
					.onDuplicateKeyUpdate({
						set: {
							assignedAt: sql`VALUES(assigned_at)`,
						},
					});

				const roleRows = await tx
					.select({ name: roles.name })
					.from(userRoles)
					.innerJoin(roles, eq(roles.id, userRoles.roleId))
					.where(eq(userRoles.userId, userId));

				return {
					userId,
					isNewUser,
					roles: roleRows.map((row) => row.name),
				};
			});
		},
	};
}
