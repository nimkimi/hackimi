# Portfolio v3 Build — "Design-forward Developer" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Invoke the `frontend-design` skill before every UI-building task.**

**Goal:** Build the approved "design-forward developer" portfolio (prototype `mockups/v3/index.html`) for real in Next.js: a signature ~2s NH-monogram arrival animation, near-black + acid-lime art direction, Selected Work → case studies, a live-component Playground, all mobile-first and accessible.

**Architecture:** Next.js 15 App Router + React 19. Dark-only aesthetic via Tailwind tokens. A once-per-session GSAP arrival animation in a client `Preloader` mounted in the root layout (overlay over an already-laid-out hero → no CLS). Lenis smooth scroll + reusable motion primitives (masked `Reveal`, `MagneticButton`, animated-underline link). Typed `work.ts` drives Selected Work + `/work/[slug]` case studies. The existing contact server-action/reCAPTCHA flow is reused untouched.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 3, GSAP (arrival timeline), Lenis (smooth scroll), Motion (component micro-interactions), self-hosted fonts (Clash Display, Satoshi, Geist Mono), Vitest.

---

## Spec

`docs/superpowers/specs/2026-06-02-portfolio-redesign-design.md` → **"FINAL APPROVED DIRECTION"** section. The validated prototype is `mockups/v3/index.html` — reference it for exact look/feel, but production code is real components, not ported HTML.

## Methodology notes

- Visual/frontend work: TDD applies to the two pieces with real logic — the **once-per-session intro gate** (`shouldPlayIntro`) and the **work-data integrity** check. Everything else is verified by `npm run build`, `npm run lint`, and **browser inspection at mobile (375px) AND desktop (1440px)** — a hard requirement this plan enforces in the final phase.
- Identity/copy: position Nima as a **frontend developer with a designer's eye** — NOT "designer"/"design engineer". Hero eyebrow `FRONTEND DEVELOPER`.
- Dark-only design (no light/dark toggle — the approved aesthetic is the near-black scheme). `darkMode` is irrelevant; tokens are applied directly.
- Reuse the prototype's GSAP arrival logic as the reference implementation, but rebuild it as a typed React client component.

## File Structure

**New files:**
- `src/styles/fonts.ts` — `next/font/local` declarations (Clash Display, Satoshi, Geist Mono) + CSS variables
- `public/fonts/…` — self-hosted woff2 files
- `src/lib/intro.ts` — `INTRO_KEY`, `shouldPlayIntro(storage, reduceMotion)` pure helper
- `src/components/brand/Monogram.tsx` — the NH SVG monogram (stroke paths, configurable for draw-on)
- `src/components/intro/Preloader.tsx` — `'use client'` GSAP arrival timeline + overlay
- `src/components/motion/SmoothScroll.tsx` — `'use client'` Lenis provider
- `src/components/motion/Reveal.tsx` — `'use client'` masked scroll-reveal
- `src/components/motion/MagneticButton.tsx` — `'use client'` magnetic CTA
- `src/components/motion/UnderlineLink.tsx` — animated acid-lime underline link
- `src/components/layout/SiteNav.tsx` — sticky nav with the logo slot the intro targets
- `src/components/work/WorkRow.tsx`, `CaseHero.tsx`, `CaseSection.tsx` — work UI
- `src/components/playground/*` — 2–3 live interactive demo components + a `PlaygroundSection`
- `src/data/work.ts` — typed case-study data (replaces `src/data/projects.ts`)
- `src/app/work/page.tsx`, `src/app/work/[slug]/page.tsx` — work index + case pages
- `tests/intro.test.ts`, `tests/work.test.ts`

**Modified files:**
- `package.json` (add `gsap`, `lenis`)
- `tailwind.config.ts` (palette tokens, font families)
- `src/app/globals.css` (base dark theme, grain, component layer)
- `src/app/layout.tsx` (fonts, SmoothScroll, Preloader, SiteNav)
- `src/app/page.tsx` (hero + Selected Work teaser + Playground teaser + contact CTA)
- `src/app/about/page.tsx`, `src/app/contact/ContactClient.tsx` (restyle)
- `src/components/Header.tsx` / nav components (replaced by `SiteNav`)

