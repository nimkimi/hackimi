# Feature: Post-Upgrade Debt Cleanup

_Status: spec approved 2026-08-05. Supersedes the four "follow-ups" listed in `.claude/HANDOFF.md`._

## Context

The Next.js 16 / Tailwind v4 upgrades (PRs #7, #8, merged as `5c5ef55`) surfaced four pieces of **pre-existing** debt. None of them is a regression from the upgrade, and none of them blocks the live site — but each one is a guard that is currently lying about its own state:

- `npm run check` fails on 69 files and **CI never runs it**, so the repo has a formatter gate that exists only to be ignored.
- `e2e/accent-contrast.spec.ts` contains an assertion that **passes on no data**, so the regression guard for the invisible-light-on-lime footgun cannot actually catch that regression.
- `react-hooks/set-state-in-effect` is an **error** in `eslint-config-next` 16 and was demoted to `warn` to land the upgrade. Six components cascade-render on mount.
- `eslint-config-prettier` is a devDependency **imported by nothing**.

A portfolio whose primary audience is recruiters and hiring managers is judged partly on whether its own quality gates are real. Three of these four items are gates that currently report green (or nothing) while being broken. That is the reason to fix them, and the reason to fix them properly rather than silencing them.

## Scope

**In scope:**

- Accept Prettier 3.8.3, reformat the repo, and **pin Prettier to an exact version** (no caret).
- Add a format check step to `.github/workflows/ci.yml` so `npm run check` becomes a real gate.
- **Drop** `eslint-config-prettier` from `devDependencies`.
- Fix the vacuous guard in `e2e/accent-contrast.spec.ts` so an empty/short computed color fails loudly.
- Remove all six `react-hooks/set-state-in-effect` violations by fixing the underlying pattern, and restore the rule to `'error'` in `eslint.config.mjs` as the definition of done.

**Out of scope:**

- **React Compiler.** It was measured and rejected during the upgrade (+5.2 KB gzip for noise-level runtime deltas, zero long tasks either way). Clearing its stated prerequisite does not reopen that decision. If it is ever revisited, that is a separate spec, and gotchas 2 and 3 in `.claude/HANDOFF.md` (Turbopack cache poisoning, CommonJS PostCSS) apply.
- **ESLint v10.** Pinned to v9 deliberately — `eslint@10` throws `TypeError: scopeManager.addGlobals is not a function` through `eslint-config-next` 16.
- **`cacheComponents` / PPR.** Every route is static; deliberately skipped during the upgrade.
- Any visual, copy, or behavioural change to the site. The arrival animation, the reveal choreography, the toast, the nav, and the contact flow must all **look and behave identically** after this work.
- Rewriting the `Preloader` GSAP timeline. One line in that component is wrong; the other ~700 are fine.

## Acceptance Criteria

### Global (the whole feature is done when all of these hold on `main`)

- [ ] `npm run check` exits 0.
- [ ] `npm run lint` reports **0 errors and 0 warnings**.
- [ ] `eslint.config.mjs` no longer contains a `react-hooks/set-state-in-effect` override.
- [ ] `npx tsc --noEmit` is clean.
- [ ] `npm test` passes, with **more** tests than the 240 baseline (every fix ships a test).
- [ ] Playwright passes 16/16 (plus new tests) against **both** a production build and the Turbopack dev server.
- [ ] `eslint-config-prettier` does not appear in `package.json`.
- [ ] CI runs the format check and fails the build when formatting drifts.
- [ ] The 10 full-page screenshots (5 routes × desktop 1440 / mobile 390) are **byte-identical** to the ones captured from `5c5ef55`, or every difference is explained and approved.

### Batch 1 — Tooling (must merge before Batch 2 branches)

- [ ] `package.json` pins `"prettier": "3.8.3"` exactly — no `^`, no `~`.
- [ ] The reformat is a **standalone commit** containing nothing but Prettier output.
- [ ] `eslint-config-prettier` removed from `devDependencies` and absent from `package-lock.json`.
- [ ] `.github/workflows/ci.yml` gains a `Format check` step running `npm run check`, placed immediately after `Lint`.
- [ ] A deliberate formatting violation on a branch fails CI (verified, not assumed).

### Batch 2A — `accent-contrast` guard

- [ ] `assertDarkOnLime()` fails with a clear message when `getComputedStyle(node).color` yields fewer than 3 numeric channels, instead of silently producing `Math.max(...[]) === -Infinity`.
- [ ] A test proves the guard rejects an empty computed color — **written first, and observed failing against the current implementation.**
- [ ] The two existing accent-contrast tests still pass in dev and prod mode.

### Batch 2B–2E — `set-state-in-effect`

Each of the four component issues:

- [ ] Removes its violation without an `eslint-disable`.
- [ ] Ships a test written **first** that fails against the current implementation and passes after.
- [ ] Leaves every existing test in its file passing, unmodified where possible; any modified test must be justified in the PR body as testing an implementation detail rather than behaviour.
- [ ] Produces no hydration warning in the browser console on a production build.

Per-group specifics:

- **2B — media-query reads** (`Reveal.tsx:37`, `MagneticButton.tsx:66`): both read a media query via `useSyncExternalStore` behind one shared hook. First client render must still match SSR output (`getServerSnapshot` returns the SSR-safe default: not-reduced-motion for `Reveal`, non-magnetic for `MagneticButton`). Both must now also **react to live media-query changes**, which the current mount-only effect does not.
- **2C — `Preloader.tsx:135`**: the reduced-motion skip path no longer calls `setState` synchronously in the layout effect. `setShow(false)` from the GSAP `onComplete`/`finish()` path is **not** a violation and may stay. The `~2.1s` choreography, its timings, and its fail-safes are unchanged.
- **2D — `Toast.tsx:22` + `ContactClient.tsx:65`**: fixed together — `ContactClient` owns the state `Toast` renders, so they cannot be split. Toast enter/exit transition, the 200 ms exit delay, the 4 s auto-dismiss, and the `role`/`aria-live` switch on error must all survive.
- **2E — `SiteNav.tsx:34`**: the mobile menu still closes on route change. Escape-to-close is untouched.

### Batch 3 — Closer

- [ ] `eslint.config.mjs` restores `react-hooks/set-state-in-effect` to `'error'` (by deleting the override block and its comment), and `npm run lint` is clean.

## Design Notes

**No visual change is permitted by this feature.** The one place with genuine visual risk is the signature arrival animation (`Preloader`), which is covered by `e2e/arrival-motion.spec.ts` and is approved design work. Verification for that issue is not "the tests pass" — it is a recorded capture of the arrival before and after, reviewed on taste.

The reduced-motion path is an accessibility contract, not a nicety: under `prefers-reduced-motion: reduce` the intro must be skipped **before paint**, with no flash of the overlay. Any fix that briefly renders the overlay for reduced-motion users is a regression even if every test passes.

## Technical Notes

### Sequencing — why this is two batches, not four parallel issues

A 69-file `prettier --write` rewrites nearly every file in the repo. Any branch cut from pre-format `main` conflicts with it on every file it touches. The four follow-ups are logically independent but **not** mergeable in parallel.

```
Batch 1 (serial, merge first)
  └─ #A  Prettier: reformat + exact pin + CI gate + drop eslint-config-prettier

Batch 2 (parallel, all branch from post-format main)
  ├─ #B  e2e/accent-contrast vacuous assertion
  ├─ #C  useMediaQuery + Reveal + MagneticButton
  ├─ #D  Preloader skip path
  ├─ #E  Toast + ContactClient
  └─ #F  SiteNav route-change close

Batch 3 (serial, after all of #C–#F)
  └─ #G  Restore 'error' in eslint.config.mjs
```

`#G` cannot live inside any single Batch 2 issue — the rule can only be re-armed once all six components are clean — so it is its own closer issue depending on `#C`–`#F`.

`#C` introduces the shared media-query hook. `#D` deliberately does **not** depend on it: `Preloader` reads `matchMedia` once inside a layout effect to make a one-shot decision, not as a subscription, so coupling the two would serialise them for no benefit.

### The four fix shapes

| Group | Files | Fix shape | Risk |
| --- | --- | --- | --- |
| Media-query reads | `Reveal.tsx:37`, `MagneticButton.tsx:66` | `useSyncExternalStore` behind a shared `useMediaQuery` hook | Low |
| Arrival skip path | `Preloader.tsx:135` | Narrowest correct removal of the synchronous skip-path `setState` | **High** |
| Toast lifecycle | `Toast.tsx:22`, `ContactClient.tsx:65` | Derive render state / move transitions out of the effect body | Medium |
| Route-change close | `SiteNav.tsx:34` | Reset-during-render on `pathname` change, or close in link handlers | Low |

`useSyncExternalStore` needs a working `subscribe`. The jsdom `matchMedia` stub in `tests/setup/jsdom-setup.ts` must support `addEventListener`/`removeEventListener`; if it does not, upgrading that stub is part of `#C` and is a shared prerequisite for anything else that adopts the hook.

### Environment gotchas (from `.claude/HANDOFF.md` — do not rediscover)

1. **Playwright/Chromium will not run inside the Bash sandbox on this Mac.** Use `dangerouslyDisableSandbox: true` **and** `ulimit -n 10240`. A full-suite red locally is an environment artifact — check CI before believing it.
2. **Turbopack's persistent FS cache poisons across `next.config.js` changes.** Clear `.next` after any config change before trusting a build failure. `rm -rf .next` may hit the permission gate; `mv .next $TMPDIR/...` works.
3. **Reduced motion in E2E must use `page.emulateMedia({ reducedMotion: 'reduce' })`** — `test.use({ reducedMotion })` does not propagate to `window.matchMedia`, which `Preloader` and `Reveal` read. This constraint gets stricter under `useSyncExternalStore`, not looser.
4. `gh` and other network calls need `dangerouslyDisableSandbox: true` on this machine — the sandbox fails TLS verification against `api.github.com`.
5. **Never put a claude.ai session URL in a commit message or PR body.**
6. `main` pushes auto-deploy to Vercel **production**. Branch + PR only; never push to `main`.

Relevant files:

- `package.json`, `package-lock.json`, `.github/workflows/ci.yml` — #A
- `e2e/accent-contrast.spec.ts` — #B
- `src/components/motion/Reveal.tsx`, `src/components/motion/MagneticButton.tsx`, `tests/setup/jsdom-setup.ts` — #C
- `src/components/intro/Preloader.tsx`, `e2e/arrival-motion.spec.ts` — #D
- `src/components/Toast.tsx`, `src/app/contact/ContactClient.tsx` — #E
- `src/components/layout/SiteNav.tsx` — #F
- `eslint.config.mjs` — #G

## Open Questions

None. All five scope/sequencing decisions were settled before this spec was written:

1. Prettier → accept 3.8.3, pin exactly, `check` joins CI.
2. `set-state-in-effect` → fix the pattern, not the lint line; `Preloader` carved out and treated conservatively.
3. Sequencing → two batches; the format sweep is serialised ahead of everything.
4. `eslint-config-prettier` → dropped.
5. React Compiler → explicitly out of scope.

## Test-coverage constraints (surveyed 2026-08-05, before Batch 2 started)

The existing suite was read in full for the six components. Four findings change how Batch 2 must be implemented — they are recorded here because they are not obvious from the components themselves.

### 1. The jsdom `matchMedia` stub cannot notify — upgrading it is a shared prerequisite for #C

`tests/setup/jsdom-setup.ts` hard-codes `matches: false` for every query, and `addListener` / `removeListener` / `addEventListener` / `removeEventListener` / `dispatchEvent` are all bare `vi.fn()` spies. They record calls and **store nothing**, so there is no mechanism anywhere to fire a change at a registered listener. The same inert shape is re-implemented locally in `Reveal.test.tsx`, `MagneticButton.test.tsx` and `Preloader.test.tsx`.

Consequence: switching to `useSyncExternalStore` is safe against the _existing_ tests — their `subscribe` callback simply never fires. But the acceptance criterion "must react to live media-query changes" **cannot be tested until the stub stores listeners and can invoke them.** That stub upgrade is the first RED step of #C, not an afterthought.

### 2. `Preloader.test.tsx` asserts on effect _mechanism_, not just output — #D will break tests

Unlike the other five, this file reaches deep into implementation. The assertions most at risk:

- `expect(gsapApi.timeline).not.toHaveBeenCalled()` and `expect(window.requestAnimationFrame).not.toHaveBeenCalled()` on the skip path — both require the skip decision to resolve **synchronously with render**.
- `expect(window.requestAnimationFrame).toHaveBeenCalled()` immediately after `render()` on the play path — requires rAF scheduling to stay inside a mount-time effect.
- `flushRaf(); flushRaf();` — binds to the exact **two-level nested rAF** structure.
- `expect(window.cancelAnimationFrame).toHaveBeenCalled()` and `expect(tl.kill).toHaveBeenCalled()` on `unmount()` — require teardown to stay in an effect's cleanup return.

This file deliberately does **not** use fake timers for rAF (jsdom's rAF is not reliably driven by them across versions); it spies on `requestAnimationFrame` with a manual queue plus a `flushRaf()` helper. Keep that approach. Any assertion this issue modifies must be justified in the PR as testing mechanism rather than behaviour.

### 3. #F has zero unit coverage today — a genuine RED is available

`SiteNav.test.tsx` never changes `pathname` mid-test. The close-on-route-change behaviour is covered **only** by `e2e/navigation-contact.spec.ts` (`// Route change closes the menu.`). So #F should start by writing the missing unit test that re-renders with a changed `usePathname()` and asserts the panel closes. Every other assertion in that file is pure DOM-after-interaction and is refactor-safe.

### 4. #E has no transition coverage — every test mounts already in its target state

`ContactClient.test.tsx` mocks `useActionState` at the `react` module level, returning a **static** tuple. No test re-renders with a changed state, so nothing exercises the effect's reactivity. The existing assertions will survive an effect-to-render refactor without proving anything about it. The real regression risk — does the toast update correctly on a **second** submission — is untested, and that is the test to write first.

`Toast.test.tsx` does have one genuine lifecycle test (`vi.useFakeTimers()`, prop cleared, content stays mounted, unmounts after exactly 200 ms). Whatever replaces the effect must remain drivable by `vi.advanceTimersByTime(200)`.

### Refactor-safe by inspection

`MagneticButton.test.tsx` and `SiteNav.test.tsx` assert only on final DOM after `act()`-wrapped render or `userEvent` interaction. A `useEffect` flip and a synchronous `useSyncExternalStore` read both resolve before their assertions run. `MagneticButton.test.tsx`'s explanatory header comment about `magneticEnabled` flipping in an effect will go stale and should be updated with the code.
