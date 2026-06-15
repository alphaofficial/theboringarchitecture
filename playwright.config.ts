import { defineConfig, devices } from "@playwright/test";

const E2E_APP_URL = process.env.E2E_APP_URL ?? "http://localhost:3000";

export default defineConfig({
	testDir: "./test/integration/playwright",
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
});
