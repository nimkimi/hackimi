import { describe, expect, it } from 'vitest';

import robots from '@/app/robots';
import { SITE_URL } from '@/lib/site';

describe('robots', () => {
  it('allows all crawlers everything and points at the sitemap', () => {
    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: `${SITE_URL}/sitemap.xml`,
    });
  });
});
