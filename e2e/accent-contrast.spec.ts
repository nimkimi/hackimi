import { test, expect, type Locator } from '@playwright/test';
import { contrast, maxChannel, parseColorChannels } from './support/color';

// Regression guard for issue #3. The dark-on-lime sites (accent buttons, the
// nav CTA, the work-row "In progress" tag) used to get their dark text
// color from `text-base` — the same utility that caused the invisible-heading
// footgun. The fix renames the color token to `dark`, so these now use
// `text-dark`. If a future edit drops `text-dark`, the text would fall back to
// the inherited light `ink` color, rendering near-invisible light-on-lime. This
// guard asserts each one renders genuinely DARK text with adequate contrast
// against the lime accent it sits on.

// The accent these elements sit on (`accent` in tailwind.config.ts, #C6FF3D).
// Both targets are placed on it by design via `bg-accent` — so we check
// contrast against this constant rather than walking the DOM for a background.
const ACCENT = [198, 255, 61];

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

async function assertDarkOnLime(el: Locator, label: string) {
  // Poll rather than read once: motion-wrapped elements (the nav CTA, the
  // segmented pill) re-render while their layout animation settles, so the
  // computed color can still be mid-transition on the first read. evaluate()
  // needs the node attached but not in view — computed color is
  // viewport-independent, so we never scroll. Detachment is the locator's
  // problem, not the poll's: `el.evaluate()` re-resolves the selector and
  // waits for the element on every call.
  //
  // The parsing runs in Node (not inside evaluate) so a degenerate computed
  // color throws a clear error from `parseColorChannels`/`maxChannel` rather
  // than silently feeding `Math.max(...[])` (`-Infinity`, always `< 80`) into
  // the assertion. Note that expect.poll retries a failed *comparison* but not
  // a *throw*: `invokePollMatcher` awaits the callback outside its try/catch,
  // so an exception propagates immediately and fails the test. That is the
  // behaviour we want here — an unparseable color is not a transient state
  // that will settle, so failing at once with the raw string in the message
  // beats polling it to a timeout.
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
  await assertDarkOnLime(page.getByRole('link', { name: 'Let’s talk' }).first(), "nav Let's talk CTA");
});

// The playground's segmented control (this spec's original second target) was
// removed 2026-08; the work list's "In progress" tag is the remaining
// dark-on-lime pill.
test('work-row "In progress" tag renders dark text on lime', async ({ page }) => {
  await page.goto('/');
  const tag = page.getByText('In progress').first();
  await expect(tag).toBeVisible();
  await assertDarkOnLime(tag, 'work-row In progress tag');
});
