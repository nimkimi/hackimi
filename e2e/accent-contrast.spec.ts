import { test, expect, type Locator } from '@playwright/test';

// Regression guard for issue #3. The dark-on-lime sites (accent buttons, the
// nav CTA, the selected segmented-control label) used to get their dark text
// color from `text-base` — the same utility that caused the invisible-heading
// footgun. The fix renames the color token to `dark`, so these now use
// `text-dark`. If a future edit drops `text-dark`, the text would fall back to
// the inherited light `ink` color, rendering near-invisible light-on-lime. This
// guard asserts each one renders genuinely DARK text with adequate contrast
// against the lime accent it sits on.

// The accent these elements sit on (`accent` in tailwind.config.ts, #C6FF3D).
// Both targets are placed on it by design — the nav CTA via `bg-accent`, the
// segmented label via an absolute sibling pill — so we check contrast against
// this constant rather than walking the DOM for a background.
const ACCENT = [198, 255, 61];

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

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

async function assertDarkOnLime(el: Locator, label: string) {
  // Re-resolve via expect.poll: motion-wrapped elements (the nav CTA, the
  // segmented pill) re-render while their layout animation settles, which can
  // detach a held handle. evaluate() needs the node attached but not in view —
  // computed color is viewport-independent, so we never scroll.
  let fg = [255, 255, 255];
  await expect
    .poll(
      async () => {
        fg = await el.evaluate((node) =>
          (getComputedStyle(node).color.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number)
        );
        // Text must be dark (every channel low), not the light `ink` fallback.
        return Math.max(...fg);
      },
      { message: `${label} text should be dark` }
    )
    .toBeLessThan(80);

  // And readable on the lime accent it sits on.
  expect(
    contrast(fg, ACCENT),
    `${label} contrast ${contrast(fg, ACCENT).toFixed(2)}:1 (fg=${fg})`
  ).toBeGreaterThanOrEqual(4.5);
}

// The nav CTA is a MagneticButton (`bg-accent text-dark`), so this also covers
// the accent-button case for that component.
test('nav "Let\'s talk" CTA renders dark text on lime', async ({ page }) => {
  await page.goto('/');
  await assertDarkOnLime(page.getByRole('link', { name: "Let's talk" }).first(), "nav Let's talk CTA");
});

test('selected segmented-control label renders dark text on lime', async ({ page }) => {
  await page.goto('/');
  // The dark color lives on the inner text span; the sibling motion span is the
  // (aria-hidden) lime pill background.
  const selectedLabel = page.locator('[role="radio"][aria-checked="true"] span:not([aria-hidden])');
  await expect(selectedLabel).toHaveCount(1);
  await assertDarkOnLime(selectedLabel, 'segmented selected label');
});
