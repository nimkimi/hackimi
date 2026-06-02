import { describe, expect, it } from 'vitest';

import { GET } from '@/app/robots.txt/route';

describe('robots.txt GET', () => {
  it('returns a Response', () => {
    expect(GET()).toBeInstanceOf(Response);
  });

  it('serves the expected robots directives in the body', async () => {
    const body = await GET().text();
    expect(body).toContain('User-agent: *');
    expect(body).toContain('Allow: /');
    expect(body).toContain('Sitemap: https://hackimi.dev/sitemap.xml');
  });

  it('sets the text/plain content type and a cache header', () => {
    const res = GET();
    expect(res.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=86400');
  });
});
