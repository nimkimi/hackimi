import { test, expect } from '@playwright/test';

test('home page loads with a title and visible body', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator('body')).toBeVisible();
});
