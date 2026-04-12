import { test, expect } from "@playwright/test";

const E2E_USER = {
	name: "E2E User",
	email: `e2e_${Date.now()}@example.com`,
	password: "password123",
};

test.describe("Auth UI flows", () => {
	test.beforeEach(async ({ context }) => {
		await context.clearCookies();
	});

	test("home page redirects unauthenticated users to login", async ({ page }) => {
		await page.goto("/");
		// The public home page should be accessible
		await expect(page).toHaveURL("/");
		await expect(page.locator("body")).toBeVisible();
	});

	test("login page renders the sign-in form", async ({ page }) => {
		await page.goto("/login");
		await expect(page.locator("#email")).toBeVisible();
		await expect(page.locator("#password")).toBeVisible();
		await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
	});

	test("register page renders the create account form", async ({ page }) => {
		await page.goto("/register");
		await expect(page.locator("#name")).toBeVisible();
		await expect(page.locator("#email")).toBeVisible();
		await expect(page.locator("#password")).toBeVisible();
		await expect(page.locator("#password_confirmation")).toBeVisible();
		await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
	});

	test("register flow creates an account and redirects to verify-email", async ({ page }) => {
		await page.goto("/register");
		await page.waitForLoadState("networkidle");

		await page.locator("#name").fill(E2E_USER.name);
		await page.locator("#email").fill(E2E_USER.email);
		await page.locator("#password").fill(E2E_USER.password);
		await page.locator("#password_confirmation").fill(E2E_USER.password);

		await page.getByRole("button", { name: /create account/i }).click();
		await page.waitForURL("/verify-email", { timeout: 15_000 });
	});

	test("login with valid credentials redirects to home", async ({ page }) => {
		// The user was registered in the previous test; log in with the same credentials
		await page.goto("/login");
		await page.waitForLoadState("networkidle");

		await page.locator("#email").fill(E2E_USER.email);
		await page.locator("#password").fill(E2E_USER.password);

		await page.getByRole("button", { name: /sign in/i }).click();
		// After login, redirect to /home or /verify-email (email not yet verified)
		await page.waitForURL(/\/(home|verify-email)/, { timeout: 15_000 });
	});

	test("login with invalid credentials shows an error", async ({ page }) => {
		await page.goto("/login");
		await page.locator("#email").fill("wrong@example.com");
		await page.locator("#password").fill("wrongpassword");
		await page.getByRole("button", { name: /sign in/i }).click();

		// Error message should appear on the login page
		await expect(page.locator("p.text-red-600")).toBeVisible({ timeout: 10_000 });
		await expect(page).toHaveURL("/login");
	});

	test("/home redirects unauthenticated users to /login", async ({ page }) => {
		await page.goto("/home");
		await expect(page).toHaveURL("/login", { timeout: 10_000 });
	});

	test("forgot password page renders the email form", async ({ page }) => {
		await page.goto("/forgot-password");
		await expect(page.locator("#email")).toBeVisible();
		await expect(page.getByRole("button", { name: /send reset link/i })).toBeVisible();
	});
});
