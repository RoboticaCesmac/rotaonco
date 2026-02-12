import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "../db";
import { corsOrigin } from "./config";
import * as schema from "../db/schema/auth";

export const auth = betterAuth<BetterAuthOptions>({
	database: drizzleAdapter(db, {
		provider: "mysql",
		schema: schema,
	}),
	trustedOrigins: [...corsOrigin, "rotaonco://", "exp://"],
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