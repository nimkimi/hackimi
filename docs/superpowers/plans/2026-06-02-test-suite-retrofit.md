# Test Suite Retrofit — Implementation Plan

> **For agentic workers:** Execution model is **subagent-driven**. The controller (main session) dispatches **one Claude Opus 4.8 agent per task** to write the tests, then the controller **reviews** the produced tests. If the review finds problems, the controller **adds a fix task** to the task list and dispatches a follow-up agent. This is a *characterization / regression* effort (writing tests for already-shipped code), not TDD — TDD begins for all work created *after* this suite lands.

**Goal:** Bring the existing `hackimi` portfolio under automated test coverage — pure logic, server code, React components, page integration, and real-browser end-to-end — so future changes are safe and TDD can be adopted going forward.

**Architecture:** Vitest 4 with two environments via `test.projects` — a `node` project for pure logic + server modules, and a `jsdom` project (React Testing Library + `@testing-library/jest-dom`) for components and page integration. Playwright drives real-browser E2E for the signature animation, navigation, and the contact flow. All test tooling is `devDependencies` only — **zero production-bundle / runtime impact** (this is why E2E is in scope).

**Tech Stack:** Next.js 15 (App Router, RSC, Server Actions), React 19, TypeScript (strict), Vitest 4, React Testing Library, `@testing-library/user-event`, jsdom, Playwright. Docs sourced via web + bundled Vercel/Next.js skills (context7 MCP is not connected this session).

**Branch:** All work on `add-test-suite` (we are on `main` — do not commit tests to `main`).

**Docs note for every agent:** before using an unfamiliar API, confirm current syntax against official docs (Vitest 4 `test.projects`, RTL `render`/`screen`, `user-event` v14 async API, Playwright `@playwright/test`, Next 15 testing of async Server Components) via WebFetch/WebSearch. Do not rely on memorized pre-2024 APIs.

---

## What exists today

- Vitest 4.1.8, `vitest.config.ts` → `environment: 'node'`, `include: ['tests/**/*.test.ts']`.
- Only 2 test files: `tests/intro.test.ts` (pure), `tests/work.test.ts` (data shape). **Do not duplicate these — extend where noted.**
- No RTL, no jsdom/happy-dom, no Playwright, no `@vitejs/plugin-react`.
- `src/lib/email.ts` and `src/lib/captcha.ts` import `'server-only'` (throws outside RSC) → must be stubbed in tests.

## Target test directory layout

```
tests/
  unit/         # node env — pure logic (lib/*, data/*)
  server/       # node env — server modules + actions + route handlers (mocks)
  components/   # jsdom env — React components (RTL)
  integration/  # jsdom env — page-level render/integration
  setup/        # jest-dom + jsdom global mocks (matchMedia, IntersectionObserver, ResizeObserver)
e2e/            # Playwright specs
```

`tests/intro.test.ts` and `tests/work.test.ts` move into `tests/unit/` during infra setup (or stay and the include globs cover both — agent decides, but keep them green).

---

## Coverage map (one task per row unless noted)

