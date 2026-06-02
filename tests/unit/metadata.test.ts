import { describe, it, expect } from 'vitest';
import {
  buildRootMetadata,
  buildPageMetadata,
  buildPersonJsonLd,
  resolveUrl,
  METADATA_BASE,
} from '@/lib/metadata';
import {
  SITE_URL,
  SITE_AUTHOR,
  SITE_ROLE,
  SITE_TITLE,
  SITE_KEYWORDS,
  SITE_EMAIL,
  SITE_EMPLOYER,
  SITE_OG_IMAGE,
  SITE_SOCIAL_LINKS,
} from '@/lib/site';

describe('resolveUrl', () => {
  it("'/' resolves to SITE_URL", () => {
    expect(resolveUrl('/')).toBe(SITE_URL);
  });

  it('undefined resolves to SITE_URL', () => {
    expect(resolveUrl(undefined)).toBe(SITE_URL);
  });

  it('SITE_URL passed in resolves to SITE_URL', () => {
    expect(resolveUrl(SITE_URL)).toBe(SITE_URL);
  });

  it("relative 'work' resolves to `${SITE_URL}/work`", () => {
    expect(resolveUrl('work')).toBe(`${SITE_URL}/work`);
  });

  it("'/work' resolves to `${SITE_URL}/work`", () => {
    expect(resolveUrl('/work')).toBe(`${SITE_URL}/work`);
  });
});

describe('buildPageMetadata', () => {
  it('top-level title is the bare title; og/twitter title has the author suffix', () => {
    const meta = buildPageMetadata({ title: 'Work', description: 'desc' });
    expect(meta.title).toBe('Work');
    expect(meta.openGraph?.title).toBe(`Work | ${SITE_AUTHOR}`);
    expect(meta.twitter?.title).toBe(`Work | ${SITE_AUTHOR}`);
  });

  it('canonical = resolveUrl(path) and openGraph.url = canonical', () => {
    const meta = buildPageMetadata({ title: 'Work', description: 'desc', path: '/work' });
    const expected = resolveUrl('/work');
    expect(meta.alternates?.canonical).toBe(expected);
    expect(meta.openGraph?.url).toBe(expected);
  });

  it('defaults canonical to SITE_URL when path omitted', () => {
    const meta = buildPageMetadata({ title: 'Home', description: 'desc' });
    expect(meta.alternates?.canonical).toBe(SITE_URL);
  });

  describe('og image', () => {
    it('no ogImage -> default image (1200x630, SITE_OG_IMAGE)', () => {
      const meta = buildPageMetadata({ title: 'T', description: 'd' });
      const img = (meta.openGraph as any).images[0];
      expect(img.url).toBe(SITE_OG_IMAGE);
      expect(img.width).toBe(1200);
      expect(img.height).toBe(630);
      expect(meta.twitter?.images).toEqual([SITE_OG_IMAGE]);
    });

    it('string ogImage -> that url with default dims and generated alt', () => {
      const meta = buildPageMetadata({
        title: 'T',
        description: 'd',
        ogImage: 'https://example.com/custom.png',
      });
      const img = (meta.openGraph as any).images[0];
      expect(img.url).toBe('https://example.com/custom.png');
      expect(img.width).toBe(1200);
      expect(img.height).toBe(630);
      expect(img.alt).toBe(`${SITE_AUTHOR} portfolio image`);
      expect(meta.twitter?.images).toEqual(['https://example.com/custom.png']);
    });

    it('object ogImage merges, with object overriding defaults', () => {
      const meta = buildPageMetadata({
        title: 'T',
        description: 'd',
        ogImage: { url: 'https://example.com/o.png', width: 800, alt: 'custom alt' },
      });
      const img = (meta.openGraph as any).images[0];
      expect(img.url).toBe('https://example.com/o.png');
      expect(img.width).toBe(800); // overrides default 1200
      expect(img.height).toBe(630); // default retained
      expect(img.alt).toBe('custom alt'); // overrides default alt
    });
  });

  describe('keywords', () => {
    it('no extra keywords -> default keywords', () => {
      const meta = buildPageMetadata({ title: 'T', description: 'd' });
      expect(meta.keywords).toEqual([...SITE_KEYWORDS]);
    });

    it('extra keywords -> union of defaults + extra with no duplicates', () => {
      const meta = buildPageMetadata({
        title: 'T',
        description: 'd',
        keywords: ['Next.js', 'TypeScript'], // 'Next.js' is already a default
      });
      const result = meta.keywords as string[];
      expect(result).toEqual([...SITE_KEYWORDS, 'TypeScript']);
      expect(new Set(result).size).toBe(result.length); // no duplicates
    });
  });
});

describe('buildRootMetadata', () => {
  it('metadataBase is a URL of SITE_URL', () => {
    const meta = buildRootMetadata();
    expect(meta.metadataBase).toBeInstanceOf(URL);
    expect(meta.metadataBase?.toString()).toBe(new URL(SITE_URL).toString());
    expect(METADATA_BASE).toBeInstanceOf(URL);
  });

  it('title.default = SITE_TITLE and title.template includes SITE_AUTHOR', () => {
    const meta = buildRootMetadata();
    const title = meta.title as { default: string; template: string };
    expect(title.default).toBe(SITE_TITLE);
    expect(title.template).toContain(SITE_AUTHOR);
  });

  it('openGraph and twitter are present', () => {
    const meta = buildRootMetadata();
    expect(meta.openGraph).toBeDefined();
    expect(meta.twitter).toBeDefined();
  });
});

describe('buildPersonJsonLd', () => {
  it('builds the expected Person schema', () => {
    const ld = buildPersonJsonLd();
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('Person');
    expect(ld.name).toBe(SITE_AUTHOR);
    expect(ld.url).toBe(SITE_URL);
    expect(ld.jobTitle).toBe(SITE_ROLE);
    expect(ld.worksFor.name).toBe(SITE_EMPLOYER.name);
    expect(ld.email).toBe(`mailto:${SITE_EMAIL}`);
    expect(ld.sameAs).toEqual([SITE_SOCIAL_LINKS.github, SITE_SOCIAL_LINKS.linkedin]);
  });
});
