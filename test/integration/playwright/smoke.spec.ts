import { test, expect } from "@playwright/test";

test("node runtime meets the >= 22 requirement", () => {
	const major = Number.parseInt(process.versions.node.split(".")[0], 10);
	expect(major).toBeGreaterThanOrEqual(22);
});