| # | Unit(s) under test | Env | Key cases |
|---|---|---|---|
| Infra | test tooling + config | — | RTL+jsdom+plugin-react, `test.projects`, `server-only` stub, global mocks, Playwright, npm scripts, branch |
| Logic | `lib/validation.ts` | node | valid parse, trim, min/max boundaries (name 100, subject 120, message 5000), bad email, empty fields |
| Logic | `lib/metadata.ts` + `lib/site.ts` | node | `resolveUrl` (`/`, relative, absolute), title suffix, `toOgImage` string vs object vs default, keyword merge dedupe, `buildPersonJsonLd` shape, site constants sanity |
| Logic | `data/work.ts` (extend) + `data/about.ts` | node | slugs unique, 5 ordered sections, image alts non-empty + cover present, dev-guard throws on heading drift; about: language proficiency range, profile URLs, non-empty arrays |
| Server | `lib/captcha.ts` | node | no token: prod→false / dev→true; no secret→`!isProd`; fetch ok+`success:true`→true; `success:false`→false; `res.ok=false`→`!isProd` (mock `fetch` + `NODE_ENV`) |
| Server | `lib/email.ts` | node | `assertEnv` throws on missing; transporter host/port/secure defaults + overrides; `sendMail` passes from/to/subject/text (mock `nodemailer.createTransport`) |
| Server | `app/contact/actions.ts` + `state.ts` | node | captcha-fail state; zod-fail fieldErrors; sendMail-throws error state; success → empty values + success msg; reads `g-recaptcha-response` then `recaptchaToken` fallback (mock email + captcha) |
| Server | `app/sitemap.ts` + `app/robots.txt/route.ts` | node | sitemap includes all static + dynamic work slugs, `/` priority 1, URL join; robots returns text + Sitemap line + headers |
| Comp | `brand/Monogram` + `motion/UnderlineLink` | jsdom | Monogram renders SVG + title; UnderlineLink renders `next/link` with href/children, forwards props |
| Comp | `motion/Reveal` | jsdom | renders children; reduced-motion → visible immediately; IO callback → reveals; safety fallback timer (mock IntersectionObserver + matchMedia) |
| Comp | `components/Toast` | jsdom | renders message, status styling, `onClose` fires, auto-dismiss via fake timers |
| Comp | `work/WorkRow` + `CaseHero` + `CaseSection` + `CaseFigure` + `CaseGallery` | jsdom | render fields from props, link, `inProgress` badge, image alts, captions |
| Comp | `playground/SegmentedControl` + `SpringSlider` + `CopyChip` | jsdom | segment select updates state; slider value change; copy → `navigator.clipboard` + "copied" state (user-event + clipboard mock) |
| Comp | `motion/MagneticButton` + `motion/SmoothScroll` | jsdom | MagneticButton: internal href uses `next/link`, reduced-motion → no transform; SmoothScroll: Lenis init + cleanup on unmount, reduced-motion skip (mock `lenis`) |
| Comp | `intro/Preloader` | jsdom | reduced-motion → no animation / content already set; gsap timeline invoked on play; fail-safe restores content; unmount cleanup (mock `gsap`) |
| Comp | `layout/SiteNav` | jsdom | nav links present, mobile menu toggle open/close, `#nav-logo-slot` exists, 44px targets |
| Integ | pages: `page`, `about`, `work`, `work/[slug]` | jsdom | async RSC render key content; `generateStaticParams` returns all slugs; unknown slug → `notFound`; `generateMetadata` shape |
| Integ | `contact/ContactClient` | jsdom | `useActionState` form renders; field errors display; success toast; required attributes (mock action) |
| E2E | arrival + motion | browser | preloader plays then hero/content visible; `prefers-reduced-motion` → content instant, no preloader; reveal-on-scroll shows sections |
| E2E | nav + work + contact | browser | nav links route; mobile menu; work list → case page; contact validation + submit success (intercept action POST / siteverify) |
| E2E | a11y smoke (optional) | browser | `@axe-core/playwright` no serious violations on `/`, `/about`, `/work`, `/contact` |
| Final | suite review + gaps | — | run full suite + E2E green, coverage gap scan, then `finishing-a-development-branch` |

---

## Per-task contract (what each test-writing agent must deliver)

Each agent receives: the exact file(s) to test, the cases from the row above, the env (node/jsdom), required mocks, and the "confirm-API-via-docs" instruction. Each agent must:

1. Write tests in the correct `tests/<dir>/` location, matching existing style (`describe`/`it`, explicit assertions).
2. **Run the tests** (`npm test -- <path>` or the project filter) and confirm they pass against current behavior. Tests describe what the code *does* today; if a test reveals a real bug, flag it as `DONE_WITH_CONCERNS` rather than silently asserting buggy behavior.
3. Not modify `src/` except where a test genuinely cannot be written without a tiny, behavior-preserving testability seam — and if so, call it out for review.
4. Report status: `DONE` / `DONE_WITH_CONCERNS` / `BLOCKED` / `NEEDS_CONTEXT`, with the list of files added and the pass count.

## Controller review checklist (run after every agent)

- Tests actually run and pass (re-run them; don't trust the report).
- Assertions are meaningful (not `expect(true).toBe(true)` / snapshot-only / tautologies).
- Behavior is characterized correctly (no asserting a bug as intended).
- Mocks are scoped/reset; no test pollution; fake timers restored.
- No accidental `src/` changes beyond approved seams; lint + types still clean.
- Coverage of the row's listed cases is complete.

If any check fails → **create a fix task** (`Fix <task>: <issue>`), block the final task on it, and dispatch a follow-up agent. Re-review until clean.

## Definition of done

All tasks complete; `npm test` and the Playwright suite green; `npm run lint` + `tsc --noEmit` clean; coverage gap scan done; work merged/PR'd via `finishing-a-development-branch`. TDD is the standing rule for everything after this.
