import { describe, expect, it } from 'vitest';
import { contrast, maxChannel, parseColorChannels, relLuminance } from '../../e2e/support/color';

// Regression guard for the vacuous accent-contrast assertion (issue #B): when
// `getComputedStyle(node).color` yields fewer than 3 numeric channels, the
// old inline parse silently produced `[]`, and `Math.max(...[])` is
// `-Infinity` — which is `< 80`, so the Playwright guard passed on no data at
// all. `parseColorChannels`/`maxChannel` must fail loudly instead.

describe('parseColorChannels', () => {
  it('parses a valid rgb() string into its three channels', () => {
    expect(parseColorChannels('rgb(14, 14, 16)')).toEqual([14, 14, 16]);
  });

  it('drops the alpha channel from a 4-channel rgba() string', () => {
    // A foreground-colour check cares how dark the text reads, not its
    // opacity, so slicing the alpha channel off is correct here (not a bug).
    expect(parseColorChannels('rgba(198, 255, 61, 0.5)')).toEqual([198, 255, 61]);
  });

  it('rejects an empty string instead of silently returning no channels', () => {
    expect(() => parseColorChannels('')).toThrow(/expected 3 numeric colour channels/);
  });

  it('rejects the "transparent" keyword, which has no numeric channels', () => {
    expect(() => parseColorChannels('transparent')).toThrow(/transparent/);
  });

  it('rejects a string with fewer than 3 numeric channels', () => {
    expect(() => parseColorChannels('rgb(14, 16)')).toThrow(/expected 3 numeric colour channels/);
  });
});

describe('maxChannel', () => {
  it('returns the largest of the three channels', () => {
    expect(maxChannel([14, 200, 61])).toBe(200);
  });

  it('rejects an empty channel array instead of silently returning -Infinity', () => {
    // This is the exact footgun: Math.max(...[]) === -Infinity, and
    // -Infinity < 80 is true, so the old guard passed with zero data.
    expect(() => maxChannel([])).toThrow(/empty channel array/);
  });
});

describe('relLuminance / contrast', () => {
  it('computes a contrast ratio of 1 for identical colours', () => {
    expect(contrast([100, 100, 100], [100, 100, 100])).toBeCloseTo(1, 5);
  });

  it('computes the WCAG contrast ratio for dark text on the lime accent', () => {
    const dark = [14, 14, 16];
    const accent = [198, 255, 61];
    expect(contrast(dark, accent)).toBeGreaterThanOrEqual(4.5);
  });
});
