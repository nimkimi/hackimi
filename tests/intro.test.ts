import { describe, it, expect } from 'vitest';
import { shouldPlayIntro, INTRO_KEY } from '../src/lib/intro';

const store = (seen: boolean) => ({ getItem: (k: string) => (seen && k === INTRO_KEY ? '1' : null) });

describe('shouldPlayIntro', () => {
  it('plays when not seen and motion allowed', () => {
    expect(shouldPlayIntro(store(false) as Storage, false)).toBe(true);
  });
  it('skips when already seen', () => {
    expect(shouldPlayIntro(store(true) as Storage, false)).toBe(false);
  });
  it('skips under reduced motion even if unseen', () => {
    expect(shouldPlayIntro(store(false) as Storage, true)).toBe(false);
  });
  it('exposes the storage key', () => {
    expect(INTRO_KEY).toBe('intro-seen');
  });
});
