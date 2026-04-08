const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
	testEnvironment: "node",
	displayName: "integration",
	testMatch: [
		"<rootDir>/requests/**/*.ts",
		"<rootDir>/scripts/**/*.spec.ts",
	],
	transform: {
		...tsJestTransformCfg,
	},
	passWithNoTests: true,
	// Integration suites share a single sqlite file (express_inertia_test.db),
	// so parallel workers race on cleanupAll and leak state across specs.
	maxWorkers: 1,
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/../../src/$1",
	},
	globalSetup: "<rootDir>/jestGlobalSetup.ts",
	globalTeardown: "<rootDir>/jestGlobalTeardown.ts",
	setupFilesAfterEnv: ["<rootDir>/jestTestsSetup.ts"],
};
