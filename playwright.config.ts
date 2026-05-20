import { defineConfig, devices } from "@playwright/test";
import { E2E_APP_URL, E2E_DB_PATH, E2E_PORT } from "./test/integration/playwright/env";

export default defineConfig({
	testDir: "./test/integration/playwright",
	globalSetup: "./test/integration/playwright/globalSetup.ts",
	globalTeardown: "./test/integration/playwright/globalTeardown.ts",
	use: {
		baseURL: E2E_APP_URL,
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: 'tsx test/integration/playwright/start-server.ts',
		port: E2E_PORT,
		reuseExistingServer: false,
		timeout: 30_000,
	},
});
