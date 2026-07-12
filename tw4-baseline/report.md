# Task 3: After-capture + pixel diff — report

## Procedure

1. `npm run build` (production build, post-migration code at `bd3fb99`) then `next start -p 3200` (manual server start, no `webServer` in the dedicated Playwright config — same pattern as Task 1's `before/` capture).
2. Curl-checked all 7 routes -> all 200.
3. `TW4_BASELINE_SUBDIR=after npx playwright test --config=scripts/tw4-baseline.config.ts` — first attempt failed all 18 tests with `bootstrap_check_in ... Permission denied (1100)` (the same Chromium mach-port sandbox signature Task 1 hit); retried with sandbox disabled -> 18/18 passed. 18 PNGs landed in `tw4-baseline/after/`, filenames byte-identical to `before/`.
4. Diff tool: **pixelmatch 7.2.0 + pngjs 7.0.0** (installed `--no-save`, dev-only, not persisted to `package.json`/lockfile). Chose pixelmatch over `odiff-bin` because `npx odiff-bin` failed with "odiff binary has not been installed correctly" (postinstall didn't copy the platform binary) even after a sandbox-disabled retry; pixelmatch is pure JS and installed cleanly. Threshold 0.1 (pixelmatch default), per-pair diff images written during investigation (not committed — diagnostic only).
5. Arrival animation: captured 11 dense frames of `/` at 1440px, every 300ms from 0-3000ms, and read each frame directly.
6. One real regression found (`about-1440.png`, 1.19% diff) — root-caused, fixed, rebuilt, re-captured, re-diffed to clean. See "Fix" below.
7. Servers killed after each rebuild; only the ports this task started (3200, plus a temporary comparison server on 3201 in a throwaway git worktree, and a diagnostic dev server on 3202) were touched. Port 3000 was never touched.

## Result table (final, post-fix)

| Pair | Diff % | Verdict |
|---|---|---|
| about-1440.png | 0% (0 / 4,459,680 px) | PASS |
| about-375.png | 0% | PASS |
| contact-1440.png | 0% | PASS |
| contact-375.png | 0% | PASS |
| home-full-1440.png | 0.0032% (149 px) | PASS |
| home-full-375.png | 0.0118% (149 px) | PASS |
| home-mid-1440.png | 0% | PASS |
| home-mid-375.png | 0% | PASS |
| home-settled-1440.png | 0.0065% (84 px) | PASS |
| home-settled-375.png | 0% | PASS |
| work-1440.png | 0% | PASS |
| work-375.png | 0% | PASS |
| work-be-my-guide-1440.png | 0% | PASS |
| work-be-my-guide-375.png | 0% | PASS |
| work-concert-radar-1440.png | 0% | PASS |
| work-concert-radar-375.png | 0% | PASS |
| work-nav-event-registration-1440.png | 0% | PASS |
| work-nav-event-registration-375.png | 0% | PASS |

**18/18 pairs pass, all well under the 0.1% hard gate.** 15 of 18 are byte-identical (0 diff pixels). The three home-page frames with a nonzero-but-tiny diff (149, 149, 84 px against multi-million-pixel images) were present at similar magnitude *before* any fix was applied and are unrelated to the regression below — spot-checked: `home-full-1440`'s diff pixels cluster tightly in a single 28x28px box; `home-settled-1440`'s 84 px are sparsely scattered across a large region. Both patterns are consistent with sub-pixel anti-aliasing noise (e.g. the `.grain` SVG-turbulence overlay, or glyph-edge AA) rather than a coherent layout/content change, and neither route touches the utility-class pattern responsible for the real regression (confirmed by a codebase-wide grep — see below). Not investigated further given they're 8-30x under threshold.

## Real regression found + fixed

`about-1440.png` initially diffed at **1.19% (52,954 / 4,459,680 px)**, well over the 0.1% gate — the only real failure. `about-375.png` (mobile, no `sm:` breakpoint) was pixel-perfect from the start, which was the first clue.

**Root cause:** Tailwind v3 had a latent CSS cascade-order bug where a responsive font-size utility's *implicitly paired default line-height* (e.g. `sm:text-2xl` -> `line-height: 2rem` from Tailwind's default `fontSize` scale tuple) silently overrode an explicit, intended `leading-*` utility on the same element, because v3 emits responsive (`@media`-scoped) utility rules *after* base utility rules in the generated stylesheet, and same-specificity CSS resolves by source order. Tailwind v4 changed this: responsive utilities no longer clobber an explicit `leading-*` at the same breakpoint, so the explicit line-height now actually applies — arguably *more correct*, but it changes the rendered pixel output relative to the v3 baseline this migration is supposed to preserve exactly.

Confirmed empirically (not guessed) via three steps:
1. Re-ran the after-capture spec twice back-to-back on identical code -> 0-pixel diff between the two runs, ruling out render non-determinism/jitter as the cause.
2. Checked out the pre-migration commit (`eb96f3c`) into a throwaway git worktree, built and served it on port 3201 alongside the post-migration server on 3200, and diffed `getComputedStyle(...).lineHeight` for every heading directly (via Playwright `page.evaluate`): every `leading-snug`-classed heading using a responsive `sm:text-*` size showed a v3/v4 line-height mismatch (experience headings 32px -> 33px, education headings 28px -> 24.75px).
3. A full-page element scan (all 93 text-bearing elements on `/about`, matched by DOM order) found **three** affected elements total, all in `src/app/about/page.tsx`: two `leading-snug` headings (found first) plus one `leading-relaxed` footer paragraph (`sm:text-xl`) that an initial narrower grep for `leading-snug` alone had missed. That third element's height *grew* by 9px, which had been almost exactly canceling the two headings' net -9px, coincidentally landing the unfixed page at the *same total height* as the v3 baseline (3097px both) despite being wrong internally — page height alone was not a reliable signal. A final grep across the whole codebase for any `leading-*` + responsive `text-*` combination confirmed these three are the only instances anywhere in the repo.

**Fix (`src/app/about/page.tsx`, 3 lines, translation-level only):** pinned the `sm:` breakpoint's line-height explicitly to what Tailwind v3 actually rendered, using Tailwind's built-in numeric `leading-*` scale (no arbitrary values needed — `leading-7` = 1.75rem = 28px, `leading-8` = 2rem = 32px, both exact matches):

- Experience heading (`text-xl ... sm:text-2xl`): added `sm:leading-8`.
- Education heading (`sm:text-lg`): added `sm:leading-7`.
- Footer paragraph (`text-lg ... sm:text-xl`): added `sm:leading-7`.

Rebuilt, restarted the server, re-captured `after/`, re-diffed all 18 pairs: `about-1440.png` is now byte-identical to `before/about-1440.png` (0 / 4,459,680 px, same 1440x3097 dimensions), and no other pair regressed.

## Arrival animation verification

Captured 11 frames of `/` at 1440px viewport, every 300ms from 0ms to 3000ms, and read each one directly. Observed sequence:

- **0ms:** tiny lime seed dot, centered.
- **300ms:** "NH" monogram fully stroked on in lime outline (draw-on).
- **600ms:** monogram solid/filled lime.
- **900ms:** two-tone transition begins — "N" turning to ink-white while "H" stays lime.
- **1200ms:** monogram massively enlarged, filling the viewport; a diagonal lime band sweeps across, with hero content (nav, headline, CTA) starting to show through underneath — the aperture-reveal wipe.
- **1500ms:** monogram has flown up into the nav corner; headline text is revealing behind a masked/staggered reveal (partial "Nima Hakimi." visible, closing accent still a lime square block, diagonal wipe artifact fading).
- **1800-2100ms:** small "NH" logo settles into the nav top-left; full "Nima Hakimi." headline visible in white with the lime accent "pop" after it; subhead, CTAs, and "SCROLL" cue all rendered.
- **2400-3000ms:** identical to 2100ms — fully settled, no further change, no jank.

This matches the described choreography (draw-on -> solid -> aperture reveal -> name mask -> lime period) with no visible regression. GSAP was untouched by the migration and the `home-mid-*`/`home-settled-*` pixel pairs are byte-identical (0 diff) in the final result, corroborating that the animation itself renders identically pre/post-migration.

## Self-review

- Did not assume "codemod was already reviewed, so no real diff is expected" — ran the actual diff tool over all 18 pairs and let a real 1.19% failure stand rather than rationalizing it away.
- Did not stop at "no CSS/component files touched by the codemod commit" (true for `about/page.tsx`) and conclude the diff must be noise — verified determinism first (two identical-code captures, 0 diff), which ruled out jitter before treating the discrepancy as real.
- Did not accept a partial fix once the numbers didn't add up: after fixing the two `leading-snug` headings, the page height diverged *further* from baseline (3106px vs 3097px) rather than converging — that contradiction is what led to the full-page diagnostic scan and the discovery of the third, previously-missed `leading-relaxed` instance. Did not commit the partial fix.
- Opened and visually compared actual before/after PNGs and cropped regions (not just diff percentages) early on, then moved to pixel-level and computed-style instrumentation once eyeballing the thumbnails wasn't conclusive enough to explain a 1px-per-line shift.
- Read all 11 arrival frames directly and described what's actually visible in each, rather than inferring the sequence from the spec comments alone.
- Scope check: the fix touches exactly 3 `className` strings (one utility class appended each), no logic/structure changes, no other files touched.
