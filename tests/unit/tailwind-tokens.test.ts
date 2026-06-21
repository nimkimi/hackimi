import { describe, it, expect } from 'vitest';
import resolveConfig from 'tailwindcss/resolveConfig';
import config from '../../tailwind.config';

// Regression guard for issue #3: a color token sharing a name with a Tailwind
// font-size key makes `.text-<name>` emit BOTH a font-size and a color. That bit
// us once (`text-base` → invisible Education headings). This invariant makes the
// collision structurally impossible: no custom color may reuse a font-size key.
describe('tailwind design tokens', () => {
  it('no color token collides with a font-size utility key', () => {
    const full = resolveConfig(config);
    const colorKeys = Object.keys(full.theme.colors);
    const fontSizeKeys = new Set(Object.keys(full.theme.fontSize));

    const collisions = colorKeys.filter((c) => fontSizeKeys.has(c));

    expect(collisions).toEqual([]);
  });
});
