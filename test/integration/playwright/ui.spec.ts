import { expect, test } from '@playwright/test';

test('home page renders the public marketing surface', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByTestId('hero-section')).toBeVisible();
	await expect(page.getByTestId('install-card')).toBeVisible();
	await expect(page.getByTestId('site-logo')).toBeVisible();
	await expect(page.getByRole('link', { name: 'View on GitHub' })).toBeVisible();
});

test('guest access to protected routes redirects to login', async ({ page }) => {
	await page.goto('/about');

	await expect(page).toHaveURL(/\/login$/);
	await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});

test('register flow creates a user and redirects to verify email', async ({ page }) => {
	const email = `playwright-${Date.now()}@example.com`;

	await page.goto('/register');
	await page.getByLabel('Full name').fill('Playwright User');
	await page.getByLabel('Email address').fill(email);
	await page.getByLabel('Password', { exact: true }).fill('password123');
	await page.getByLabel('Confirm password', { exact: true }).fill('password123');
	await page.getByRole('button', { name: 'Create account' }).click();

	await expect(page).toHaveURL(/\/verify-email$/);
	await expect(page.getByText(email)).toBeVisible();
});
