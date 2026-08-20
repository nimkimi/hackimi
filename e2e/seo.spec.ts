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

  test('child-page canonical points at its own apex URL', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://hackimi.dev/about');
  });

  test('footer carries the visible name line on every page', async ({ page }) => {
    for (const path of ['/', '/about', '/work']) {
      await page.goto(path);
      await expect(page.locator('footer')).toContainText('Nima Hakimi — Developer & AI Engineer');
    }
  });

  test('favicon links are emitted', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute('href', /icon/);
  });

  test('og image resolves to a real asset', async ({ page, request }) => {
    await page.goto('/');
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(og).toContain('/og.png');
    const res = await request.get('/og.png');
    expect(res.status()).toBe(200);
  });
});

test.describe('structured data', () => {
  async function ldTypes(page: import('@playwright/test').Page) {
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    return blocks.map((b) => JSON.parse(b)['@type']);
  }

  test('every page carries Person + WebSite; about and case pages add their own', async ({ page }) => {
    await page.goto('/');
    expect((await ldTypes(page)).sort()).toEqual(['Person', 'WebSite']);

    await page.goto('/about');
    expect((await ldTypes(page)).sort()).toEqual(['Person', 'ProfilePage', 'WebSite']);

    await page.goto('/work/sonari');
    expect((await ldTypes(page)).sort()).toEqual(['BreadcrumbList', 'Person', 'WebSite']);
  });

  test('an unknown route serves the on-brand 404 with a real 404 status', async ({ page }) => {
    const response = await page.goto('/work/does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'This page doesn’t exist.' })).toBeVisible();
  });

  test('the removed be-my-guide case 308s to /work instead of 404ing', async ({ page }) => {
    const resp = await page.request.get('/work/be-my-guide', { maxRedirects: 0 });
    expect(resp.status()).toBe(308);
    expect(resp.headers()['location']).toBe('/work');
  });
});
