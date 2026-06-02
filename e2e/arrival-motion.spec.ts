import { test, expect } from '@playwright/test';

/**
 * Signature arrival animation + motion behavior.
 *
 * DOM markers (see src/components/intro/Preloader.tsx, src/app/page.tsx,
 * src/components/motion/Reveal.tsx):
 *  - Preloader overlay: a fixed inset-0 `[aria-hidden]` div containing
 *    `#aperture-mask`. It unmounts entirely on completion / the skip path.
 *  - Hero <h1> renders "Nima Hakimi" (the period rides on the same line).
 *  - "Selected Work" / "Playground" / "Contact" headings live further down,
 *    each gated by a masked scroll Reveal (inline transform: translateY(...)).
 */

const overlay = (page: import('@playwright/test').Page) =>
  page.locator('div[aria-hidden].fixed.inset-0:has(#aperture-mask)');

test.describe('arrival animation (motion allowed)', () => {
  test('plays the arrival, then reveals hero + content (nothing stuck hidden)', async ({
    page,
  }) => {
    await page.goto('/');

    // The animated overlay mounts on a real page load and carries the aperture
    // mask. It may already be tearing down by the time we look, so we don't
    // hard-require catching it mid-play; the load-bearing assertions are that
    // it is gone and the content is revealed shortly after.
    const apertureMask = page.locator('#aperture-mask');

    // Within the ~2.1s choreography the hero name reveals and the overlay
    // unmounts. Generous timeout to absorb dev-server + animation timing.
    const heading = page.getByRole('heading', { name: 'Nima Hakimi' });
    await expect(heading).toBeVisible({ timeout: 3000 });

    // Overlay must be gone/hidden — it unmounts (returns null) on completion.
    await expect(overlay(page)).toHaveCount(0, { timeout: 3000 });
    await expect(apertureMask).toHaveCount(0, { timeout: 3000 });

    // Critically: no content is permanently stranded behind the masked
    // reveals. Scroll the work section into view and assert it becomes visible.
    const workHeading = page.getByRole('heading', { name: /selected work/i });
    await workHeading.scrollIntoViewIfNeeded();
    await expect(workHeading).toBeVisible({ timeout: 3000 });

    // At least one project title in the work list becomes visible too.
    const firstWorkRow = page.locator('.work-list a').first();
    await firstWorkRow.scrollIntoViewIfNeeded();
    await expect(firstWorkRow).toBeVisible({ timeout: 3000 });
  });
});

test.describe('reduced motion', () => {
  test('skips the animated preloader and shows content instantly', async ({
    page,
  }) => {
    // NOTE: in this Playwright build, `test.use({ reducedMotion })` did not
    // propagate to `window.matchMedia('(prefers-reduced-motion: reduce)')`,
    // which is exactly what the Preloader / Reveal read. An explicit
    // `emulateMedia` call before navigation does make matchMedia report
    // `reduce`, so the skip path is genuinely exercised.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Under reduced motion the Preloader takes the skip path: it sets show=false
    // before paint and renders null, so the overlay never blocks the page.
    const heading = page.getByRole('heading', { name: 'Nima Hakimi' });
    await expect(heading).toBeVisible({ timeout: 1000 });

    // The overlay (aperture mask) must not be present/blocking.
    await expect(overlay(page)).toHaveCount(0, { timeout: 1000 });

    // Selected Work content is rendered statically (Reveal renders children
    // without the transform under reduced motion).
    const workHeading = page.getByRole('heading', { name: /selected work/i });
    await workHeading.scrollIntoViewIfNeeded();
    await expect(workHeading).toBeVisible({ timeout: 1000 });
  });
});

test.describe('scroll reveal', () => {
  test('sections further down reveal as they enter the viewport', async ({
    page,
  }) => {
    await page.goto('/');

    // Let the arrival settle and the hero appear.
    await expect(
      page.getByRole('heading', { name: 'Nima Hakimi' }),
    ).toBeVisible({ timeout: 3000 });

    // Playground heading lives well below the fold behind a Reveal.
    const playground = page.getByRole('heading', { name: /playground/i });
    await playground.scrollIntoViewIfNeeded();
    await expect(playground).toBeVisible({ timeout: 3000 });

    // Contact closing moment, even further down.
    const contact = page.getByRole('heading', {
      name: /open to frontend roles/i,
    });
    await contact.scrollIntoViewIfNeeded();
    await expect(contact).toBeVisible({ timeout: 3000 });
  });
});
