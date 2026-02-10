import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "../db";
import * as schema from "../db/schema/auth";

const envOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];

export const auth = betterAuth<BetterAuthOptions>({
	database: drizzleAdapter(db, {
		provider: "mysql",
		schema: schema,
	}),
	trustedOrigins: [...envOrigins, "mybettertapp://", "exp://"],
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		disableCheckOrigin: true,
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
	plugins: [expo()],
});