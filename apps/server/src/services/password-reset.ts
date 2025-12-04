import { randomBytes, randomUUID } from "node:crypto";
import { and, eq, isNull, ne } from "drizzle-orm";

import { db } from "../db";
import { passwordResetTokens, users } from "../db/schema/core";
import { auth } from "../lib/auth";
import { sendPasswordResetEmail } from "../lib/email";
import type { Logger } from "../lib/logger";
import { insertAuditLog } from "../repositories/audit";

const DEFAULT_TOKEN_TTL_MINUTES = 60;
const WEB_APP_FALLBACK_URL = "https://app.rotaonco.com";

export class PasswordResetError extends Error {
	constructor(
		public readonly code: "INVALID_TOKEN" | "TOKEN_EXPIRED" | "TOKEN_ALREADY_USED",
	) {
		super(code);
		this.name = "PasswordResetError";
	}
}

type PasswordResetRequestInput = {
	email: string;
	ipAddress?: string | null;
	userAgent?: string | null;
	logger?: Logger;
};

type PasswordResetConfirmInput = {
	token: string;
	newPassword: string;
	logger?: Logger;
};

type ParsedToken = {
	tokenId: string;
	secret: string;
};

function getTokenTtlMs() {
	const raw = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? "");
	const minutes = Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TOKEN_TTL_MINUTES;
	return minutes * 60_000;
}

function getWebAppBaseUrl() {
	const raw = process.env.APP_WEB_URL?.trim();
	if (!raw) {
		return WEB_APP_FALLBACK_URL;
	}
	return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function normalizeEmail(value: string) {
	return value.trim().toLowerCase();
}

function generateToken(): { token: string; tokenId: string; secret: string } {
	const tokenId = randomUUID();
	const secret = randomBytes(32).toString("hex");
	return {
		tokenId,
		secret,
		token: `${tokenId}.${secret}`,
	};
}

function parseToken(rawToken: string): ParsedToken {
	const trimmed = rawToken.trim();
	const separatorIndex = trimmed.indexOf(".");
	if (separatorIndex <= 0 || separatorIndex === trimmed.length - 1) {
		throw new PasswordResetError("INVALID_TOKEN");
	}
	return {
		tokenId: trimmed.slice(0, separatorIndex),
		secret: trimmed.slice(separatorIndex + 1),
	};
}

async function getValidTokenRecord(parsed: ParsedToken) {
	const record = await db.query.passwordResetTokens.findFirst({
		where: eq(passwordResetTokens.tokenId, parsed.tokenId),
	});

	if (!record) {
		throw new PasswordResetError("INVALID_TOKEN");
	}

	if (record.usedAt) {
		throw new PasswordResetError("TOKEN_ALREADY_USED");
	}

	const expiresAt = "expiresAt" in record && record.expiresAt ? new Date(record.expiresAt) : null;
	if (expiresAt && expiresAt.getTime() < Date.now()) {
		throw new PasswordResetError("TOKEN_EXPIRED");
	}

	const ctx = await auth.$context;
	const isValid = await ctx.password.verify(record.tokenHash, parsed.secret);
	if (!isValid) {
		throw new PasswordResetError("INVALID_TOKEN");
	}

	return { record, ctx };
}

export interface PasswordResetService {
	requestReset(input: PasswordResetRequestInput): Promise<void>;
	validateToken(token: string): Promise<void>;
	confirmReset(input: PasswordResetConfirmInput): Promise<void>;
}

export function createPasswordResetService(): PasswordResetService {
	return {
		async requestReset(input) {
			const normalizedEmail = normalizeEmail(input.email);
			const user = await db.query.users.findFirst({
				where: eq(users.email, normalizedEmail),
			});

			if (!user) {
				return;
			}

			const { token, tokenId, secret } = generateToken();
			const ctx = await auth.$context;
			const tokenHash = await ctx.password.hash(secret);
			const now = new Date();
			const expiresAt = new Date(now.getTime() + getTokenTtlMs());

			await db.transaction(async (tx) => {
				await tx
					.update(passwordResetTokens)
					.set({ usedAt: now })
					.where(and(eq(passwordResetTokens.userId, user.id), isNull(passwordResetTokens.usedAt)));

				await tx.insert(passwordResetTokens).values({
					tokenId,
					tokenHash,
					userId: user.id,
					authUserId: user.externalId,
					email: user.email,
					expiresAt,
					createdAt: now,
					ipAddress: input.ipAddress ?? null,
					userAgent: input.userAgent ?? null,
				});
			});

			const resetUrl = `${getWebAppBaseUrl()}/resetar-senha?token=${encodeURIComponent(token)}`;

			try {
				await sendPasswordResetEmail({
					to: user.email,
					resetUrl,
					name: user.name,
				});
			} catch (error) {
				input.logger?.error("Failed to send password reset email", {
					email: user.email,
					message: error instanceof Error ? error.message : "unknown",
				});
				throw error;
			}

			await insertAuditLog(
				"password_reset_requested",
				"user",
				user.id,
				{
					ipAddress: input.ipAddress ?? null,
					userAgent: input.userAgent ?? null,
				},
				null,
			);
		},
		async validateToken(token) {
			const parsed = parseToken(token);
			await getValidTokenRecord(parsed);
		},
		async confirmReset(input) {
			const parsed = parseToken(input.token);
			const { record, ctx } = await getValidTokenRecord(parsed);
			const now = new Date();
			const hashedPassword = await ctx.password.hash(input.newPassword);

			await db.transaction(async (tx) => {
				await ctx.internalAdapter.updatePassword(record.authUserId, hashedPassword, ctx as never);

				await tx
					.update(users)
					.set({ mustChangePassword: false, updatedAt: now })
					.where(eq(users.id, record.userId));

				await tx
					.update(passwordResetTokens)
					.set({ usedAt: now })
					.where(eq(passwordResetTokens.id, record.id));

				await tx
					.update(passwordResetTokens)
					.set({ usedAt: now })
					.where(
						and(
							eq(passwordResetTokens.userId, record.userId),
							isNull(passwordResetTokens.usedAt),
							ne(passwordResetTokens.id, record.id),
						),
					);
			});

			await insertAuditLog(
				"password_reset_completed",
				"user",
				record.userId,
				{
					ipAddress: null,
					userAgent: null,
				},
				record.userId,
			);

			input.logger?.info("Password reset completed", {
				userId: record.userId,
				email: record.email,
			});
		},
	};
}
