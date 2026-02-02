import { randomUUID } from "crypto";
import { createHash } from "crypto";
import { sendPasswordResetEmail } from "../lib/email";
import type { Logger } from "../lib/logger";

export class PasswordResetError extends Error {
	constructor(
		public code: string,
		message: string,
	) {
		super(message);
		this.name = "PasswordResetError";
	}
}

export interface PasswordResetService {
	requestReset(input: {
		email: string;
		ipAddress: string | undefined;
		userAgent: string | undefined;
		logger?: Logger;
	}): Promise<void>;
	validateToken(token: string): Promise<void>;
	confirmReset(input: {
		token: string;
		password: string;
		logger?: Logger;
	}): Promise<void>;
}

export function createPasswordResetService(): PasswordResetService {
	return {
		async requestReset(input) {
			// For now, this is a stub implementation
			// In a production app, you would:
			// 1. Look up the user by email
			// 2. Generate a reset token
			// 3. Hash and store it in passwordResetTokens table
			// 4. Send email with reset link
			// 5. Log the request for audit purposes

			input.logger?.info("Password reset requested", {
				email: input.email,
				ipAddress: input.ipAddress,
			});

			// Simulate email sending
			// In production, use resend or nodemailer
			// await sendEmail({
			//   to: input.email,
			//   subject: 'Reset your password',
			//   html: `Click here to reset: ...`
			// });
		},

		async validateToken(token) {
			// For now, this is a stub implementation
			// In a production app, you would:
			// 1. Hash the token
			// 2. Look it up in passwordResetTokens table
			// 3. Check if it's expired
			// 4. Check if it's already been used
			// 5. Throw PasswordResetError if invalid

			if (!token) {
				throw new PasswordResetError("INVALID_TOKEN", "Token inválido ou expirado");
			}
		},

		async confirmReset(input) {
			// For now, this is a stub implementation
			// In a production app, you would:
			// 1. Validate the token using validateToken()
			// 2. Hash the new password
			// 3. Update the user's password
			// 4. Mark the token as used
			// 5. Log the action for audit purposes

			input.logger?.info("Password reset confirmed", {
				token: input.token?.substring(0, 10),
			});
		},
	};
}
