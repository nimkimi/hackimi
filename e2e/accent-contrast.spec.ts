import { test, expect, type Locator } from '@playwright/test';
import { contrast, maxChannel, parseColorChannels } from './support/color';

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

async function assertDarkOnLime(el: Locator, label: string) {
  // Re-resolve via expect.poll: motion-wrapped elements (the nav CTA, the
  // segmented pill) re-render while their layout animation settles, which can
  // detach a held handle. evaluate() needs the node attached but not in view —
  // computed color is viewport-independent, so we never scroll. The parsing
  // itself runs in Node (not inside evaluate) so a degenerate computed color
  // throws a clear error from `parseColorChannels`/`maxChannel` rather than
  // silently feeding `Math.max(...[])` (`-Infinity`, always `< 80`) into the
  // assertion. expect.poll retries on a thrown error the same way it retries
  // a failed comparison, so a transiently-detached handle still gets re-read.
  let fg: number[] = [255, 255, 255];
  await expect
    .poll(
      async () => {
        const raw = await el.evaluate((node) => getComputedStyle(node).color);
        fg = parseColorChannels(raw);
        // Text must be dark (every channel low), not the light `ink` fallback.
        return maxChannel(fg);
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
