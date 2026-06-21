import { test, expect } from '@playwright/test';

// Regression guard for the "unreadable Education headings" bug: the degree /
// institution <h3>s were styled `text-base`, which — because the palette defines
// a `base` color AND `base` is Tailwind's default font-size key — emitted BOTH a
// font-size and `color: #0E0E10` (the page background). `sm:text-lg` overrode the
// size but not the color, leaving the headings black-on-near-black (invisible).
//
// This is cascade-dependent, so it can only be caught in a real browser (jsdom
// does not apply the Tailwind stylesheet). axe's color-contrast rule misses it
// because the fixed `.grain` overlay defeats axe's background detection, marking
// the result "incomplete" rather than a violation — hence this explicit check.

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

// sRGB relative luminance + WCAG contrast ratio.
function relLuminance([r, g, b]: number[]): number {
  const lin = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
function contrast(fg: number[], bg: number[]): number {
  const l1 = relLuminance(fg);
  const l2 = relLuminance(bg);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

test('Education degree/institution headings are readable against the page background', async ({
  page,
}) => {
  await page.goto('/about');
  await expect(page.locator('main')).toBeVisible();

  const educationSection = page.locator('section', {
    has: page.getByText('Education', { exact: true }),
  });
  const headings = educationSection.getByRole('heading', { level: 3 });
  const count = await headings.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const h = headings.nth(i);
    await h.scrollIntoViewIfNeeded();

    const { fg, bg, text } = await h.evaluate((el) => {
      const parse = (c: string) =>
        (c.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
      // Resolve the first opaque background walking up from the heading.
      let node: HTMLElement | null = el as HTMLElement;
      let bgRgb = [14, 14, 16]; // page <body> bg-base fallback
      while (node) {
        const c = getComputedStyle(node).backgroundColor;
        if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') {
          bgRgb = parse(c);
          break;
        }
        node = node.parentElement;
      }
      return {
        fg: parse(getComputedStyle(el).color),
        bg: bgRgb,
        text: (el.textContent || '').trim().slice(0, 60),
      };
    });

    const ratio = contrast(fg, bg);
    expect(
      ratio,
      `Education heading "${text}" has contrast ${ratio.toFixed(2)}:1 (fg=${fg} bg=${bg}); needs >= 4.5:1`
    ).toBeGreaterThanOrEqual(4.5);
  }
});
