import { describe, it, expect } from 'vitest';
import about from '../../src/data/about';

// Observed language proficiency values in the data are 2 and 5, so the scale is
// assumed to be 1–5 (a Likert-style rating). Each proficiency is asserted to be
// a positive number within these observed bounds.
const PROFICIENCY_MIN = 1;
const PROFICIENCY_MAX = 5;

describe('about data — required scalar fields', () => {
  it('name, location, photo, and summary are present and non-empty', () => {
    expect(typeof about.name).toBe('string');
    expect(about.name.length).toBeGreaterThan(0);
    expect(typeof about.location).toBe('string');
    expect(about.location.length).toBeGreaterThan(0);
    expect(typeof about.photo).toBe('string');
    expect(about.photo.length).toBeGreaterThan(0);
    expect(typeof about.summary).toBe('string');
    expect(about.summary.length).toBeGreaterThan(0);
  });
});

describe('about data — required arrays are non-empty', () => {
  it('experience is a non-empty array', () => {
    expect(Array.isArray(about.experience)).toBe(true);
    expect(about.experience.length).toBeGreaterThan(0);
  });
  it('education is a non-empty array', () => {
    expect(Array.isArray(about.education)).toBe(true);
    expect(about.education.length).toBeGreaterThan(0);
  });
  it('skills.technical is a non-empty array', () => {
    expect(Array.isArray(about.skills.technical)).toBe(true);
    expect(about.skills.technical.length).toBeGreaterThan(0);
  });
  it('skills.personal is a non-empty array', () => {
    expect(Array.isArray(about.skills.personal)).toBe(true);
    expect(about.skills.personal.length).toBeGreaterThan(0);
  });
  it('interests is a non-empty array', () => {
    expect(Array.isArray(about.interests)).toBe(true);
    expect(about.interests.length).toBeGreaterThan(0);
  });
  it('languages is a non-empty array', () => {
    expect(Array.isArray(about.languages)).toBe(true);
    expect(about.languages.length).toBeGreaterThan(0);
  });
  it('profiles is a non-empty array', () => {
    expect(Array.isArray(about.profiles)).toBe(true);
    expect(about.profiles.length).toBeGreaterThan(0);
  });
});

describe('about data — language proficiency', () => {
  about.languages.forEach((lang) => {
    it(`"${lang.name}" proficiency is a positive number within ${PROFICIENCY_MIN}–${PROFICIENCY_MAX}`, () => {
      expect(typeof lang.proficiency).toBe('number');
      expect(lang.proficiency).toBeGreaterThan(0);
      expect(lang.proficiency).toBeGreaterThanOrEqual(PROFICIENCY_MIN);
      expect(lang.proficiency).toBeLessThanOrEqual(PROFICIENCY_MAX);
    });
  });
});

describe('about data — profiles', () => {
  about.profiles.forEach((profile) => {
    it(`profile "${profile.platform}" has a platform string and a valid URL`, () => {
      expect(typeof profile.platform).toBe('string');
      expect(profile.platform.length).toBeGreaterThan(0);
      expect(() => new URL(profile.url)).not.toThrow();
    });
  });
});
