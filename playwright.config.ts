import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./test/integration/playwright",
	globalSetup: "./test/integration/playwright/globalSetup.ts",
	globalTeardown: "./test/integration/playwright/globalTeardown.ts",
	use: {
		baseURL: "http://localhost:3002",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command:
			"DB_PATH=express_inertia_e2e.db PORT=3002 NODE_ENV=test tsx src/index.ts",
		port: 3002,
		reuseExistingServer: false,
		timeout: 30_000,
	},
});
