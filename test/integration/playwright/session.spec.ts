import { test, expect } from "@playwright/test";

test.describe("Session authentication", () => {
	test("register grants a session that survives navigation and dies on logout", async ({ page }) => {
		const email = `e2e-session-${Date.now()}@test.com`;
		const password = "password123";

		// Register via the real form.
		await page.goto("/register");
		await page.fill('input[name="name"]', "E2E Session");
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', password);
		await page.fill('input[name="password_confirmation"]', password);
		await page.click('button[type="submit"]');

		// Successful register authenticates and redirects to /verify-email.
		await page.waitForURL(/\/verify-email/);

		// Session cookie must now let us reach a protected route.
		await page.goto("/home");
		await expect(page).toHaveURL("/home");
		await expect(page.getByRole("heading", { name: "User Information" })).toBeVisible();
		await expect(page.getByText(email)).toBeVisible();

		// Log out. page.request shares the browser context's cookies,
		// so the Set-Cookie on the response will drop the session cookie.
		const logoutResp = await page.request.post("/logout");
		expect(logoutResp.ok()).toBeTruthy();

		// Protected route must now redirect to /login.
		await page.goto("/home");
		await page.waitForURL(/\/login/);
	});

	test("POST /login from a foreign Origin is rejected by CSRF middleware", async ({ request }) => {
		const resp = await request.post("/login", {
			headers: { Origin: "https://evil.example.com" },
			form: { email: "x@example.com", password: "y" },
			maxRedirects: 0,
		});
		expect(resp.status()).toBe(403);
	});
});
