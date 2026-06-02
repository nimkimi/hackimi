import { describe, it, expect } from 'vitest';
import work, { type CaseStudy } from '../../src/data/work';

describe('work data', () => {
  it('has the three flagship slugs', () => {
    expect(work.map((w) => w.slug).sort()).toEqual(['be-my-guide', 'concert-radar', 'nav-event-registration'].sort());
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
