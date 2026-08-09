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
