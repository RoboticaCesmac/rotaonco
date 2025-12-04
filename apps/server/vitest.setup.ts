import { vi } from "vitest";

const globalRef = globalThis as unknown as {
	Bun?: {
		password?: {
			hash?: ReturnType<typeof vi.fn>;
			verify?: ReturnType<typeof vi.fn>;
		};
	};
};

if (!globalRef.Bun) {
	globalRef.Bun = {};
}

const password = globalRef.Bun.password ?? {};

if (typeof password.hash !== "function") {
	password.hash = vi.fn(async (input: string) => `hashed:${input}`);
}

if (typeof password.verify !== "function") {
	password.verify = vi.fn().mockResolvedValue(true);
}

globalRef.Bun.password = password;

process.env.DATABASE_URL ??= "mysql://root:password@127.0.0.1:3306/rotaonco_test";
process.env.CORS_ORIGIN ??= "http://localhost";
process.env.AUTH_SECRET ??= "test-auth-secret";
process.env.EXPO_PROJECT_ID ??= "test-expo-project";
process.env.EXPO_USERNAME ??= "test";
process.env.EXPO_PASSWORD ??= "test";

export {};