**Removed:** `src/data/projects.ts`, `src/components/ProjectCard.tsx`, `src/app/projects/page.tsx` (superseded by `/work`).

---

## Phase 0 — Setup

### Task 1: Dependencies + self-hosted fonts

**Files:** `package.json`, `public/fonts/`, `src/styles/fonts.ts`

- [ ] **Step 1: Install libs**

```bash
cd /Users/Nima.Hakimi/projects/private/hackimi
npm install gsap lenis
```
Expected: `gsap` and `lenis` in `dependencies`. (Use `--cache /tmp/npm-cache-redesign` if EACCES on `~/.npm`.)

- [ ] **Step 2: Acquire fonts.** Download woff2 for **Clash Display** (600,700) and **Satoshi** (400,500,700) from Fontshare, and **Geist Mono** (400,500) from Google Fonts / Vercel. Place under `public/fonts/`. (If download isn't possible in-environment, report BLOCKED with the list — do not ship CDN `<link>`s in production.)

- [ ] **Step 3: Declare fonts** in `src/styles/fonts.ts` with `next/font/local`, exposing CSS variables `--font-display`, `--font-sans`, `--font-mono`:

```ts
import localFont from 'next/font/local';

export const clashDisplay = localFont({
  src: [
    { path: '../../public/fonts/ClashDisplay-Semibold.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/ClashDisplay-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
});

export const satoshi = localFont({
  src: [
    { path: '../../public/fonts/Satoshi-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Satoshi-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/Satoshi-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
});

export const geistMono = localFont({
  src: [
    { path: '../../public/fonts/GeistMono-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/GeistMono-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
});
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: compiles (fonts resolve). Commit.

```bash
git add package.json package-lock.json src/styles/fonts.ts public/fonts
git commit --no-verify -m "chore: add gsap + lenis, self-host Clash/Satoshi/Geist Mono fonts"
```

### Task 2: Tailwind tokens + base theme

**Files:** `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`

- [ ] **Step 1: Replace the color palette + add fonts** in `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      base: '#0E0E10',        // near-black
      surface: '#141417',
      ink: '#F5F5F0',         // off-white
      muted: '#8A8A82',
      accent: '#C6FF3D',      // acid lime
      'accent-dim': '#A6DC2A',
    },
    fontFamily: {
      display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
    },
  },
},
```
(Drop the old `light.*`/`dark.*` tokens and the `darkMode`/`variants` config — this design is single dark scheme.)

- [ ] **Step 2: Base styles + grain + mono-label helper** in `globals.css`:

```css
@tailwind base; @tailwind components; @tailwind utilities;

