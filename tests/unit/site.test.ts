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

  it('SITE_TITLE is `${SITE_AUTHOR} — ${SITE_ROLE}` (em-dash form)', () => {
    expect(SITE_TITLE).toBe(`${SITE_AUTHOR} — ${SITE_ROLE}`);
    expect(SITE_ROLE).toBe('Developer & AI Engineer');
  });

  it('SITE_OG_IMAGE starts with SITE_URL', () => {
    expect(SITE_OG_IMAGE.startsWith(SITE_URL)).toBe(true);
  });

  it('OG image is the branded card; person image is the photo', async () => {
    const { SITE_OG_IMAGE, SITE_PERSON_IMAGE, SITE_URL } = await import('@/lib/site');
    expect(SITE_OG_IMAGE).toBe(`${SITE_URL}/og.png`);
    expect(SITE_PERSON_IMAGE).toBe(`${SITE_URL}/bigSmile.JPEG`);
  });

  it('social links are valid URLs', () => {
    Object.values(SITE_SOCIAL_LINKS).forEach((link) => {
      expect(() => new URL(link)).not.toThrow();
      expect(new URL(link).protocol).toBe('https:');
    });
  });

  it('social links include GitHub, LinkedIn and ORCID', () => {
    expect(Object.keys(SITE_SOCIAL_LINKS).sort()).toEqual(['github', 'linkedin', 'orcid']);
  });

  it('SITE_KEYWORDS is non-empty', () => {
    expect(SITE_KEYWORDS.length).toBeGreaterThan(0);
  });

  it('keywords carry the new positioning, not "Frontend"', () => {
    expect(SITE_KEYWORDS).toContain('AI Engineer');
    expect(SITE_KEYWORDS.join(' ')).not.toMatch(/frontend/i);
  });
});
