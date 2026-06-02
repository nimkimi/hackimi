import { describe, it, expect } from 'vitest';
import { shouldPlayIntro } from '../../src/lib/intro';

describe('shouldPlayIntro', () => {
  it('plays on every load when motion is allowed', () => {
    expect(shouldPlayIntro(false)).toBe(true);
  });
  it('skips under reduced motion', () => {
    expect(shouldPlayIntro(true)).toBe(false);
  });
});
