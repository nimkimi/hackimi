import { describe, expect, it } from 'vitest';

import sitemap from '@/app/sitemap';
import work from '@/data/work';

const BASE_URL = 'https://hackimi.dev';
const STATIC_ROUTES = ['/', '/about', '/work', '/contact'];

describe('sitemap', () => {
  it('returns an entry for each static route plus one per work slug', () => {
    const entries = sitemap();
    expect(entries).toHaveLength(STATIC_ROUTES.length + work.length);
  });

  it("uses the bare base URL (no trailing slash) and priority 1 for '/'", () => {
    const root = sitemap().find((e) => e.url === BASE_URL);
    expect(root).toBeDefined();
    expect(root?.url).toBe('https://hackimi.dev');
    expect(root?.priority).toBe(1);
  });

  it('uses the full path and priority 0.6 for a non-root route', () => {
    const about = sitemap().find((e) => e.url === `${BASE_URL}/about`);
    expect(about).toBeDefined();
    expect(about?.url).toBe('https://hackimi.dev/about');
    expect(about?.priority).toBe(0.6);
  });

  it('includes every work slug as /work/<slug>', () => {
    const urls = new Set(sitemap().map((e) => e.url));
    for (const c of work) {
      expect(urls).toContain(`${BASE_URL}/work/${c.slug}`);
    }
  });

  it("gives every entry changeFrequency 'monthly' and a lastModified Date", () => {
    for (const entry of sitemap()) {
      expect(entry.changeFrequency).toBe('monthly');
      expect(entry.lastModified).toBeInstanceOf(Date);
    }
  });
});
