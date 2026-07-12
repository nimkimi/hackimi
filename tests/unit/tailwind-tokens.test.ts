import { describe, it, expect } from 'vitest';
import defaultTheme from 'tailwindcss/defaultTheme';
import defaultColors from 'tailwindcss/colors';
import config from '../../tailwind.config';

// Regression guard for issue #3: a color token sharing a name with a Tailwind
// font-size key makes `.text-<name>` emit BOTH a font-size and a color. That bit
// us once (`text-base` → invisible Education headings). This invariant makes the
// collision structurally impossible: no custom color may reuse a font-size key.
//
// Tailwind v4 dropped the `tailwindcss/resolveConfig` JS API used here, so the
// merged theme is reconstructed from the same default modules the old resolver
// read internally. That's equivalent because tailwind.config.ts only *extends*
// colors/fontSize — it never overrides theme.colors or theme.fontSize.
describe('tailwind design tokens', () => {
  it('no color token collides with a font-size utility key', () => {
    const colorKeys = new Set([
      ...Object.keys(defaultColors),
      ...Object.keys(config.theme?.extend?.colors ?? {}),
    ]);
    const fontSizeKeys = new Set([
      ...Object.keys(defaultTheme.fontSize),
      ...Object.keys(config.theme?.extend?.fontSize ?? {}),
    ]);

    const collisions = [...colorKeys].filter((c) => fontSizeKeys.has(c));

    expect(collisions).toEqual([]);
  });
});
