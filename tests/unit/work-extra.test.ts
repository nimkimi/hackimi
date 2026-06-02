import { describe, it, expect } from 'vitest';
import work, { type CaseStudy } from '../../src/data/work';

const ORDER = ['Context', 'My role', 'Problem', 'Approach', 'Result'];

describe('work data — images', () => {
  const withImages = work.filter((c) => c.images && c.images.length > 0);

  it('has at least one case with images', () => {
    expect(withImages.length).toBeGreaterThan(0);
  });

  withImages.forEach((c: CaseStudy) => {
    it(`"${c.slug}" image src/alt are valid and a cover exists`, () => {
      const images = c.images!;
      expect(images.length).toBeGreaterThan(0);
      images.forEach((img) => {
        expect(typeof img.src).toBe('string');
        expect(img.src.length).toBeGreaterThan(0);
        expect(img.src.startsWith('/')).toBe(true);
        expect(typeof img.alt).toBe('string');
        expect(img.alt.length).toBeGreaterThan(0);
      });
      // First image acts as the cover — assert it exists.
      const cover = images[0];
      expect(cover).toBeDefined();
      expect(cover.src.startsWith('/')).toBe(true);
    });
  });
});

describe('work data — links', () => {
  const withLinks = work.filter((c) => c.links && c.links.length > 0);

  withLinks.forEach((c: CaseStudy) => {
    it(`"${c.slug}" links have non-empty labels and valid URLs`, () => {
      c.links!.forEach((link) => {
        expect(typeof link.label).toBe('string');
        expect(link.label.length).toBeGreaterThan(0);
        // Throws if href is not a valid absolute URL.
        expect(() => new URL(link.href)).not.toThrow();
      });
    });
  });
});

describe('work data — section heading order contract', () => {
  // The dev-time guard in work.ts is not separately importable, so we assert the
  // ORDER contract holds for every real case (the guard runs at import time and
  // would have thrown otherwise — this characterizes the same invariant).
  work.forEach((c: CaseStudy) => {
    it(`"${c.slug}" section headings deep-equal the ORDER`, () => {
      expect(c.sections.map((s) => s.heading)).toEqual(ORDER);
    });
  });

  it('the guard logic throws when headings drift from the ORDER', () => {
    // Replicates the guard in work.ts against a CaseStudy-like object with a
    // wrong heading order, proving the drift detection fires.
    const bad = {
      slug: 'drift',
      sections: [
        { heading: 'My role', body: 'x' },
        { heading: 'Context', body: 'x' },
        { heading: 'Problem', body: 'x' },
        { heading: 'Approach', body: 'x' },
        { heading: 'Result', body: 'x' },
      ],
    };
    const guard = (c: { slug: string; sections: { heading: string }[] }) => {
      if (c.sections.map((s) => s.heading).join('|') !== ORDER.join('|')) {
        throw new Error(`Case "${c.slug}" sections must be: ${ORDER.join(', ')}`);
      }
    };
    expect(() => guard(bad)).toThrow(/sections must be/);
    // Sanity: a correctly-ordered object does not throw.
    expect(() =>
      guard({ slug: 'ok', sections: ORDER.map((h) => ({ heading: h })) })
    ).not.toThrow();
  });
});

describe('work data — inProgress flag', () => {
  work
    .filter((c) => c.inProgress !== undefined)
    .forEach((c: CaseStudy) => {
      it(`"${c.slug}" inProgress is a boolean`, () => {
        expect(typeof c.inProgress).toBe('boolean');
      });
    });
});
