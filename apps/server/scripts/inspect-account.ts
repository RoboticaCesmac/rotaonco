import "dotenv/config";

import { eq } from "drizzle-orm";

import { db } from "../src/db";
import { account, user } from "../src/db/schema/auth";

const email = process.argv[2];

async function main() {
	if (!email) {
		throw new Error("Informe o e-mail: bun run scripts/inspect-account.ts <email>");
	}

	const result = await db
		.select({
			userId: account.userId,
			accountId: account.accountId,
			providerId: account.providerId,
			password: account.password,
			createdAt: account.createdAt,
			updatedAt: account.updatedAt,
		})
		.from(account)
		.innerJoin(user, eq(user.id, account.userId))
		.where(eq(user.email, email.trim().toLowerCase()));

	console.dir(result, { depth: null });
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
