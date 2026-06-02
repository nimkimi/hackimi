# Portfolio Redesign — Design Spec

**Date:** 2026-06-02
**Status:** SUPERSEDED — see the LATEST "Direction Change" immediately below. Earlier sections retained for history only.
**Repo:** `projects/private/hackimi`

---

## ⚠️ Direction Change #2 (2026-06-02) — "Designer × Developer" + signature arrival animation (CURRENT)

The interactive 3D "Developer Cosmos" below was also **rejected** ("felt random / gimmicky / not me"). The key realization: the client is a **developer AND a designer** (design-engineer hybrid), so the site should read like a strong **designer's portfolio backed by developer substance** — expressive, art-directed, slick color, with **purposeful** motion (nothing random/decorative).

**Current locked direction:**
- A **design-forward "designer × developer" portfolio**: designer-grade typography, color, and layout creativity + real engineering credibility (the three flagship case studies).
- A signature **~2-second arrival/intro animation** on first load that creates a positive, uplifting feeling (e.g. masked text reveal / curtain wipe / monogram draw — TBD from research). Once per session; `prefers-reduced-motion` → instant. Mobile-first.
- Motion is expressive but INTENTIONAL — every element earns its place.
- Reduced-motion fallback mandatory (a11y specialist).
- Concrete art direction, intro concept, palette, and structure are being finalized from a design-portfolio research pass + a built prototype.