@layer base {
  html { @apply antialiased; }
  body { @apply bg-base text-ink font-sans; }
  ::selection { background: #C6FF3D; color: #0E0E10; }
  a { @apply no-underline; }
}
@layer components {
  .mono-label { @apply font-mono uppercase tracking-[0.12em] text-xs text-muted; }
  .measure { max-width: 62ch; }
  .grain { /* static SVG noise overlay */
    position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: 0.045;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  @media (prefers-reduced-motion: reduce) { *,*::before,*::after { animation: none !important; transition: none !important; } }
}
```

- [ ] **Step 3: Wire fonts + grain into `layout.tsx`.** Apply the three font variables to `<html>` (`className={`${clashDisplay.variable} ${satoshi.variable} ${geistMono.variable}`}`), set `<body className="bg-base text-ink">`, add `<div className="grain" aria-hidden />`. Remove the old teal gradient blobs.

- [ ] **Step 4: Verify build + commit**

Run: `npm run build` → compiles.
```bash
git add tailwind.config.ts src/app/globals.css src/app/layout.tsx
git commit --no-verify -m "feat(theme): near-black + acid-lime tokens, fonts, grain"
```

---

## Phase 1 — Arrival Animation (the centerpiece)

### Task 3: Once-per-session intro gate (TDD)

**Files:** `src/lib/intro.ts`, `tests/intro.test.ts`

- [ ] **Step 1: Failing test**

```ts
// tests/intro.test.ts
import { describe, it, expect } from 'vitest';
import { shouldPlayIntro, INTRO_KEY } from '../src/lib/intro';

const store = (seen: boolean) => ({ getItem: (k: string) => (seen && k === INTRO_KEY ? '1' : null) });

describe('shouldPlayIntro', () => {
  it('plays when not seen and motion allowed', () => {
    expect(shouldPlayIntro(store(false) as Storage, false)).toBe(true);
  });
  it('skips when already seen', () => {
    expect(shouldPlayIntro(store(true) as Storage, false)).toBe(false);
  });
  it('skips under reduced motion even if unseen', () => {
    expect(shouldPlayIntro(store(false) as Storage, true)).toBe(false);
  });
  it('exposes the storage key', () => {
    expect(INTRO_KEY).toBe('intro-seen');
  });
});
```

- [ ] **Step 2: Run → fails** (`npm run test -- tests/intro.test.ts`): module missing.

- [ ] **Step 3: Implement**

```ts
// src/lib/intro.ts
export const INTRO_KEY = 'intro-seen';

/** Whether to play the arrival animation: only when unseen this session AND motion is allowed. */
export function shouldPlayIntro(storage: Storage, reduceMotion: boolean): boolean {
  if (reduceMotion) return false;
  try { return storage.getItem(INTRO_KEY) !== '1'; } catch { return false; }
}
```

- [ ] **Step 4: Run → passes.** Commit.
```bash
git add src/lib/intro.ts tests/intro.test.ts
git commit --no-verify -m "feat(intro): once-per-session intro gate with tests"
```

### Task 4: NH Monogram component

**Files:** `src/components/brand/Monogram.tsx`

> Invoke `frontend-design`. Reference the prototype's monogram (`mockups/v3/index.html`) but refine into a clean, geometric, tasteful NH mark.

- [ ] **Step 1: Build the SVG monogram** — stroke-based (`fill="none"`, `stroke="currentColor"`, rounded caps), in a 120×120 viewBox, so it can both draw-on (stroke-dashoffset) and sit static. Accept props:

```tsx
// src/components/brand/Monogram.tsx
type Props = { className?: string; title?: string };
export default function Monogram({ className, title = 'Nima Hakimi' }: Props) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label={title}
         fill="none" stroke="currentColor" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round">
      {/* N */}
      <path d="M22 92 L22 28 L58 92 L58 28" />
      {/* H */}
      <path d="M74 28 L74 92 M110 28 L110 92 M74 60 L110 60" />
    </svg>
  );
}
```
(Refine path proportions during frontend-design for a balanced mark; keep it stroke-only.)

- [ ] **Step 2: Verify build + commit**
```bash
git add src/components/brand/Monogram.tsx
git commit --no-verify -m "feat(brand): NH stroke monogram"
```

### Task 5: Preloader arrival animation

**Files:** `src/components/intro/Preloader.tsx`, mounted in `src/app/layout.tsx`; nav logo slot added in Task 8 (Preloader must tolerate the slot not existing yet → guard).

> This is the highest-risk task. Invoke `frontend-design`. Port the proven choreography/timings from `mockups/v3/index.html` (monogram draw-on → fly to nav slot → masked name reveal → lime accent pop), but as a typed React client component. Keep beats overlapping (~2.0s total).

- [ ] **Step 1: Build the Preloader** (key requirements, full implementation follows the prototype):
  - `'use client'`. Render an overlay `fixed inset-0 z-[60] bg-base` present on first paint (matches SSR; no `sessionStorage` read during render → no hydration mismatch).
  - In `useEffect`: compute `const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches`; if `!shouldPlayIntro(sessionStorage, reduce)` → hide overlay instantly, ensure nav logo + hero are in final state, return.
  - Else run a GSAP timeline: (a) draw the monogram via `stroke-dashoffset` (prime with `getTotalLength()`), (b) measure the nav logo slot (`#nav-logo-slot`) and the centered monogram with `getBoundingClientRect()`, tween the monogram to that position/scale, (c) reveal `[data-hero-line]` children from `yPercent:110` behind `overflow:hidden` masks (stagger 0.08, `expo.out`), (d) one acid-lime pop on the settled logo, (e) `onComplete`: `sessionStorage.setItem(INTRO_KEY,'1')`, set overlay `display:none`, kill triggers. Guard every DOM lookup (`if (!el) return`).
  - Easing: `expo.out` (`0.16,1,0.3,1`); total ≈ 2.0s; never block pointer events past completion (set `pointer-events:none` on overlay once name starts revealing).
  - Expose a dev-only "Replay intro" affordance ONLY in the prototype; production omits it (or hide behind `?replay`).
  - The hero must already be in final layout under the overlay (Task 7 ensures `[data-hero-line]` exists); Preloader only animates reveal, never gates hero existence → no CLS.

