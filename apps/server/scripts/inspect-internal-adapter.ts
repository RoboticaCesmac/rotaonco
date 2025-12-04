import { auth } from "../src/lib/auth";

async function main() {
	const ctx = await auth.$context;
	console.log("ctx keys", Object.keys(ctx));
	console.log("password ctx keys", Object.keys(ctx.password));
	const adapter = ctx.internalAdapter;
	console.log(Object.keys(adapter));
	console.log("updatePassword length", adapter.updatePassword?.length);
	console.log(String(adapter.updatePassword));
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