Everything below (Direction Change #1 "Developer Cosmos" and the original refined-minimal spec) is **historical/abandoned**. Still carried forward: recruiter audience, the three flagships (Be My Guide [In progress], Concert Radar, NAV event-registration), typed `work.ts` data, reuse of the existing contact server-action, dedicated case pages.

---

## ⚠️ Direction Change #1 (2026-06-02) — "Developer Cosmos" (ABANDONED)

After reviewing mockups, the refined-minimal/editorial direction and the A/B (multi-page vs long-scroll) structure question below were **rejected** as too understated and generic. This direction was then ALSO abandoned (see Direction Change #2 above).

**An immersive, bold, interactive 3D ("Developer Cosmos"), mobile-first.**

- **Hero / core experience:** an interactive WebGL galaxy built with **react-three-fiber + three.js**. Each featured project is a glowing planet/world. The visitor can **drag to orbit**, **scroll to fly** through space, and **click a world to open its case study**. Ties to Nima's stated cosmology interest; gives a navigation metaphor no template has.
- **Art direction:** vibrant, rich, alive — deep-space base with vibrant nebula accents, bloom/glow, real depth. Explicitly NOT understated. (Earlier coral-on-warm-neutral palette is superseded; final palette TBD with the cosmos art direction.)
- **Mobile-first:** designed for phones first; aggressive performance budgeting (DPR clamp, demand frameloop, particle/geometry limits, adaptive quality), touch orbit + pinch.
- **Accessibility (mandatory):** a non-3D fallback for `prefers-reduced-motion` / low-power / no-WebGL — a clean, accessible DOM list of projects and content. Keyboard-navigable; no focus trapped in canvas.
- **Still in scope from the original spec below:** dedicated case page per flagship project; the three flagships (Be My Guide [In progress], Concert Radar, NAV event-registration); typed `work.ts` data; reuse of the existing contact server-action; recruiter audience.
- **New dependencies:** `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` (+ possibly `maath`/`gsap` for easing, `@react-three/rapier` only if physics is needed). 3D bundle lazy-loaded via dynamic import (`ssr: false`).

The concrete cosmos recipe, performance plan, and a revised implementation plan will be produced after a hero prototype is validated. Everything below this section is the original (superseded) refined-minimal spec, kept for history.

---

## Goal

Redesign the entire portfolio into a polished, animation-rich **developer portfolio whose primary audience is recruiters and hiring managers**. Every decision optimizes for demonstrating engineering skill, depth of work, and professional credibility — not freelance/client conversion. Add a dedicated case page per featured project.

This supersedes the earlier freelance/small-business framing in `docs/features/` and `docs/ROADMAP.md`; those are historical notes, not commitments. `CLAUDE.md` has been updated to record this direction.

## Direction & Principles

- **Aesthetic:** refined-minimal and warm. Generous whitespace, confident typography, one warm accent, tasteful motion. Reference feel: Stripe / Linear / senior-IC.
- **Accent:** coral / terracotta over warm neutrals. Cream/paper light canvas; warm-charcoal dark canvas.
- **Theme:** full light + dark palettes, plus a **manual theme toggle** layered on top of system preference.
- **Motion:** "fancy" but tasteful, built with the Motion (Framer Motion) library. Always respects `prefers-reduced-motion`.
- **Accessibility is a first-class constraint** (it is Nima's specialty): semantic markup, keyboard support, visible focus, reduced-motion fallbacks, sufficient contrast in both themes.
- **Stack unchanged:** Next.js 15 App Router, React 19 (Server Components + Server Actions), Tailwind CSS, TypeScript.

## Key Decision Deferred by Design: Two-Mockup Gate

The user cannot choose the site structure from text alone. Therefore the **first implementation deliverable is two complete, self-contained static HTML mockups** of the same content, so the user can compare them for real and pick one before any Next.js build:

- **Mockup A — Streamlined multi-page**
  - `/` — hero + featured work teaser + condensed skills + contact CTA
  - `/work` — case index (grid of flagship cases)
  - `/about` — bio, experience, education, skills, languages
  - `/contact` — existing form, restyled
- **Mockup B — Single long-scroll**
  - One immersive page: hero → about → work → contact, with anchor nav
- **Common to both:** standalone **case pages** at `/work/[slug]` exist regardless of which homepage structure wins.

Both mockups use the real coral/neutral palette (light + dark) and representative sample animations, so the comparison is honest. After the user picks, we build the chosen structure for real in Next.js. The mockups are throwaway HTML/CSS used only for the decision — not the production implementation.

## Color System

Token-based, defined in `tailwind.config.ts`; exact hex values tuned during the mockup phase. Replaces the current teal-based `light.*` / `dark.*` tokens.

- **Light:** warm cream/paper background, near-black ink text, muted warm-gray secondary text, coral accent, soft coral-tinted card surfaces.
- **Dark:** warm-charcoal background, soft sand text, dimmer warm-gray secondary, slightly brighter coral that pops without glowing.
- **Theme toggle:** header control cycling **system → light → dark**, persisted to `localStorage`. An inline pre-paint script sets the theme class on `<html>` before first paint to avoid a flash of incorrect theme.
- **Tailwind change:** switch `darkMode: 'media'` → `darkMode: 'class'`, with a system-preference fallback applied by the inline script when no explicit choice is stored.

## Animation Language (Motion)

Add the `motion` library. A small set of **reusable motion primitives** keeps motion consistent rather than ad hoc:

- Scroll-triggered fade/slide reveals, staggered for lists and grids.
- Subtle springy hover states on cards, buttons, and key links.
- Hero entrance sequence; smooth section/route transitions.
- A few signature touches (e.g. animated gradient/grain in the hero, underline-draw or magnetic effect on primary links), tuned to stay tasteful.
- A global reduced-motion guard collapses all motion to instant/opacity-only when `prefers-reduced-motion: reduce`.

## Case Pages (core new content)

A reusable case template:

- Hero image + project title + one-line impact statement.
- Body sections: **Context · My role · Problem · Approach · Result**.
- Plain-language tech list.
- Optional screenshot gallery.
- Optional live-demo / repository link.
- Optional **"In progress"** badge.
- Degrades gracefully to text-only (for NDA-limited work without visuals/links).

**Data layer:** move from the thin `src/data/projects.ts` to a richer typed `src/data/work.ts`. Each entry: `slug`, `title`, `summary`, `heroImage`, ordered `sections`, `tech[]`, optional `links`, and visibility/status flags (e.g. `inProgress`, `hasLiveDemo`).

### Featured cases (flagships only)

Three deep cases — quality over quantity:

1. **Be My Guide** *(badge: In progress)* — request-broadcast matching connecting visually-impaired Norwegians with sighted volunteer guides (running/hiking/skiing). Auth.js v5, Neon Postgres + Prisma, Upstash rate-limiting, web-push, Vercel BotID, TS strict, Vitest. Lead case: mission + accessibility + serious architecture. Path: `projects/private/be-my-guide`.
2. **Concert Radar** — Spotify-connected concert discovery aggregating Ticketmaster, Bandsintown, Songkick & Billetto; alerts when followed artists play within a chosen radius. Spotify OAuth, daily Vercel Cron syncs, Resend email, Prisma + Turso/libSQL, Next.js 16, Vitest. Systems-integration story; live-demo potential. Path: `projects/private/concert-radar`.
3. **NAV event-registration app** — internal event registration platform led end-to-end during the 2023 NAV internship; replaced a manual process and became NAV's primary tool for internal events. Next.js, Kotlin/Ktor, PostgreSQL. Work credibility; text + limited non-sensitive screenshots only.

Secondary projects (NAV Min side, TV 2 Skole accessibility, this portfolio) are **out of scope for now**; the data model leaves room to add them later without redesign.

## Page-by-page content

- **Home / Hero:** name, role, one-line positioning, photo, primary CTAs (Work, Contact, GitHub), featured-work teaser, condensed skills.
- **About:** existing experience / education / skills / languages from `src/data/about.ts`, restyled with reveal animations and a sharpened narrative summary.
- **Work + case pages:** index + `/work/[slug]` cases as above.
- **Contact:** reuse the existing server-action + reCAPTCHA flow (`src/app/contact/`) untouched in logic; restyle to match.

## Reuse & code health

- Keep the existing server/client split pattern (contact form is the reference).
- Keep `src/lib/site.ts` as the single source of site constants; extend as needed.
- Keep `buildPageMetadata()` usage for new routes (`/work`, `/work/[slug]`).
- Refresh `globals.css` component layer (`.card`, `.btn`, `.btn-accent`, `.btn-outline`, `.muted`) to the new palette and motion-friendly states.
- Server-only modules (`email.ts`, `captcha.ts`) remain server-only.

## Out of Scope (YAGNI)

- No services / pricing / blog / testimonials / i18n / newsletter / cost-estimator (the abandoned freelance backlog).
- No CMS — content stays as typed data files.
- No test suite added as part of this redesign (separate concern; existing projects already have Vitest).
- Contact/email/captcha logic reused as-is, not rewritten.

## Success Criteria

- Two comparable HTML mockups (A and B) delivered; user picks a structure.
- Chosen structure built in Next.js with coral light/dark palette + working manual theme toggle (no flash).
- Three flagship case pages live via `/work/[slug]` from `src/data/work.ts`.
- Motion reveals/interactions present and fully disabled under `prefers-reduced-motion`.
- Accessible: keyboard-navigable, visible focus, adequate contrast in both themes.
- Lighthouse/visual quality clearly above the current site; site reads as a credible senior front-end developer's portfolio.

## Open Questions (resolve during implementation, not blocking)

- Exact coral + neutral hex ramps (tuned in mockups).
- Whether Concert Radar's case includes a live deployed demo link.
- Final hero "signature" animation choice.
