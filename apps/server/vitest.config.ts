import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		setupFiles: ["./vitest.setup.ts"],
		env: {
			DATABASE_URL: process.env.DATABASE_URL ?? "mysql://root:password@127.0.0.1:3306/rotaonco_test",
			CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost",
			AUTH_SECRET: process.env.AUTH_SECRET ?? "test-auth-secret",
			EXPO_PROJECT_ID: process.env.EXPO_PROJECT_ID ?? "test-expo-project",
			EXPO_USERNAME: process.env.EXPO_USERNAME ?? "test",
			EXPO_PASSWORD: process.env.EXPO_PASSWORD ?? "test",
		},
	},
});
