import "dotenv/config";

import { auth } from "../src/lib/auth";

const [,, email, newPassword] = process.argv;

async function main() {
	if (!email || !newPassword) {
		console.error("Uso: bun run scripts/set-password.ts <email> <nova-senha>");
		process.exit(1);
	}

	const ctx = await auth.$context;
	const internalAdapter = ctx.internalAdapter;
	const user = await internalAdapter.findUserByEmail(email.toLowerCase(), { includeAccounts: true });

	if (!user?.user?.id) {
		console.error("Usuário não encontrado");
		process.exit(1);
	}

	const hashed = await ctx.password.hash(newPassword);
	await internalAdapter.updatePassword(user.user.id, hashed, ctx as never);
	console.info(`Senha atualizada para ${email}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
