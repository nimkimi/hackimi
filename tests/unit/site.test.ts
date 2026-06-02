import { describe, it, expect } from 'vitest';
import {
  SITE_URL,
  SITE_AUTHOR,
  SITE_ROLE,
  SITE_TITLE,
  SITE_KEYWORDS,
  SITE_SOCIAL_LINKS,
  SITE_OG_IMAGE,
} from '@/lib/site';

describe('site constants', () => {
  it('SITE_URL is a valid https URL', () => {
    const url = new URL(SITE_URL);
    expect(url.protocol).toBe('https:');
  });

  it('SITE_TITLE is `${SITE_AUTHOR} | ${SITE_ROLE}`', () => {
    expect(SITE_TITLE).toBe(`${SITE_AUTHOR} | ${SITE_ROLE}`);
  });

  it('SITE_OG_IMAGE starts with SITE_URL', () => {
    expect(SITE_OG_IMAGE.startsWith(SITE_URL)).toBe(true);
  });

  it('social links are valid URLs', () => {
    Object.values(SITE_SOCIAL_LINKS).forEach((link) => {
      expect(() => new URL(link)).not.toThrow();
      expect(new URL(link).protocol).toBe('https:');
    });
  });

  it('SITE_KEYWORDS is non-empty', () => {
    expect(SITE_KEYWORDS.length).toBeGreaterThan(0);
  });
});
