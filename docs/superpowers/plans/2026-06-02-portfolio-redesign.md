> **SUPERSEDED (2026-06-02):** This plan was for the abandoned refined-minimal direction. The live plan is `2026-06-02-portfolio-v3-build.md` (design-forward developer + monogram arrival).

# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the hackimi portfolio into a polished, animation-rich developer portfolio for recruiters, with coral/warm light+dark theming, a manual theme toggle, and a dedicated case page per flagship project.

**Architecture:** Decide the homepage structure via two throwaway HTML mockups (multi-page vs long-scroll), then build the chosen structure in the existing Next.js 15 App Router stack. New typed `work.ts` data layer feeds reusable case pages at `/work/[slug]`. Motion (Framer Motion) provides reusable scroll-reveal/hover primitives; all motion respects `prefers-reduced-motion`. Tailwind moves from `darkMode: 'media'` to `darkMode: 'class'` with a no-flash inline theme script.

**Tech Stack:** Next.js 15 App Router, React 19 (Server Components + Server Actions), TypeScript, Tailwind CSS 3, Motion (`motion` package), Tabler icons.

---

## Spec

See `docs/superpowers/specs/2026-06-02-portfolio-redesign-design.md`.

## Notes on methodology

This is primarily visual/frontend work. TDD is applied to the two pieces with real logic and a unit-test surface: the **theme resolution helper** and the **work-data integrity check**. The portfolio has no test runner yet, so Task 1 adds Vitest (the same runner already used in the user's other projects). Visual tasks are verified by `npm run build`, `npm run lint`, and browser inspection rather than unit tests.

**When building any UI (mockups, components, pages): invoke the `frontend-design` skill first** for high design quality, then implement.

## File Structure

**New files:**
- `mockups/variant-a/index.html`, `mockups/variant-a/work.html`, `mockups/variant-a/about.html` — multi-page mockup
- `mockups/variant-b/index.html` — single long-scroll mockup
- `mockups/shared/case.html` — shared case-page mockup (used by both variants)
- `mockups/shared/theme.css` — shared coral light/dark CSS variables + reveal styles for mockups
- `src/lib/theme.ts` — pure theme-resolution helper (`resolveTheme`) + constants
- `src/components/ThemeScript.tsx` — inline pre-paint no-flash script
- `src/components/ThemeToggle.tsx` — `'use client'` system→light→dark toggle
- `src/components/motion/Reveal.tsx` — `'use client'` scroll-reveal primitive
- `src/components/motion/Stagger.tsx` — `'use client'` staggered container primitive
- `src/data/work.ts` — typed work/case data (replaces thin `projects.ts`)
- `src/app/work/page.tsx` — case index
- `src/app/work/[slug]/page.tsx` — case page template
- `src/components/work/CaseHero.tsx`, `src/components/work/CaseSection.tsx`, `src/components/work/CaseCard.tsx` — case UI
- `tests/theme.test.ts`, `tests/work.test.ts` — unit tests
- `vitest.config.ts` — test runner config

**Modified files:**
- `package.json` — add `motion`, `vitest`; add `test` script
- `tailwind.config.ts` — `darkMode: 'class'`, coral/warm token palette
- `src/app/globals.css` — refreshed component layer for new palette
- `src/app/layout.tsx` — mount `ThemeScript`, swap background treatment
- `src/components/Header.tsx` — add `ThemeToggle`, `/work` nav link
- `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/contact/ContactClient.tsx` — restyle + reveals
- `src/components/NavLinks.tsx` / `src/components/navigation/*` — add Work link
- Remove/replace: `src/data/projects.ts`, `src/components/ProjectCard.tsx`, `src/app/projects/page.tsx` (superseded by `/work`)

---

## Phase 0 — Setup

### Task 1: Branch, dependencies, and test runner

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Create a feature branch**

```bash
cd /Users/Nima.Hakimi/projects/private/hackimi
git checkout -b redesign-portfolio
```

- [ ] **Step 2: Install runtime + dev dependencies**

```bash
npm install motion
npm install -D vitest
```

Expected: `motion` appears in `dependencies`, `vitest` in `devDependencies`.

- [ ] **Step 3: Add a test script to `package.json`**

In the `scripts` block add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 5: Verify the runner works (no tests yet is OK)**

Run: `npm run test`
Expected: Vitest runs and reports "No test files found" or exits 0. (If it errors on "no tests", that is acceptable for this step.)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add motion + vitest, create redesign branch"
```

---

## Phase 1 — Two HTML Mockups (DECISION GATE)

> Invoke the `frontend-design` skill before building the mockups. These are throwaway static files used only to choose a homepage structure. Use the real coral light/dark palette and representative scroll-reveal animations so the comparison is honest. Tailwind Play CDN (`<script src="https://cdn.tailwindcss.com"></script>`) plus a small vanilla-JS IntersectionObserver for reveals keeps each file self-contained.

### Task 2: Shared mockup palette + reveal styles

**Files:**
- Create: `mockups/shared/theme.css`

- [ ] **Step 1: Define coral light/dark CSS variables and reveal styles**

```css
/* mockups/shared/theme.css — throwaway mockup styling */
:root {
  --bg: #FBF7F2;          /* warm paper */
  --surface: #FFFFFFAA;
  --ink: #1F1A17;         /* near-black warm */
  --muted: #6F635B;       /* warm gray */
  --accent: #E2674A;      /* coral */
  --accent-strong: #C9502F;
  --ring: #E2674A55;
}
:root.dark {
  --bg: #17120F;          /* warm charcoal */
  --surface: #221B16AA;
  --ink: #F2E9E2;         /* soft sand */
  --muted: #A89C92;
  --accent: #F07A5C;      /* brighter coral */
  --accent-strong: #F49379;
  --ring: #F07A5C55;
}
body { background: var(--bg); color: var(--ink); }
.muted { color: var(--muted); }
.accent { color: var(--accent); }
.reveal { opacity: 0; transform: translateY(12px); transition: opacity .6s ease, transform .6s ease; }
.reveal.in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

- [ ] **Step 2: Commit**

```bash
git add mockups/shared/theme.css
git commit -m "feat(mockups): shared coral palette + reveal styles"
```

### Task 3: Shared case-page mockup

**Files:**
- Create: `mockups/shared/case.html`

- [ ] **Step 1: Build the case page mockup**

Single HTML file linking `../shared/theme.css`, Tailwind Play CDN, with: a back link, case hero (title + one-line impact + "In progress" badge demo), a tech list, and the section sequence **Context / My role / Problem / Approach / Result**, plus a placeholder screenshot block. Include a small script that adds `.in` to `.reveal` elements via IntersectionObserver, and a theme toggle button that toggles `document.documentElement.classList.toggle('dark')`. Use Be My Guide as the sample content.

Minimum skeleton (expand with real layout/spacing during frontend-design):

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Case — Be My Guide</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="theme.css" />
</head>
<body class="font-sans">
  <header class="max-w-3xl mx-auto px-6 py-6 flex justify-between">
    <a href="#" class="accent">← Back to work</a>
    <button id="t" class="border rounded px-3 py-1">Theme</button>
  </header>
  <main class="max-w-3xl mx-auto px-6 py-10 space-y-12">
    <section class="reveal">
      <span class="inline-block text-xs rounded-full px-2 py-1 border accent">In progress</span>
      <h1 class="text-4xl sm:text-5xl font-extrabold mt-4">Be My Guide</h1>
      <p class="muted text-lg mt-3">Matching visually-impaired runners with sighted volunteer guides.</p>
      <ul class="flex flex-wrap gap-2 mt-4 text-sm muted">
        <li class="border rounded-full px-3 py-1">Next.js</li>
        <li class="border rounded-full px-3 py-1">Auth.js</li>
        <li class="border rounded-full px-3 py-1">Postgres/Prisma</li>
        <li class="border rounded-full px-3 py-1">Web Push</li>
      </ul>
    </section>
    <section class="reveal"><h2 class="text-xl font-bold mb-2">Context</h2><p class="muted">…</p></section>
    <section class="reveal"><h2 class="text-xl font-bold mb-2">My role</h2><p class="muted">…</p></section>
    <section class="reveal"><h2 class="text-xl font-bold mb-2">Problem</h2><p class="muted">…</p></section>
    <section class="reveal"><h2 class="text-xl font-bold mb-2">Approach</h2><p class="muted">…</p></section>
    <section class="reveal"><h2 class="text-xl font-bold mb-2">Result</h2><p class="muted">…</p></section>
  </main>
  <script>
    const io = new IntersectionObserver((es) => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: .15 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    document.getElementById('t').onclick = () => document.documentElement.classList.toggle('dark');
  </script>
</body>
</html>
```

- [ ] **Step 2: Open in a browser and verify** reveals fire on scroll and the theme toggle flips coral light↔dark.

Run: `open mockups/shared/case.html`

- [ ] **Step 3: Commit**

```bash
git add mockups/shared/case.html
git commit -m "feat(mockups): shared case-page mockup"
```

### Task 4: Variant A — streamlined multi-page mockup

**Files:**
- Create: `mockups/variant-a/index.html`, `mockups/variant-a/work.html`, `mockups/variant-a/about.html`

- [ ] **Step 1: Build `index.html`** — hero (name, role, one-liner, photo placeholder, CTAs: Work/Contact/GitHub), a "Featured work" teaser row linking to `work.html` and `../shared/case.html`, and a condensed skills strip. Reuse the Tailwind CDN + `theme.css` + reveal/toggle script pattern from Task 3. Top nav links: Home / Work / About / Contact.

- [ ] **Step 2: Build `work.html`** — a grid of three flagship case cards (Be My Guide [In progress], Concert Radar, NAV event-registration), each linking to `../shared/case.html`. Staggered reveals.

- [ ] **Step 3: Build `about.html`** — bio summary, experience timeline, skills, languages, restyled. Reveals on scroll.

- [ ] **Step 4: Verify** all three pages in a browser; nav links work, theme toggle persists per page (mockups need not share state).

Run: `open mockups/variant-a/index.html`

- [ ] **Step 5: Commit**

```bash
git add mockups/variant-a
git commit -m "feat(mockups): variant A — streamlined multi-page"
```

### Task 5: Variant B — single long-scroll mockup

**Files:**
- Create: `mockups/variant-b/index.html`

- [ ] **Step 1: Build the long-scroll page** — one page with anchor nav (Home/About/Work/Contact scroll to `#about`, `#work`, `#contact`) flowing hero → about → work (3 case cards linking to `../shared/case.html`) → contact form mock. Heavier scroll-reveal/parallax feel than Variant A. Same `theme.css` + toggle pattern.

- [ ] **Step 2: Verify** in a browser: anchor nav scrolls smoothly, sections reveal on scroll, theme toggle works.

Run: `open mockups/variant-b/index.html`

- [ ] **Step 3: Commit**

```bash
git add mockups/variant-b
git commit -m "feat(mockups): variant B — single long-scroll"
```

### Task 6: 🚦 DECISION GATE — user picks the structure

- [ ] **Step 1:** Present both variants to the user (open `mockups/variant-a/index.html` and `mockups/variant-b/index.html`). Ask which homepage structure to build. **Stop and wait for the answer.**

- [ ] **Step 2:** Record the choice at the top of this plan as `> CHOSEN STRUCTURE: Variant A (multi-page)` or `> CHOSEN STRUCTURE: Variant B (long-scroll)`. All subsequent "home/structure" tasks follow that choice.

- [ ] **Step 3: Commit the decision note**

```bash
git add docs/superpowers/plans/2026-06-02-portfolio-redesign.md
git commit -m "docs: record chosen portfolio structure"
```

---

## Phase 2 — Theme Foundation (palette + dark-mode toggle, no flash)

### Task 7: Theme resolution helper (TDD)

**Files:**
- Create: `src/lib/theme.ts`
- Test: `tests/theme.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/theme.test.ts
import { describe, it, expect } from 'vitest';
import { resolveTheme, THEME_KEY, type ThemeChoice } from '../src/lib/theme';

describe('resolveTheme', () => {
  it('returns explicit light when chosen', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('light', false)).toBe('light');
  });
  it('returns explicit dark when chosen', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
  });
  it('follows system when choice is "system"', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });
  it('exposes a stable storage key', () => {
    expect(THEME_KEY).toBe('theme');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/theme.test.ts`
Expected: FAIL — cannot find module `../src/lib/theme`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/theme.ts
export const THEME_KEY = 'theme';
export type ThemeChoice = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

/** Resolve the actual theme to apply, given the stored choice and whether the OS prefers dark. */
export function resolveTheme(choice: ThemeChoice, systemPrefersDark: boolean): ResolvedTheme {
  if (choice === 'light' || choice === 'dark') return choice;
  return systemPrefersDark ? 'dark' : 'light';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tests/theme.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/theme.ts tests/theme.test.ts
git commit -m "feat(theme): theme resolution helper with tests"
```

### Task 8: Tailwind coral palette + class dark mode

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Switch dark mode and replace the color tokens**

Change `darkMode: 'media'` to `darkMode: 'class'`. Replace the `colors.light` / `colors.dark` blocks with the coral/warm palette (hex mirrors the mockup `theme.css`):

```ts
colors: {
  light: {
    background: '#FBF7F2',
    primary: '#1F1A17',
    secondary: '#6F635B',
    accent: '#E2674A',
    accentStrong: '#C9502F',
    text: '#1F1A17',
  },
  dark: {
    background: '#17120F',
    primary: '#F2E9E2',
    secondary: '#A89C92',
    accent: '#F07A5C',
    accentStrong: '#F49379',
    text: '#F2E9E2',
  },
},
```

Keep the existing `keyframes`/`animation` blocks.

- [ ] **Step 2: Remove the now-redundant `variants.extend` dark overrides** (class strategy handles `dark:` automatically). Delete:

```ts
variants: {
  extend: {
    backgroundColor: ['dark'],
    textColor: ['dark'],
  },
},
```

- [ ] **Step 3: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds (pages may still look teal-less; that's fine).

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat(theme): coral palette + class-based dark mode"
```

### Task 9: No-flash inline theme script

**Files:**
- Create: `src/components/ThemeScript.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create the inline pre-paint script component**

```tsx
// src/components/ThemeScript.tsx
// Runs before paint to set the `dark` class on <html>, avoiding a flash of wrong theme.
export default function ThemeScript() {
  const js = `(function(){try{
    var c = localStorage.getItem('theme') || 'system';
    var d = c === 'dark' || (c === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', d);
  }catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
```

- [ ] **Step 2: Mount it in `<head>` of `layout.tsx`**

Add `import ThemeScript from '@/components/ThemeScript';` and render `<head><ThemeScript /></head>` inside `<html>` (before `<body>`). Keep `lang="en"`. Add `suppressHydrationWarning` to the `<html>` tag since the class is set client-side before React hydrates:

```tsx
<html lang="en" suppressHydrationWarning>
  <head>
    <ThemeScript />
  </head>
  <body className="...">
```

- [ ] **Step 3: Verify no flash**

Run: `npm run dev`, set OS to dark, hard-refresh `http://localhost:3000`. Expected: page loads dark with no white flash. Set OS to light, refresh: loads light.

- [ ] **Step 4: Commit**

```bash
git add src/components/ThemeScript.tsx src/app/layout.tsx
git commit -m "feat(theme): no-flash inline theme script"
```

### Task 10: ThemeToggle component

**Files:**
- Create: `src/components/ThemeToggle.tsx`
- Modify: `src/components/Header.tsx`

- [ ] **Step 1: Build the toggle**

```tsx
// src/components/ThemeToggle.tsx
'use client';
import { useEffect, useState } from 'react';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';
import { THEME_KEY, resolveTheme, type ThemeChoice } from '@/lib/theme';

const ORDER: ThemeChoice[] = ['system', 'light', 'dark'];
const ICON = { system: IconDeviceDesktop, light: IconSun, dark: IconMoon } as const;
const LABEL = { system: 'System theme', light: 'Light theme', dark: 'Dark theme' } as const;

export default function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = (localStorage.getItem(THEME_KEY) as ThemeChoice) || 'system';
    setChoice(stored);
  }, []);

  function apply(next: ThemeChoice) {
    setChoice(next);
    localStorage.setItem(THEME_KEY, next);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', resolveTheme(next, prefersDark) === 'dark');
  }

  function cycle() {
    apply(ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length]);
  }

  if (!mounted) return <span className="h-9 w-9" aria-hidden />;
  const Icon = ICON[choice];
  return (
    <button
      onClick={cycle}
      aria-label={`${LABEL[choice]} (click to change)`}
      title={LABEL[choice]}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 border-light-accent/40 dark:border-dark-accent/40 transition-colors hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-light-accent/40"
    >
      <Icon size={18} aria-hidden />
    </button>
  );
}
```

- [ ] **Step 2: Mount it in `Header.tsx`** next to the nav links (place at the end of the header row).

- [ ] **Step 3: Verify**

Run: `npm run dev`. Click the toggle: cycles system → light → dark, persists across refresh, no flash.

- [ ] **Step 4: Commit**

```bash
git add src/components/ThemeToggle.tsx src/components/Header.tsx
git commit -m "feat(theme): manual theme toggle in header"
```

---

## Phase 3 — Motion Primitives

### Task 11: Reveal + Stagger components

**Files:**
- Create: `src/components/motion/Reveal.tsx`, `src/components/motion/Stagger.tsx`

- [ ] **Step 1: Build `Reveal`** (scroll-triggered fade/slide; reduced-motion safe — Motion auto-respects `useReducedMotion`)

```tsx
// src/components/motion/Reveal.tsx
'use client';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

export default function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Build `Stagger`** (a container that staggers `Reveal`/`motion` children)

```tsx
// src/components/motion/Stagger.tsx
'use client';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

export default function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: compiles; no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/motion/
git commit -m "feat(motion): Reveal + Stagger primitives (reduced-motion safe)"
```

---

## Phase 4 — Work Data + Case Pages

### Task 12: Typed work data (TDD on integrity)

**Files:**
- Create: `src/data/work.ts`
- Test: `tests/work.test.ts`

- [ ] **Step 1: Write the failing integrity test**

```ts
// tests/work.test.ts
import { describe, it, expect } from 'vitest';
import work, { type CaseStudy } from '../src/data/work';

describe('work data', () => {
  it('has the three flagship cases', () => {
    expect(work.map((w) => w.slug).sort()).toEqual(
      ['be-my-guide', 'concert-radar', 'nav-event-registration'].sort()
    );
  });
  it('every case has required fields and the five narrative sections', () => {
    const required = ['Context', 'My role', 'Problem', 'Approach', 'Result'];
    work.forEach((c: CaseStudy) => {
      expect(c.title).toBeTruthy();
      expect(c.summary).toBeTruthy();
      expect(c.tech.length).toBeGreaterThan(0);
      expect(c.sections.map((s) => s.heading)).toEqual(required);
    });
  });
  it('slugs are unique', () => {
    expect(new Set(work.map((w) => w.slug)).size).toBe(work.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/work.test.ts`
Expected: FAIL — cannot find module `../src/data/work`.

- [ ] **Step 3: Implement `work.ts`** with the type and three flagship entries (fill `sections` body copy from the real projects; placeholders shown for body text only — headings must match exactly)

```ts
// src/data/work.ts
export type CaseSection = { heading: 'Context' | 'My role' | 'Problem' | 'Approach' | 'Result'; body: string };
export type CaseLink = { label: string; href: string };
export type CaseStudy = {
  slug: string;
  title: string;
  summary: string;          // one-line impact
  heroImage?: string;       // optional; degrade to text-only
  tech: string[];
  links?: CaseLink[];
  inProgress?: boolean;
  sections: CaseSection[];  // exactly the 5 narrative sections, in order
};

const SECTION_ORDER = ['Context', 'My role', 'Problem', 'Approach', 'Result'] as const;

const work: CaseStudy[] = [
  {
    slug: 'be-my-guide',
    title: 'Be My Guide',
    summary: 'Matching visually-impaired Norwegians with sighted volunteer guides for running, hiking, and skiing.',
    tech: ['Next.js 16', 'TypeScript', 'Auth.js v5', 'Neon Postgres', 'Prisma', 'Upstash Redis', 'Web Push', 'Vercel BotID', 'Vitest'],
    links: [{ label: 'GitHub', href: 'https://github.com/nimkimi' }],
    inProgress: true,
    sections: [
      { heading: 'Context', body: '…' },
      { heading: 'My role', body: '…' },
      { heading: 'Problem', body: '…' },
      { heading: 'Approach', body: '…' },
      { heading: 'Result', body: '…' },
    ],
  },
  {
    slug: 'concert-radar',
    title: 'Concert Radar',
    summary: 'A Spotify-connected app that alerts you when artists you love announce shows within your radius.',
    tech: ['Next.js 16', 'TypeScript', 'Prisma', 'Turso/libSQL', 'Auth.js', 'Resend', 'Vercel Cron', 'Vitest'],
    links: [{ label: 'GitHub', href: 'https://github.com/nimkimi' }],
    sections: [
      { heading: 'Context', body: '…' },
      { heading: 'My role', body: '…' },
      { heading: 'Problem', body: '…' },
      { heading: 'Approach', body: '…' },
      { heading: 'Result', body: '…' },
    ],
  },
  {
    slug: 'nav-event-registration',
    title: 'NAV Event Registration',
    summary: "Internal event-registration platform I led end-to-end; now NAV's primary tool for internal events.",
    tech: ['Next.js', 'Kotlin/Ktor', 'PostgreSQL'],
    sections: [
      { heading: 'Context', body: '…' },
      { heading: 'My role', body: '…' },
      { heading: 'Problem', body: '…' },
      { heading: 'Approach', body: '…' },
      { heading: 'Result', body: '…' },
    ],
  },
];

// Dev-time guard so headings never drift from the template contract.
work.forEach((c) => {
  const headings = c.sections.map((s) => s.heading);
  if (headings.join('|') !== SECTION_ORDER.join('|')) {
    throw new Error(`Case "${c.slug}" must define sections in order: ${SECTION_ORDER.join(', ')}`);
  }
});

export default work;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tests/work.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Replace real case body copy** in each `body: '…'` using the source projects (Be My Guide README/SPEC, Concert Radar SPEC, NAV intern experience in `src/data/about.ts`). Re-run the test to confirm still green.

- [ ] **Step 6: Commit**

```bash
git add src/data/work.ts tests/work.test.ts
git commit -m "feat(work): typed case-study data for three flagships"
```

### Task 13: Case UI components

**Files:**
- Create: `src/components/work/CaseHero.tsx`, `src/components/work/CaseSection.tsx`, `src/components/work/CaseCard.tsx`

> Invoke `frontend-design` before styling these.

- [ ] **Step 1: `CaseCard.tsx`** — a card for the index grid: title, summary, tech chips, optional "In progress" badge, links to `/work/[slug]`. Takes a `CaseStudy` prop. Wrap in `Reveal` at the call site.

- [ ] **Step 2: `CaseHero.tsx`** — title, one-line summary, optional "In progress" badge, tech chips, optional hero image, optional external links. Takes a `CaseStudy`.

- [ ] **Step 3: `CaseSection.tsx`** — renders one `CaseSection` (heading + body), wrapped in `Reveal`.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: compiles.

- [ ] **Step 5: Commit**

```bash
git add src/components/work/
git commit -m "feat(work): case hero, section, and card components"
```

### Task 14: Work index route

**Files:**
- Create: `src/app/work/page.tsx`

- [ ] **Step 1: Build the index page** — `export const metadata = buildPageMetadata({ title: 'Work', description: 'Selected engineering work by Nima Hakimi.', path: '/work' })`. Map `work` into a `Stagger` grid of `CaseCard`s.

```tsx
// src/app/work/page.tsx
import { buildPageMetadata } from '@/lib/metadata';
import work from '@/data/work';
import CaseCard from '@/components/work/CaseCard';
import Stagger from '@/components/motion/Stagger';

export const metadata = buildPageMetadata({
  title: 'Work',
  description: 'Selected engineering work by Nima Hakimi.',
  path: '/work',
});

export default function WorkPage() {
  return (
    <section className="max-w-5xl mx-auto">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-8">Work</h1>
      <Stagger className="grid gap-6 sm:grid-cols-2">
        {work.map((c) => (
          <CaseCard key={c.slug} caseStudy={c} />
        ))}
      </Stagger>
    </section>
  );
}
```

- [ ] **Step 2: Verify** `http://localhost:3000/work` lists three cards with stagger animation.

- [ ] **Step 3: Commit**

```bash
git add src/app/work/page.tsx
git commit -m "feat(work): /work case index route"
```

### Task 15: Case page route with static params + metadata

**Files:**
- Create: `src/app/work/[slug]/page.tsx`

- [ ] **Step 1: Build the dynamic case route**

```tsx
// src/app/work/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import work from '@/data/work';
import { buildPageMetadata } from '@/lib/metadata';
import CaseHero from '@/components/work/CaseHero';
import CaseSection from '@/components/work/CaseSection';

export function generateStaticParams() {
  return work.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = work.find((w) => w.slug === slug);
  if (!c) return {};
  return buildPageMetadata({ title: c.title, description: c.summary, path: `/work/${c.slug}` });
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = work.find((w) => w.slug === slug);
  if (!c) notFound();
  return (
    <article className="max-w-3xl mx-auto space-y-12">
      <CaseHero caseStudy={c} />
      <div className="space-y-10">
        {c.sections.map((s) => (
          <CaseSection key={s.heading} section={s} />
        ))}
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Verify** each slug renders: `/work/be-my-guide`, `/work/concert-radar`, `/work/nav-event-registration`; a bad slug 404s.

- [ ] **Step 3: Commit**

```bash
git add 'src/app/work/[slug]/page.tsx'
git commit -m "feat(work): /work/[slug] case page route"
```

### Task 16: Retire the old projects route + data

**Files:**
- Delete: `src/app/projects/page.tsx`, `src/data/projects.ts`, `src/components/ProjectCard.tsx`

- [ ] **Step 1: Grep for references** to make sure nothing else imports them.

Run: `grep -rn "data/projects\|ProjectCard\|app/projects" src`
Expected: only the files being deleted (and nav links, handled in Task 18).

- [ ] **Step 2: Delete the files**

```bash
git rm src/app/projects/page.tsx src/data/projects.ts src/components/ProjectCard.tsx
```

- [ ] **Step 3: Verify build** (will fail if a nav link still points to `/projects` — that's fixed in Task 18; if build breaks only on the nav link, proceed and fix in 18).

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor: retire /projects in favor of /work"
```

---

## Phase 5 — Restyle Pages + Navigation (follows CHOSEN STRUCTURE)

> Invoke `frontend-design` before restyling. Apply the coral palette, `Reveal`/`Stagger`, and the hero "signature" animation. **If the chosen structure is Variant B (long-scroll), Tasks 17–19 collapse into a single-page build** with anchor sections instead of separate routes — keep `/work/[slug]` case pages as standalone routes either way.

### Task 17: Restyle the home/hero

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1:** Rebuild the hero with the coral palette, the shimmer/gradient signature treatment, a featured-work teaser (map first 3 from `work`), condensed skills, and CTAs (Work, Contact, GitHub). Wrap entrance content in `Reveal`. For Variant B, append `#about`, `#work`, `#contact` sections on this page.

- [ ] **Step 2: Verify** `http://localhost:3000` renders with coral theme + entrance animation; reduced-motion off disables motion.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(home): coral hero redesign with motion"
```

### Task 18: Update navigation (Work link, remove Projects)

**Files:**
- Modify: `src/components/NavLinks.tsx`, `src/components/navigation/NavLinksClient.tsx`, `src/components/navigation/types.ts` (as applicable)

- [ ] **Step 1:** Replace the `/projects` nav entry with `/work` ("Work"). For Variant B, point top nav at anchors (`/#work`) while keeping a real `/work` index if desired.

- [ ] **Step 2: Verify** nav renders, active states work, no link points to the deleted `/projects`.

Run: `grep -rn "/projects" src` → Expected: no results.

- [ ] **Step 3: Commit**

```bash
git add src/components/NavLinks.tsx src/components/navigation/
git commit -m "feat(nav): replace Projects with Work"
```

### Task 19: Restyle the About page

**Files:**
- Modify: `src/app/about/page.tsx`

- [ ] **Step 1:** Apply coral palette + `Reveal`/`Stagger` to the experience timeline, education, skills, languages from `src/data/about.ts`. Sharpen the summary's positioning for recruiters.

- [ ] **Step 2: Verify** `/about` renders with reveals on scroll.

- [ ] **Step 3: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat(about): coral redesign with scroll reveals"
```

### Task 20: Restyle the Contact page (logic untouched)

**Files:**
- Modify: `src/app/contact/ContactClient.tsx` (presentation only)

- [ ] **Step 1:** Restyle inputs/buttons/toast to the coral palette and refreshed `.btn`/`.card` classes. **Do not change** `actions.ts`, `state.ts`, `email.ts`, or `captcha.ts`.

- [ ] **Step 2: Verify** the form still submits (dev mode bypasses reCAPTCHA when `RECAPTCHA_SECRET_KEY` is absent) and the success/error toast shows.

- [ ] **Step 3: Commit**

```bash
git add src/app/contact/ContactClient.tsx
git commit -m "feat(contact): restyle to coral palette (logic unchanged)"
```

### Task 21: Refresh global component layer + background

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`

- [ ] **Step 1:** Update `@layer components` (`.card`, `.btn`, `.btn-accent`, `.btn-outline`, `.muted`) to the coral tokens; update the fixed background-gradient blobs in `layout.tsx` from teal to coral (keep them subtle/warm). Update `<body>` background/text classes if needed.

- [ ] **Step 2: Verify** all pages share consistent coral styling in both themes.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat(theme): refresh component layer + background to coral"
```

---

## Phase 6 — Polish, Accessibility, Verification

### Task 22: Accessibility + reduced-motion pass

- [ ] **Step 1:** Verify keyboard navigation (tab order, visible focus rings) across Home, Work, case pages, About, Contact, and the theme toggle.

- [ ] **Step 2:** Enable OS "Reduce Motion" and confirm all `Reveal`/`Stagger`/hero animations collapse to instant/opacity-only (Motion's `useReducedMotion` handles primitives; verify the hero signature animation too).

- [ ] **Step 3:** Check color contrast for text/accent in both light and dark themes (target WCAG AA).

- [ ] **Step 4:** Fix any issues found, then commit.

```bash
git add -A
git commit -m "fix(a11y): keyboard, focus, contrast, reduced-motion pass"
```

### Task 23: Final verification + metadata + cleanup

- [ ] **Step 1: Update `src/lib/site.ts`** if any constants changed (e.g. role/description wording for recruiter framing). Confirm `/work` and `/work/[slug]` appear in `sitemap.ts` (extend it to map `work` slugs if it enumerates routes).

- [ ] **Step 2: Run the full check suite**

Run:
```bash
npm run test
npm run lint
npm run build
```
Expected: tests pass, lint clean, build succeeds.

- [ ] **Step 3: Decide on mockups** — either delete `mockups/` or keep it. Recommended: keep only the chosen variant for reference, or remove entirely.

```bash
git rm -r mockups   # or keep; user's call
git commit -m "chore: remove throwaway mockups"
```

- [ ] **Step 4: Final commit / branch ready for review**

```bash
git add -A && git commit -m "chore: final redesign polish"
```

- [ ] **Step 5:** Invoke `superpowers:finishing-a-development-branch` to decide merge/PR.

---

## Self-Review (completed by author)

- **Spec coverage:** Direction/principles → Phase 5 + Task 8/21; two-mockup gate → Phase 1 + Task 6; color system → Tasks 8, 21; theme toggle no-flash → Tasks 7, 9, 10; Motion language → Task 11 + usage in 13–19; case pages → Tasks 12–15; flagships-only lineup → Task 12; page content → Tasks 17, 19, 20; reuse/code-health → Tasks 16, 18, 20 (contact logic untouched); out-of-scope respected (no services/blog/etc.); success criteria → Phase 6. ✅
- **Placeholder scan:** Case `body: '…'` strings are intentional content placeholders filled with real copy in Task 12 Step 5 (flagged explicitly), not plan placeholders. No "TBD/handle edge cases" steps. ✅
- **Type consistency:** `CaseStudy`/`CaseSection`/`CaseLink`, `ThemeChoice`/`resolveTheme`/`THEME_KEY`, `Reveal`/`Stagger`/`staggerItem` names are used consistently across Tasks 7–19. `caseStudy` prop name used in Tasks 13–15. ✅
