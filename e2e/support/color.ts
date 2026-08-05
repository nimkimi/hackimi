// Pure colour-math helpers shared by `e2e/accent-contrast.spec.ts` and its
// Vitest unit tests (`tests/unit/color.test.ts`). Kept dependency-free so the
// unit test can exercise the parsing/threshold logic directly, in Node,
// without a browser — the Playwright spec only supplies the raw
// `getComputedStyle(node).color` string.

/**
 * Parses a CSS color string (e.g. `rgb(14, 14, 16)` or `rgba(14, 14, 16,
 * 0.5)`) into its three colour channels, dropping any alpha channel — this
 * is a foreground-colour check, so opacity is irrelevant to how dark the
 * text reads.
 *
 * Throws if the string does not contain at least 3 numeric channels (an
 * empty string, `'transparent'`, or any other keyword/degenerate value).
 * A silent empty-array result here previously fed `Math.max(...[])` ===
 * `-Infinity`, which is always `< 80` — the accent-contrast guard was
 * passing on no data. See `maxChannel` below for the second half of that
 * fix.
 */
export function parseColorChannels(color: string): number[] {
  const matches = color.match(/\d+(\.\d+)?/g) || [];
  const channels = matches.slice(0, 3).map(Number);

  if (channels.length !== 3 || channels.some((c) => !Number.isFinite(c))) {
    throw new Error(
      `parseColorChannels: expected 3 numeric colour channels, got ${channels.length} from ${JSON.stringify(color)}`
    );
  }

  return channels;
}

/**
 * Largest of the three channels — used to assert text reads as genuinely
 * dark (every channel low) rather than the light `ink` fallback.
 *
 * Throws on an empty array instead of silently returning `-Infinity`
 * (`Math.max()` with no arguments). In practice `parseColorChannels` never
 * hands this an empty array — it throws first — so this is defence in
 * depth: the `-Infinity`-passes-every-`< 80` footgun cannot resurface even
 * if a future caller skips `parseColorChannels`.
 */
export function maxChannel(channels: number[]): number {
  if (channels.length === 0) {
    throw new Error('maxChannel: cannot compute the max of an empty channel array');
  }
  return Math.max(...channels);
}

// sRGB relative luminance + WCAG contrast ratio.
export function relLuminance([r, g, b]: number[]): number {
  const lin = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function contrast(fg: number[], bg: number[]): number {
  const l1 = relLuminance(fg);
  const l2 = relLuminance(bg);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
