import { test, expect } from '@playwright/test';

test.describe('Pixel Punch Card', () => {
  test('should display login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Pixel Punch Card')).toBeVisible();
    await expect(page.getByText('Sign in with Google')).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Pixel Punch Card/);
  });

  // Note: Full E2E tests require Supabase test environment setup
  // These are example tests showing the structure
  // Real tests would mock authentication or use test credentials
});
