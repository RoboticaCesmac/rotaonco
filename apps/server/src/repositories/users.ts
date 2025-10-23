import { eq } from "drizzle-orm";
import { db } from "../db";
import { roles, userRoles, users } from "../db/schema/core";

export type UserWithRoles = {
	id: number;
	externalId: string;
	roles: string[];
	name?: string;
	email?: string;
	documentId?: string;
	specialty?: string | null;
	phone?: string | null;
	isActive?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
};

export async function findUserWithRolesByExternalId(externalId: string): Promise<UserWithRoles | null> {
	const rows = await db
		.select({
			id: users.id,
			externalId: users.externalId,
			name: users.name,
			email: users.email,
			documentId: users.documentId,
			specialty: users.specialty,
			phone: users.phone,
			isActive: users.isActive,
			createdAt: users.createdAt,
			updatedAt: users.updatedAt,
			role: roles.name,
		})
		.from(users)
		.leftJoin(userRoles, eq(userRoles.userId, users.id))
		.leftJoin(roles, eq(roles.id, userRoles.roleId))
		.where(eq(users.externalId, externalId));

	if (rows.length === 0) {
		return null;
	}

	const { id } = rows[0];
	const [{ name, email, documentId, specialty, phone, isActive, createdAt, updatedAt }] = rows;
	const roleNames = Array.from(new Set(rows.map((row) => row.role).filter((name): name is string => Boolean(name))));

	return {
		id,
		externalId,
		roles: roleNames,
		name,
		email,
		documentId,
		specialty,
		phone,
		isActive,
		createdAt,
		updatedAt,
	};
}