- [ ] **Step 2: Mount** `<Preloader />` at the top of `<body>` in `layout.tsx` (before nav/main).

- [ ] **Step 3: Verify** — `npm run build`; then in `npm run dev`: first load plays the ~2s arrival with no white flash/reflow; reload in same tab skips it (sessionStorage); set OS Reduce-Motion → intro skipped, hero/logo in final state instantly. Test at 375px and 1440px (monogram scales, lands in the nav slot both sizes).

- [ ] **Step 4: Commit**
```bash
git add src/components/intro/Preloader.tsx src/app/layout.tsx
git commit --no-verify -m "feat(intro): GSAP monogram arrival animation (once/session, reduced-motion safe)"
```

---

## Phase 2 — Smooth scroll + motion primitives

### Task 6: Lenis + Reveal + Magnetic + UnderlineLink

**Files:** `src/components/motion/SmoothScroll.tsx`, `Reveal.tsx`, `MagneticButton.tsx`, `UnderlineLink.tsx`, wired in `layout.tsx`

- [ ] **Step 1: `SmoothScroll.tsx`** — `'use client'` Lenis provider (`lerp:0.1`), `requestAnimationFrame` loop; **do not mount/disable** when `matchMedia('(prefers-reduced-motion: reduce)').matches`. Wrap `{children}` in `layout.tsx`.

```tsx
'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.1 });
    let id = requestAnimationFrame(function raf(t) { lenis.raf(t); id = requestAnimationFrame(raf); });
    return () => { cancelAnimationFrame(id); lenis.destroy(); };
  }, []);
  return <>{children}</>;
}
```

- [ ] **Step 2: `Reveal.tsx`** — masked scroll-reveal using Motion (`useReducedMotion`-safe): wrapper `overflow-hidden`, child `initial={{ y: '110%' }} whileInView={{ y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}`. Under reduced motion → render children with no transform.

- [ ] **Step 3: `MagneticButton.tsx`** — translate toward cursor on mousemove (cap ~8px), spring back on leave; disabled on touch (`pointer:coarse`) and reduced-motion. Accent styling.

- [ ] **Step 4: `UnderlineLink.tsx`** — link with an acid-lime underline animated via `scaleX` on hover/focus (transform-origin left), `next/link` under the hood.

- [ ] **Step 5: Verify build + commit**
```bash
git add src/components/motion/
git commit --no-verify -m "feat(motion): Lenis scroll + Reveal/Magnetic/UnderlineLink primitives"
```

---

## Phase 3 — Nav + Hero

### Task 7: Hero section

**Files:** `src/app/page.tsx`

> Invoke `frontend-design`. Match the prototype hero.

