import { test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

/**
 * Pre-migration visual baseline capture (Tailwind v3 -> v4 codemod).
 *
 * TEMPORARY: written for the baseline-only step of the migration and deleted
 * once the after-capture + pixel diff (task 5) is done. Run against a
 * production build (`next build && next start`), NOT dev — see
 * `tw4-baseline.config.ts` for the server/port wiring.
 *
 * Route matrix: every public route under src/app, at 375px (mobile) and
 * 1440px (desktop). The home route additionally captures the signature
 * arrival animation mid-flight (800ms) and settled (2600ms), as plain
 * viewport shots — the arrival only touches the hero/nav, so a full-page
 * capture there would just add noise. A separate full-page settled capture
 * covers the rest of `/` (Selected Work, Playground, Contact) — Playground
 * only lives on this route, so without it there is no baseline to diff
 * against post-migration.
 *
 * All other routes use `fullPage: true` after REVEAL_SETTLE_MS: content is
 * gated behind the `Reveal` component's IntersectionObserver, which only
 * fires for what has actually scrolled into view. Reveal has a 2500ms
 * safety-net fallback that shows content regardless (see
 * src/components/motion/Reveal.tsx), so waiting past
 * fallback (2500ms) + longest stagger delay (~1s) + transition (0.8s)
 * without any scrolling is enough to settle every section for a full-page
 * shot.
 */

const OUT_DIR = path.join(process.cwd(), 'tw4-baseline', 'before');
mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: '375', width: 375, height: 812 },
  { name: '1440', width: 1440, height: 900 },
];

const STATIC_ROUTES = [
  { name: 'about', path: '/about' },
  { name: 'contact', path: '/contact' },
  { name: 'work', path: '/work' },
  { name: 'work-be-my-guide', path: '/work/be-my-guide' },
  { name: 'work-concert-radar', path: '/work/concert-radar' },
  { name: 'work-nav-event-registration', path: '/work/nav-event-registration' },
];

const REVEAL_SETTLE_MS = 4500;

for (const vp of VIEWPORTS) {
  test.describe(`viewport ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test(`home mid-arrival (800ms) @ ${vp.name}`, async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(OUT_DIR, `home-mid-${vp.name}.png`),
      });
    });

    test(`home settled (2600ms) @ ${vp.name}`, async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(2600);
      await page.screenshot({
        path: path.join(OUT_DIR, `home-settled-${vp.name}.png`),
      });
    });

    test(`home full-page settled @ ${vp.name}`, async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(REVEAL_SETTLE_MS);
      await page.screenshot({
        path: path.join(OUT_DIR, `home-full-${vp.name}.png`),
        fullPage: true,
      });
    });

    for (const route of STATIC_ROUTES) {
      test(`${route.name} @ ${vp.name}`, async ({ page }) => {
        await page.goto(route.path);
        await page.waitForTimeout(REVEAL_SETTLE_MS);
        await page.screenshot({
          path: path.join(OUT_DIR, `${route.name}-${vp.name}.png`),
          fullPage: true,
        });
      });
    }
  });
}
