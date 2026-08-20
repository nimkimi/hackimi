import { describe, it, expect } from 'vitest';
import work, { type CaseStudy } from '../../src/data/work';

describe('work data', () => {
  it('has the five flagship slugs in display order', () => {
    // Order is deliberate: newest, strongest signal first (WorkRow numbers rows).
    expect(work.map((w) => w.slug)).toEqual([
      'sonari',
      'syncward',
      'dovetail',
      'concert-radar',
      'nav-event-registration',
    ]);
  });

  it('dovetail is a private personal tool: no outbound links', () => {
    const dovetail = work.find((w) => w.slug === 'dovetail');
    expect(dovetail).toBeDefined();
    expect(dovetail?.links ?? []).toEqual([]);
  });

  it('syncward is private pre-release: no outbound links, flagged in progress', () => {
    const syncward = work.find((w) => w.slug === 'syncward');
    expect(syncward?.inProgress).toBe(true);
    expect(syncward?.links ?? []).toEqual([]);
  });

  it('sonari links to its public GitHub repo', () => {
    const sonari = work.find((w) => w.slug === 'sonari');
    expect(sonari?.links?.map((l) => l.href)).toContain('https://github.com/nimkimi/sonari');
  });
  it('each case has required fields and the five ordered sections', () => {
    const req = ['Context', 'My role', 'Problem', 'Approach', 'Result'];
    work.forEach((c: CaseStudy) => {
      expect(c.title).toBeTruthy();
      expect(c.summary).toBeTruthy();
      expect(c.year).toBeTruthy();
      expect(c.tech.length).toBeGreaterThan(0);
      expect(c.sections.map((s) => s.heading)).toEqual(req);
      c.sections.forEach((s) => expect(s.body.length).toBeGreaterThan(40));
    });
  });
  it('slugs are unique', () => {
    expect(new Set(work.map((w) => w.slug)).size).toBe(work.length);
  });
});
