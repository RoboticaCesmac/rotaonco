import { auth } from "../src/lib/auth";

const [, , password] = process.argv;

async function main() {
	if (!password) {
		console.error("Uso: bun run scripts/hash-password.ts <senha>");
		process.exit(1);
	}

	const ctx = await auth.$context;
	const hashed = await ctx.password.hash(password);
	console.log(hashed);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
