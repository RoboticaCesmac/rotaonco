import "dotenv/config";

import { sql } from "drizzle-orm";

import { db } from "../src/db";
import { account } from "../src/db/schema/auth";

async function main() {
	const results = await db
		.select({ providerId: account.providerId, count: sql<number>`COUNT(*)` })
		.from(account)
		.groupBy(account.providerId)
		.orderBy(account.providerId);

	console.table(results);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
