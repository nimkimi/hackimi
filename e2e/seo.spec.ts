import { test, expect } from '@playwright/test';

test.describe('redirects', () => {
  test('/projects permanently redirects to /work', async ({ request }) => {
    const res = await request.get('/projects', { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()['location']).toBe('/work');
  });

  test('/projects/anything redirects to /work', async ({ request }) => {
    const res = await request.get('/projects/old-page', { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()['location']).toBe('/work');
  });
});

test.describe('rendered metadata', () => {
  test('homepage title is the full name-led title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Nima Hakimi — Developer & AI Engineer');
  });

  test('homepage canonical points at apex', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://hackimi.dev');
  });

  test('footer carries the visible name line on every page', async ({ page }) => {
    for (const path of ['/', '/about', '/work']) {
      await page.goto(path);
      await expect(page.locator('footer')).toContainText('Nima Hakimi — Developer & AI Engineer');
    }
  });
});
