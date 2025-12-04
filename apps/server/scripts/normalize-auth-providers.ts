import "dotenv/config";

import { drizzle } from "drizzle-orm/mysql2";
import { inArray } from "drizzle-orm";
import { createPool } from "mysql2/promise";

import { account } from "../src/db/schema/auth";

async function main() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error("DATABASE_URL environment variable is not defined");
	}

	const pool = createPool({
		uri: databaseUrl,
	});

	const db = drizzle(pool);

	const result = await db
		.update(account)
		.set({ providerId: "credential" })
		.where(inArray(account.providerId, ["email", "email-password", "password"]));

	const affectedRows = "affectedRows" in result ? result.affectedRows : undefined;
	console.info(`✅ Atualizados ${affectedRows ?? 0} registros na tabela account.`);

	await pool.end();
}

main().catch((error) => {
	console.error("❌ Falha ao normalizar provedores de login", error);
	process.exit(1);
});