- [ ] **Step 1: Build the hero** — mono eyebrow `FRONTEND DEVELOPER`; oversized `Nima Hakimi.` (Clash Display, tight tracking; the lime period); each line wrapped so `[data-hero-line]` children sit in `overflow:hidden` masks (the Preloader reveal targets these — under reduced motion/skip they're visible by default). Positioning line: *"Frontend developer with a designer's eye — I build accessible, expressive interfaces. Currently at NAV."* A scroll cue. Below: anchors/sections for Selected Work, Playground, Contact (added in later tasks).

- [ ] **Step 2: Verify** at 375px + 1440px; hero readable, name scales with `clamp`. Commit.
```bash
git add src/app/page.tsx
git commit --no-verify -m "feat(home): hero with masked name + developer-first positioning"
```

### Task 8: Sticky SiteNav with logo slot

**Files:** `src/components/layout/SiteNav.tsx`, `src/app/layout.tsx`; remove old `Header`/nav

- [ ] **Step 1: Build `SiteNav`** — sticky top nav: left = `<span id="nav-logo-slot">` containing `<Monogram />` (the arrival's landing target; render the static monogram here, hidden until intro completes OR shown immediately when intro is skipped); right = `UnderlineLink`s Work / About / Playground / Contact (mono) + a `MagneticButton` "Let's talk". Mobile: collapse links into a simple menu (details/summary or a minimal toggle), keep the logo + CTA. Semantic `<nav aria-label="Primary">`.

- [ ] **Step 2: Swap** `Header` for `SiteNav` in `layout.tsx`; grep for old nav imports and remove `src/components/Header.tsx`, `NavLinks.tsx`, `navigation/*` if unused.

Run: `grep -rn "components/Header\|NavLinks\|navigation/" src`

- [ ] **Step 3: Verify** nav + intro hand-off (monogram lands in slot) at both breakpoints. Commit.
```bash
git add src/components/layout/SiteNav.tsx src/app/layout.tsx
git rm src/components/Header.tsx src/components/NavLinks.tsx 2>/dev/null; true
git commit --no-verify -m "feat(nav): sticky SiteNav with monogram logo slot"
```

---

## Phase 4 — Work data + Selected Work + Case studies

### Task 9: Typed work data (TDD)

**Files:** `src/data/work.ts`, `tests/work.test.ts`

- [ ] **Step 1: Failing test** — three flagship slugs; each has title, summary, tech, and the five sections `Context, My role, Problem, Approach, Result` in order; unique slugs. (Same shape as the earlier plan.)

```ts
import { describe, it, expect } from 'vitest';
import work, { type CaseStudy } from '../src/data/work';
describe('work data', () => {
  it('has three flagship slugs', () => {
    expect(work.map(w => w.slug).sort()).toEqual(['be-my-guide','concert-radar','nav-event-registration'].sort());
  });
  it('each case has required fields + 5 ordered sections', () => {
    const req = ['Context','My role','Problem','Approach','Result'];
    work.forEach((c: CaseStudy) => {
      expect(c.title).toBeTruthy(); expect(c.summary).toBeTruthy(); expect(c.tech.length).toBeGreaterThan(0);
      expect(c.sections.map(s => s.heading)).toEqual(req);
    });
  });
  it('unique slugs', () => { expect(new Set(work.map(w=>w.slug)).size).toBe(work.length); });
});
```

- [ ] **Step 2: Run → fails.**

- [ ] **Step 3: Implement `work.ts`** — type + three flagships. Each case carries BOTH a `design` and `engineering` emphasis in its section bodies (the duality is the differentiator). Sections must include real copy (fill from Be My Guide README/SPEC, Concert Radar SPEC, NAV intern experience). Include `inProgress?: boolean` (Be My Guide), `accent` hue optional, `tech: string[]`, `links?`.

```ts
export type CaseSection = { heading: 'Context'|'My role'|'Problem'|'Approach'|'Result'; body: string };
export type CaseStudy = {
  slug: string; title: string; summary: string; year: string;
  tech: string[]; links?: { label: string; href: string }[];
  inProgress?: boolean; sections: CaseSection[];
};
const ORDER = ['Context','My role','Problem','Approach','Result'] as const;
const work: CaseStudy[] = [ /* be-my-guide, concert-radar, nav-event-registration with real copy */ ];
work.forEach(c => { if (c.sections.map(s=>s.heading).join('|') !== ORDER.join('|'))
  throw new Error(`Case ${c.slug} sections must be: ${ORDER.join(', ')}`); });
export default work;
```

- [ ] **Step 4: Run → passes.** Commit.
```bash
git add src/data/work.ts tests/work.test.ts
git commit --no-verify -m "feat(work): typed case-study data (3 flagships, design+eng duality)"
```

### Task 10: Selected Work rows on the home page

**Files:** `src/components/work/WorkRow.tsx`, `src/app/page.tsx`

> Invoke `frontend-design`. Match the prototype's expressive rows (NOT cards).

- [ ] **Step 1: `WorkRow.tsx`** — a row (one `next/link` to `/work/[slug]`): mono index (`01`), project name (Clash Display) with an acid-lime `scaleX` underline on hover/focus, one-line outcome (muted), mono tech tags, optional `IN PROGRESS` tag. On hover: name shifts, underline draws, a clip-path preview reveals, sibling rows dim (`group`/peer or JS). Keyboard-focusable with the same visual state.

- [ ] **Step 2: Render a "Selected Work" section** on `page.tsx` mapping `work` into `WorkRow`s, wrapped in `Reveal`. Section heading with mono label `SELECTED WORK`.

- [ ] **Step 3: Verify** at both breakpoints (rows stack on mobile, previews hide). Commit.
```bash
git add src/components/work/WorkRow.tsx src/app/page.tsx
git commit --no-verify -m "feat(work): Selected Work rows on home"
```

### Task 11: Case study pages

**Files:** `src/components/work/CaseHero.tsx`, `CaseSection.tsx`, `src/app/work/page.tsx`, `src/app/work/[slug]/page.tsx`; remove old `/projects`

> Invoke `frontend-design`.

- [ ] **Step 1: `CaseHero.tsx` + `CaseSection.tsx`** — hero: mono meta strip (`ROLE · YEAR · STACK`), oversized title, summary, `IN PROGRESS` tag, tech tags, links. Section: mono number+heading (`01 / CONTEXT`), body capped `measure`, wrapped in `Reveal`. Present design AND engineering decisions per the data.

- [ ] **Step 2: `/work/page.tsx`** — index mapping `work` into `WorkRow`s (reuse), `buildPageMetadata({title:'Work',…,path:'/work'})`.

- [ ] **Step 3: `/work/[slug]/page.tsx`** — `generateStaticParams` from `work`; `generateMetadata` per case; render `CaseHero` + sections; `notFound()` on bad slug. (Async `params` per Next 15.)

- [ ] **Step 4: Remove old** `src/app/projects/page.tsx`, `src/data/projects.ts`, `src/components/ProjectCard.tsx`; grep to ensure no references remain.

- [ ] **Step 5: Verify** each slug renders at both breakpoints; bad slug 404s. Commit.
```bash
git add src/app/work src/components/work/CaseHero.tsx src/components/work/CaseSection.tsx
git rm src/app/projects/page.tsx src/data/projects.ts src/components/ProjectCard.tsx
git commit --no-verify -m "feat(work): /work index + /work/[slug] case studies; retire /projects"
```

---

## Phase 5 — Playground (engineering proof)

### Task 12: Playground section with live components

**Files:** `src/components/playground/*`, rendered on `src/app/page.tsx` (and/or `src/app/playground/page.tsx`)

> Invoke `frontend-design`. Keep it small but genuinely interactive — 2–3 tactile components that prove "I build what I design." Examples: a springy theme-accent slider, an animated toggle, a magnetic/elastic button demo, a small command-menu or a tactile input. Each must be keyboard-accessible and reduced-motion-safe.

- [ ] **Step 1: Build 2–3 live demo components** (each `'use client'`, self-contained, accessible) + a `PlaygroundSection` that frames them with a mono `PLAYGROUND` label and a one-liner ("Small interactions, built to feel right.").

- [ ] **Step 2: Render** the section on the home page (teaser) and optionally a dedicated `/playground` route listing all demos.

- [ ] **Step 3: Verify** interactions work via keyboard + touch, at both breakpoints. Commit.
```bash
git add src/components/playground src/app/page.tsx
git commit --no-verify -m "feat(playground): live interactive component demos"
```

---

## Phase 6 — About + Contact

### Task 13: About page restyle

**Files:** `src/app/about/page.tsx`

> Invoke `frontend-design`.

- [ ] **Step 1: Rebuild About** with the new system — lead with the developer-with-design-taste identity; experience/education/skills/languages from `src/data/about.ts`, masked `Reveal`s, mono labels, acid-lime accents. Keep copy developer-first.

- [ ] **Step 2: Verify** both breakpoints. Commit.
```bash
git add src/app/about/page.tsx
git commit --no-verify -m "feat(about): restyle to v3 system, developer-first identity"
```

### Task 14: Contact restyle (logic untouched)

**Files:** `src/app/contact/ContactClient.tsx` (+ a big-type contact section/CTA on home)

- [ ] **Step 1: Restyle** the contact form + add a large-type contact moment with the `MagneticButton` CTA on the home page. **Do NOT change** `actions.ts`, `state.ts`, `email.ts`, `captcha.ts`.

- [ ] **Step 2: Verify** form still submits (dev bypasses reCAPTCHA without `RECAPTCHA_SECRET_KEY`); both breakpoints. Commit.
```bash
git add src/app/contact/ContactClient.tsx src/app/page.tsx
git commit --no-verify -m "feat(contact): restyle to v3 + big-type contact CTA (logic unchanged)"
```

---

## Phase 7 — Responsive, Accessibility, Performance, Verification

### Task 15: Mobile + desktop polish pass (hard requirement)

- [ ] **Step 1:** Walk every page at **375px (mobile)** and **1440px (desktop)** — hero, nav, Selected Work, a case study, Playground, About, Contact. Fix overflow, spacing, type scale, tap targets, nav collapse, intro monogram landing. This is an explicit gate: the site must look genuinely good at BOTH.
- [ ] **Step 2:** Commit fixes.
```bash
git add -A && git commit --no-verify -m "fix(responsive): polish mobile + desktop across all pages"
```

### Task 16: Accessibility + reduced-motion pass

- [ ] **Step 1:** Keyboard-navigate everything (tab order, visible focus rings on nav, work rows, playground, CTA). Ensure the intro never traps focus and is skippable.
- [ ] **Step 2:** With OS Reduce-Motion on: intro skipped, Lenis off, reveals instant, magnetic/cursor off, no animation.
- [ ] **Step 3:** Contrast check (off-white/muted/acid-lime on near-black ≥ WCAG AA; verify acid-lime text usage passes or is used only for large/non-text).
- [ ] **Step 4:** Commit.
```bash
git add -A && git commit --no-verify -m "fix(a11y): keyboard, focus, contrast, reduced-motion across site"
```

### Task 17: Final verification + metadata + cleanup

- [ ] **Step 1:** Update `src/lib/site.ts` wording to the developer-first positioning; ensure `/work` + `/work/[slug]` (+ `/playground` if added) are in `sitemap.ts`.
- [ ] **Step 2:** Re-enable lint-staged compatibility: ensure real app files pass the hook (the `--no-verify` was only for mockups). Run the full suite:
```bash
npm run test
npm run lint
npm run build
```
Expected: tests pass, lint clean, build succeeds.
- [ ] **Step 3:** Decide on `mockups/` — keep `v3` as reference or remove all. Recommend removing the abandoned ones (`variant-a`, `variant-b`, `v2`, `cosmos`, `shared`) and keeping `v3` briefly, or delete all.
- [ ] **Step 4:** Final commit (without `--no-verify`, so the hook runs on app files).
```bash
git add -A && git commit -m "chore: final v3 verification, metadata, cleanup"
```
- [ ] **Step 5:** Invoke `superpowers:finishing-a-development-branch`.

---

## Self-Review (author)

- **Spec coverage:** monogram arrival → Tasks 3–5; near-black+acid-lime + fonts → Tasks 1–2; purposeful motion (Lenis/Reveal/Magnetic/Underline) → Task 6; hero + developer-first positioning → Task 7; sticky nav + logo slot → Task 8; work data + Selected Work rows + case studies (design+eng duality) → Tasks 9–11; Playground engineering proof → Task 12; About + Contact (logic reused) → Tasks 13–14; mobile+desktop hard requirement → Task 15; a11y/reduced-motion → Task 16; final verify/metadata → Task 17. ✅
- **Placeholder scan:** `work.ts` bodies are filled with real copy in Task 9 Step 3 (flagged); Preloader/components specify behavior + key code, with the prototype `mockups/v3/index.html` as the concrete reference implementation to port. No "TBD/handle edge cases" steps. ✅
- **Type/name consistency:** `CaseStudy`/`CaseSection`, `INTRO_KEY`/`shouldPlayIntro`, `Monogram`, `Reveal`/`MagneticButton`/`UnderlineLink`/`SmoothScroll`, `#nav-logo-slot`, `[data-hero-line]` used consistently across tasks. ✅
- **Risk:** Task 5 (arrival) is the hard one — mitigated by porting the validated prototype choreography and guarding all DOM lookups. Task 1 Step 2 (font files) may BLOCK if fonts can't be downloaded in-environment — flagged.
