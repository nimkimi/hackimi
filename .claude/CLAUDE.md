# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product Direction

This is a **developer portfolio** whose primary audience is **recruiters and hiring managers**. Optimize every decision for demonstrating engineering skill, depth of work, and professional credibility — not for freelance/client conversion.

**Design direction (APPROVED 2026-06-02, originally validated via a now-removed `mockups/v3` prototype): a design-forward developer portfolio with a signature ~2s monogram arrival animation, mobile-first.** Nima is a **frontend developer with a designer's eye** — positioned as a developer, NOT a designer. The site has designer-grade art direction (near-black + acid-lime `#C6FF3D`, Clash Display / Satoshi / Geist Mono) and a signature ~2-second arrival: an NH monogram strokes on → flies into the nav as the logo → name reveals behind masks → one acid-lime pop (once per session; instant under `prefers-reduced-motion`). Purposeful motion only (Lenis scroll, masked reveals, magnetic CTA). Structure: hero, Selected Work rows → case studies, a live-component Playground (engineering proof), About, contact. **Hard requirements:** beautiful on BOTH mobile and desktop (explicitly verified), full a11y (reduced-motion, keyboard, contrast). See the spec's "FINAL APPROVED DIRECTION" section for the build detail. Adds GSAP + Lenis.

Abandoned explorations (all built + rejected, since deleted — the `mockups/` prototypes no longer exist): refined-minimal multi-page (`variant-a`) & long-scroll (`variant-b`) — too understated; high-craft editorial (`v2`) — too quiet/generic; interactive 3D galaxy (`cosmos`) — felt random/gimmicky. The react-three-fiber/3D direction is dead. The approved direction was the former `v3` prototype, now realized in the live app.

Note: earlier `docs/features/` specs and `docs/ROADMAP.md` were written around a freelance/small-business-client framing. That direction is **abandoned** — treat those documents as rough historical notes only, not as commitments.

## Commands

```bash
npm run dev        # Start dev server at localhost:3000
npm run build      # Production build
npm run lint       # ESLint via next lint
npm run test       # Vitest (vitest run) — unit/component/integration
npm run test:e2e   # Playwright end-to-end (boots next dev; specs in e2e/)
npm run format     # Prettier write (ts, tsx, js, jsx, md, css, yaml)
npm run check      # Prettier check (CI)
```

Node version is pinned to `22.4.0` (see `.nvmrc`).

## Testing

**TDD is the standard for all new work** (features and bugfixes): write the failing test first, then the implementation. The existing suite was retrofitted as characterization tests; from here, no behavior change ships without a test.

Two runners, configured in `vitest.config.ts` via `test.projects`:
- **`node` project** — pure logic + server code. Specs in `tests/unit/` (lib, data) and `tests/server/` (server action, captcha, email, sitemap, robots). `server-only` is aliased to a no-op stub; `@/` resolves to `src/`.
- **`jsdom` project** — React (RTL + `@testing-library/jest-dom` + user-event). Specs in `tests/components/` and `tests/integration/` (App Router pages + ContactClient). Global `matchMedia`/`IntersectionObserver`/`ResizeObserver` stubs live in `tests/setup/jsdom-setup.ts`.
- **Playwright** — real-browser E2E in `e2e/` (arrival animation, reduced-motion, scroll reveal, nav/work/contact flows, axe a11y smoke). Reduced-motion in E2E must use `page.emulateMedia({ reducedMotion: 'reduce' })` — `test.use({ reducedMotion })` does NOT propagate to `window.matchMedia`, which `Preloader`/`Reveal` read.

All test tooling is `devDependencies` only — zero production-bundle/runtime impact.

## Environment Variables

Required at runtime for contact form functionality:

| Variable | Purpose |
|---|---|
| `NODEMAILER_EMAIL` | SMTP sender address (required) |
| `NODEMAILER_PASSWORD` | SMTP password (required) |
| `NODEMAILER_HOST` | SMTP host (default: `smtp.hostinger.com`) |
| `NODEMAILER_PORT` | SMTP port (default: `465`) |
| `NODEMAILER_SECURE` | TLS (default: `true` when port is 465) |
| `NODEMAILER_NAME` | Sender display name (default: `Portfolio`) |
| `RECAPTCHA_SECRET_KEY` | Google reCAPTCHA v2 secret — optional in dev, required in prod |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA public site key for the client widget |

In development, reCAPTCHA is bypassed when `RECAPTCHA_SECRET_KEY` is absent.

## Architecture

**Next.js 15 App Router** with React 19 Server Components and Server Actions.

### Key Patterns

**Server/Client split for the contact form** — `src/app/contact/` is the clearest example of the pattern used throughout:
- `page.tsx` is a Server Component that reads env vars and passes them as props
- `ContactClient.tsx` is the `'use client'` component that owns form state via `useActionState`
- `actions.ts` is `'use server'` — validates with Zod, verifies reCAPTCHA, sends two emails (auto-reply to sender + notification to site owner)
- `state.ts` holds the shared `ContactFormState` type

**Site constants** — all personal/site metadata (name, role, employer, social links, OG image, etc.) lives in `src/lib/site.ts`. `src/lib/metadata.ts` consumes it to build Next.js `Metadata` objects and JSON-LD. When adding new pages, use `buildPageMetadata()` for the `export const metadata`.

**Data layer** — static content lives in `src/data/`. Case studies / projects are typed in `src/data/work.ts` (a `CaseStudy[]` with a 5-section narrative, tech, optional images, `inProgress` flag); about info is in `src/data/about.ts`. Add new projects to `src/data/work.ts`.

**Styling** — Tailwind with a single dark color scheme (no light/dark theming, no `darkMode` config). The palette is a flat set of tokens in `tailwind.config.ts`: `base` (`#0E0E10`), `surface`, `ink`, `muted`, `accent` (`#C6FF3D`), `accent-dim`. The old reusable component classes (`.card`/`.btn`/`.btn-accent`/`.btn-outline`/`.muted`) and the two-theme palette have been removed. The current helper classes in `globals.css` (`@layer components`) are `.mono-label` (mono uppercase tracked label), `.measure` (62ch max-width), and `.grain` (fixed noise overlay).

**Server-only modules** — `src/lib/email.ts` and `src/lib/captcha.ts` both import `'server-only'` and must never be imported from client components.

## Feature Development

Before starting new work, check `docs/ROADMAP.md` — it lists what's in progress, what's planned next, and what's been shipped.

When a feature is complete, move it to the Done table in `docs/ROADMAP.md` with the ship date.

Feature specs live in `docs/features/`. Use `docs/features/_template.md` as the starting point for new specs. A spec should have enough detail (acceptance criteria, relevant files, design notes) that implementation can proceed without clarifying questions.
