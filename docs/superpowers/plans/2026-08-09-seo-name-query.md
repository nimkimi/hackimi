# SEO Name-Query Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make hackimi.dev win the "Nima Hakimi" name query: recover the dead `/projects` ranking URL, name-led titles, entity-graph JSON-LD, favicon + branded OG card, honest sitemap, Search Console wiring.

**Architecture:** All changes ride the existing metadata pipeline (`src/lib/site.ts` constants → `src/lib/metadata.ts` builders → per-page `metadata` exports). New surfaces: `next.config.js` redirects, a `JsonLd` component for structured-data blocks, a site footer, Next file-convention icons, and a committed asset-generator script.

**Tech Stack:** Next.js 16 App Router (Turbopack), React 19, Vitest, Playwright, Prettier 3.8.3.

**Spec:** `docs/superpowers/specs/2026-08-09-seo-name-query-design.md`

## Global Constraints

- Positioning wording in SEO surfaces: exactly `Developer & AI Engineer` (prose form: `developer and AI engineer`). **Visible site copy keeps "frontend"** — do NOT touch hero/about/contact/case-study visible text (`src/app/page.tsx` JSX, `about` prose, `ContactClient` blurb, `src/data/*` narratives).
- Canonical host is apex `https://hackimi.dev` everywhere in code. Never introduce `www.`
- TDD: every task starts with a failing test. Run tests with `npm run test` (Vitest) / `npm run test:e2e` (Playwright).
- Playwright locally requires **unsandboxed Bash** and `ulimit -n 10240` (Chromium fails to launch sandboxed: "Permission denied (1100)"). Same for the asset-generator script (it launches Chromium).
- Turbopack dev server's first cold run may fail 1 random e2e while compiling on demand — re-run before blaming a change; production build is stable.
- Commits: conventional messages, no AI attribution, no session links, no Claude-Session trailer.
- `npm run lint` must stay 0 errors / 0 warnings; `npm run check` (Prettier) must pass before each commit.

---

### Task 1: Permanent redirects — recover the dead /projects URL

**Files:**

- Modify: `next.config.js` (currently an empty `nextConfig = {}`)
- Create: `e2e/seo.spec.ts`

**Interfaces:**

- Produces: `e2e/seo.spec.ts` — later tasks append describe-blocks to this file.

- [ ] **Step 1: Write the failing e2e test**

Create `e2e/seo.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('redirects', () => {
  test('/projects permanently redirects to /work', async ({ request }) => {
    const res = await request.get('/projects', { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()['location']).toBe('/work');
  });

  test('/projects/anything redirects to /work', async ({ request }) => {
    const res = await request.get('/projects/old-page', { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()['location']).toBe('/work');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run (unsandboxed, `ulimit -n 10240` first): `npx playwright test e2e/seo.spec.ts` Expected: FAIL — `/projects` returns 404, not 308.

- [ ] **Step 3: Implement redirects**

Replace `next.config.js` content:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // The pre-2026-06-02 site served /projects (Google's current #1 result
      // for "Nima Hakimi developer"); the redesign renamed it to /work.
      { source: '/projects', destination: '/work', permanent: true },
      { source: '/projects/:path*', destination: '/work', permanent: true },
      // Exact-host only: preview deployments on *.vercel.app must stay untouched.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'hackimi.vercel.app' }],
        destination: 'https://hackimi.dev/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx playwright test e2e/seo.spec.ts` — Expected: PASS. If it fails unexpectedly after the config edit: Turbopack's persistent FS cache is known to go stale across `next.config.js` changes in this repo — `rm -rf .next`, restart the server, re-run BEFORE debugging the redirect rule itself. Also verify the host rule manually (dev server on :3000): `curl -s -o /dev/null -w '%{http_code} %{redirect_url}' -H 'Host: hackimi.vercel.app' http://localhost:3000/about` Expected: `308 https://hackimi.dev/about`. If the dev server doesn't honor the Host match, verify against `npm run build && npm run start` instead; if it only works in prod mode, note that in the task report — the rule itself is correct.

- [ ] **Step 5: Commit**

```bash
git add next.config.js e2e/seo.spec.ts
git commit -m "feat: permanent redirects for legacy /projects and vercel.app host"
```

---

### Task 2: Positioning constants — Developer & AI Engineer

**Files:**

- Modify: `src/lib/site.ts`
- Modify: `tests/unit/site.test.ts`

**Interfaces:**

- Produces: `SITE_ROLE = 'Developer & AI Engineer'`, `SITE_TITLE = 'Nima Hakimi — Developer & AI Engineer'` (em-dash), updated `SITE_DESCRIPTION`/`SITE_KEYWORDS`, and `SITE_SOCIAL_LINKS.orcid`. Tasks 3–7 consume these.

- [ ] **Step 1: Update the pinned test to the new contract**

In `tests/unit/site.test.ts` replace the SITE_TITLE test:

```ts
it('SITE_TITLE is `${SITE_AUTHOR} — ${SITE_ROLE}` (em-dash form)', () => {
  expect(SITE_TITLE).toBe(`${SITE_AUTHOR} — ${SITE_ROLE}`);
  expect(SITE_ROLE).toBe('Developer & AI Engineer');
});
```

And add to the same describe:

```ts
it('social links include GitHub, LinkedIn and ORCID', () => {
  expect(Object.keys(SITE_SOCIAL_LINKS).sort()).toEqual(['github', 'linkedin', 'orcid']);
});

it('keywords carry the new positioning, not "Frontend"', () => {
  expect(SITE_KEYWORDS).toContain('AI Engineer');
  expect(SITE_KEYWORDS.join(' ')).not.toMatch(/frontend/i);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/site.test.ts` Expected: FAIL (pipe title, no orcid key, 'Frontend Developer' keyword).

- [ ] **Step 3: Implement in `src/lib/site.ts`**

```ts
export const SITE_ROLE = 'Developer & AI Engineer';
export const SITE_TITLE = `${SITE_AUTHOR} — ${SITE_ROLE}`;
export const SITE_DESCRIPTION =
  'Portfolio of Nima Hakimi, a developer and AI engineer building accessible, high-performance web applications.';
export const SITE_KEYWORDS = ['Nima Hakimi', 'Developer', 'AI Engineer', 'Next.js', 'React', 'Oslo'];
```

And extend the social links object:

```ts
export const SITE_SOCIAL_LINKS = {
  github: 'https://github.com/nimkimi',
  linkedin: 'https://linkedin.com/in/nima-hakimi-387716175',
  orcid: 'https://orcid.org/0009-0002-6656-2498',
};
```

Leave `SITE_OG_IMAGE` untouched in this task (Task 7 changes it).

- [ ] **Step 4: Run the full unit/server suite**

Run: `npm run test` Expected: PASS — `tests/unit/metadata.test.ts` compares against the imported constants, so it rides through. If `buildPersonJsonLd`'s sameAs test fails (it pins `[github, linkedin]`), do NOT fix it here — that contract changes in Task 6; temporarily it still passes because the builder maps the two keys explicitly.

- [ ] **Step 5: Commit**

```bash
git add src/lib/site.ts tests/unit/site.test.ts
git commit -m "feat: reposition site constants to Developer & AI Engineer"
```

---

### Task 3: Name-led homepage title

**Files:**

- Modify: `src/lib/metadata.ts` (add `buildHomeMetadata`)
- Modify: `src/app/page.tsx:10-14` (metadata export only — no JSX changes)
- Modify: `tests/unit/metadata.test.ts`, `tests/integration/pages.test.tsx:58-62`
- Modify: `e2e/seo.spec.ts` (append)

**Interfaces:**

- Consumes: `SITE_TITLE`, `SITE_DESCRIPTION` from Task 2.
- Produces: `buildHomeMetadata(): Metadata` in `src/lib/metadata.ts`.

Background for the implementer: Next's `title.template` applies only to **child** segments — the root `page.tsx` never receives it, so its current `title: 'Portfolio'` renders as literally `<title>Portfolio</title>` in production. That is why the fix must set an absolute full-string title and why the e2e assertion (rendered layer) is the one that counts: the unit-level metadata object looked correct the whole time this bug shipped.

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/metadata.test.ts`:

```ts
describe('buildHomeMetadata', () => {
  it('title is the absolute SITE_TITLE (root segment gets no template)', () => {
    const meta = buildHomeMetadata();
    expect(meta.title).toBe(SITE_TITLE);
    expect(meta.openGraph?.title).toBe(SITE_TITLE);
    expect(meta.twitter?.title).toBe(SITE_TITLE);
  });

  it('canonical and og.url are the bare SITE_URL', () => {
    const meta = buildHomeMetadata();
    expect(meta.alternates?.canonical).toBe(SITE_URL);
    expect(meta.openGraph?.url).toBe(SITE_URL);
  });
});
```

(Import `buildHomeMetadata` in the existing import list.)

In `tests/integration/pages.test.tsx`, replace the home metadata test (lines 58–62):

```ts
it('exports absolute name-led home metadata', async () => {
  const { metadata } = await import('@/app/page');
  const { SITE_TITLE } = await import('@/lib/site');
  expect(metadata.title).toBe(SITE_TITLE);
  expect(metadata.description).toContain('Nima Hakimi');
});
```

Append to `e2e/seo.spec.ts`:

```ts
test.describe('rendered metadata', () => {
  test('homepage title is the full name-led title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Nima Hakimi — Developer & AI Engineer');
  });

  test('homepage canonical points at apex', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://hackimi.dev');
  });
});
```

- [ ] **Step 2: Run to verify failures**

Run: `npx vitest run tests/unit/metadata.test.ts tests/integration/pages.test.tsx` Expected: FAIL — `buildHomeMetadata` doesn't exist; home title is 'Portfolio'.

- [ ] **Step 3: Implement**

In `src/lib/metadata.ts`, after `buildPageMetadata`, add (reusing the module's existing `defaultImage`, `defaultTwitterImage`, `defaultKeywords`):

```ts
/**
 * Home is the ONE page whose title must be absolute: Next's title.template
 * only applies to child segments, so the root page.tsx never receives the
 * "%s | Nima Hakimi" suffix — it must carry the full name-led string itself.
 */
export function buildHomeMetadata(): Metadata {
  return {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    keywords: defaultKeywords,
    alternates: { canonical: SITE_URL },
    openGraph: {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      siteName: SITE_AUTHOR,
      type: 'website',
      images: [defaultImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [defaultTwitterImage],
    },
  };
}
```

(`SITE_TITLE` and `SITE_DESCRIPTION` are already imported at the top of the module.)

In `src/app/page.tsx`, replace the metadata export (lines 10–14) with:

```ts
export const metadata = buildHomeMetadata();
```

and change the import from `buildPageMetadata` to `buildHomeMetadata`. Touch nothing else in the file.

- [ ] **Step 4: Run to verify passes**

Run: `npm run test` then `npx playwright test e2e/seo.spec.ts` (unsandboxed, ulimit set). Expected: all PASS.

Contingency: if the e2e title assertion fails with a DOUBLED suffix (`Nima Hakimi — Developer & AI Engineer | Nima Hakimi`), the root template did apply after all — switch `buildHomeMetadata`'s title to `title: { absolute: SITE_TITLE }` and update the two object-level title assertions to match. Live-production evidence says this won't happen; the e2e exists to catch exactly this case.

- [ ] **Step 5: Commit**

```bash
git add src/lib/metadata.ts src/app/page.tsx tests/unit/metadata.test.ts tests/integration/pages.test.tsx e2e/seo.spec.ts
git commit -m "feat: absolute name-led homepage title via buildHomeMetadata"
```

---

### Task 4: Site footer with visible name line

**Files:**

- Create: `src/components/layout/SiteFooter.tsx`
- Modify: `src/app/layout.tsx:30-33` (add footer inside `SmoothScroll`, after `main`)
- Create: `tests/components/site-footer.test.tsx`
- Modify: `e2e/seo.spec.ts` (append)

**Interfaces:**

- Consumes: `SITE_AUTHOR`, `SITE_ROLE`, `SITE_LOCATION` from `src/lib/site.ts`.
- Produces: `SiteFooter` default-export server component, rendered on every page.

- [ ] **Step 0: Pre-flight — check for existing `<footer>` elements**

Run: `grep -rn '<footer' src/` Expected: zero hits (then `page.locator('footer')` below is unambiguous). If there ARE hits, give the new footer `data-site-footer` and use `page.locator('[data-site-footer]')` in the e2e instead — `footer`/`contentinfo` locators would throw strict-mode violations.

- [ ] **Step 1: Write the failing tests**

Create `tests/components/site-footer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import SiteFooter from '@/components/layout/SiteFooter';
import { SITE_AUTHOR, SITE_ROLE, SITE_LOCATION } from '@/lib/site';

describe('SiteFooter', () => {
  it('renders the © name-role-city line as visible text', () => {
    render(<SiteFooter />);
    const footer = screen.getByRole('contentinfo');
    const year = new Date().getFullYear();
    expect(footer).toHaveTextContent(`© ${year} ${SITE_AUTHOR} — ${SITE_ROLE}, ${SITE_LOCATION.city}`);
  });
});
```

Append to `e2e/seo.spec.ts` inside the `rendered metadata` describe:

```ts
test('footer carries the visible name line on every page', async ({ page }) => {
  for (const path of ['/', '/about', '/work']) {
    await page.goto(path);
    await expect(page.locator('footer')).toContainText('Nima Hakimi — Developer & AI Engineer');
  }
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/components/site-footer.test.tsx` Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `src/components/layout/SiteFooter.tsx`:

```tsx
import { SITE_AUTHOR, SITE_ROLE, SITE_LOCATION } from '@/lib/site';

/**
 * Site-wide footer. Besides closing the page visually, this is the one
 * crawlable spot outside the hero h1 where the full name appears as text
 * on every route (the nav logo is an SVG with only an aria-label).
 */
export default function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="mt-[clamp(3rem,8vh,5rem)] border-t border-white/10 py-8">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
          © {new Date().getFullYear()} {SITE_AUTHOR} — {SITE_ROLE}, {SITE_LOCATION.city}
        </p>
      </div>
    </footer>
  );
}
```

In `src/app/layout.tsx`, import it (`import SiteFooter from '@/components/layout/SiteFooter';`) and render it after `<main>` inside `SmoothScroll`:

```tsx
<SmoothScroll>
  <SiteNav />
  <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
  <SiteFooter />
</SmoothScroll>
```

- [ ] **Step 4: Run to verify passes**

Run: `npm run test`, then `npx playwright test e2e/seo.spec.ts e2e/accessibility.spec.ts` (the axe smoke must stay green with the new landmark). Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/SiteFooter.tsx src/app/layout.tsx tests/components/site-footer.test.tsx e2e/seo.spec.ts
git commit -m "feat: site footer with visible name line"
```

---

### Task 5: Per-page metadata hygiene (contact OG bug, about description, slug not-found)

**Files:**

- Modify: `src/app/contact/page.tsx:6-12`
- Modify: `src/app/about/page.tsx:8-13` (description string only)
- Modify: `src/app/work/[slug]/page.tsx:17`
- Modify: `tests/integration/contact-page.test.tsx:82-86`

**Interfaces:**

- Consumes: `buildPageMetadata` (existing).

- [ ] **Step 1: Write the failing tests**

In `tests/integration/contact-page.test.tsx`, replace the metadata test (lines 82–86):

```ts
it('exports contact metadata with its own OpenGraph object', async () => {
  const { metadata } = await import('@/app/contact/page');
  const { SITE_AUTHOR } = await import('@/lib/site');
  expect(metadata.title).toBe('Contact');
  expect(metadata.alternates?.canonical).toBe('https://hackimi.dev/contact');
  // Regression: an absent openGraph made /contact inherit the homepage OG.
  expect(metadata.openGraph?.title).toBe(`Contact | ${SITE_AUTHOR}`);
  expect(metadata.openGraph?.url).toBe('https://hackimi.dev/contact');
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/integration/contact-page.test.tsx` Expected: FAIL — `metadata.openGraph` is undefined.

- [ ] **Step 3: Implement**

`src/app/contact/page.tsx` — replace the hand-written metadata (lines 6–12) with:

```ts
import { buildPageMetadata } from '@/lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Contact',
  description: 'Send a message to Nima Hakimi through a secure contact form powered by reCAPTCHA.',
  path: '/contact',
});
```

(Drop the now-unused `import type { Metadata } from 'next';`.)

`src/app/about/page.tsx` — description string (line 10–11) becomes:

```ts
'Nima Hakimi — developer and AI engineer with a designer’s eye, building accessible, expressive web interfaces. Experience, education, and skills.',
```

`src/app/work/[slug]/page.tsx` line 17 — unknown slug gets a real title instead of `{}`:

```ts
if (!c) return { title: 'Not found' };
```

- [ ] **Step 4: Run to verify passes**

Run: `npm run test` — Expected: PASS (about's description is only asserted via `toContain('Nima Hakimi')`-style checks, which still hold).

- [ ] **Step 5: Commit**

```bash
git add src/app/contact/page.tsx src/app/about/page.tsx "src/app/work/[slug]/page.tsx" tests/integration/contact-page.test.tsx
git commit -m "fix: contact OG fallthrough, about description wording, slug not-found title"
```

---

### Task 6: Entity graph — @id, ORCID, WebSite, ProfilePage, BreadcrumbList

**Files:**

- Modify: `src/lib/metadata.ts` (Person builder + three new builders)
- Create: `src/components/seo/JsonLd.tsx`
- Modify: `src/app/layout.tsx` (Person + WebSite via JsonLd), `src/app/about/page.tsx` (ProfilePage), `src/app/work/[slug]/page.tsx` (BreadcrumbList)
- Modify: `tests/unit/metadata.test.ts`
- Modify: `e2e/seo.spec.ts` (append)

**Interfaces:**

- Consumes: `SITE_SOCIAL_LINKS.orcid` (Task 2).
- Produces: `PERSON_ID` const (`https://hackimi.dev/#person`); `buildWebSiteJsonLd()`, `buildProfilePageJsonLd()`, `buildBreadcrumbJsonLd(caseTitle: string, slug: string)`; `JsonLd({ data }: { data: object })` component.

- [ ] **Step 1: Write the failing unit tests**

In `tests/unit/metadata.test.ts`, replace the `buildPersonJsonLd` sameAs assertion and add:

```ts
describe('buildPersonJsonLd', () => {
  it('carries a stable @id and all three sameAs anchors', () => {
    const ld = buildPersonJsonLd();
    expect(ld['@id']).toBe(`${SITE_URL}/#person`);
    expect(ld.sameAs).toEqual([SITE_SOCIAL_LINKS.github, SITE_SOCIAL_LINKS.linkedin, SITE_SOCIAL_LINKS.orcid]);
  });
});

describe('entity graph builders', () => {
  it('WebSite names the site after the author and references the person', () => {
    const ld = buildWebSiteJsonLd();
    expect(ld['@type']).toBe('WebSite');
    expect(ld.name).toBe(SITE_AUTHOR);
    expect(ld.url).toBe(SITE_URL);
    expect(ld.publisher).toEqual({ '@id': `${SITE_URL}/#person` });
  });

  it('ProfilePage points its mainEntity at the person @id', () => {
    const ld = buildProfilePageJsonLd();
    expect(ld['@type']).toBe('ProfilePage');
    expect(ld.url).toBe(`${SITE_URL}/about`);
    expect(ld.mainEntity).toEqual({ '@id': `${SITE_URL}/#person` });
  });

  it('BreadcrumbList walks Home → Work → case', () => {
    const ld = buildBreadcrumbJsonLd('Be My Guide', 'be-my-guide');
    expect(ld['@type']).toBe('BreadcrumbList');
    expect(ld.itemListElement).toEqual([
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
      { '@type': 'ListItem', 'position': 2, 'name': 'Work', 'item': `${SITE_URL}/work` },
      { '@type': 'ListItem', 'position': 3, 'name': 'Be My Guide', 'item': `${SITE_URL}/work/be-my-guide` },
    ]);
  });
});
```

(Extend the import list with the three new builders. Keep the existing `builds the expected Person schema` test but update its `sameAs` line to the three-element array.)

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/metadata.test.ts` — Expected: FAIL, builders undefined.

- [ ] **Step 3: Implement builders in `src/lib/metadata.ts`**

```ts
export const PERSON_ID = `${SITE_URL}/#person` as const;

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': SITE_AUTHOR,
    'url': SITE_URL,
    'publisher': { '@id': PERSON_ID },
  } as const;
}

export function buildProfilePageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    'url': `${SITE_URL}/about`,
    'mainEntity': { '@id': PERSON_ID },
  } as const;
}

export function buildBreadcrumbJsonLd(caseTitle: string, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
      { '@type': 'ListItem', 'position': 2, 'name': 'Work', 'item': `${SITE_URL}/work` },
      { '@type': 'ListItem', 'position': 3, 'name': caseTitle, 'item': `${SITE_URL}/work/${slug}` },
    ],
  } as const;
}
```

In `buildPersonJsonLd`, add `'@id': PERSON_ID,` directly under `'@type': 'Person',` and change the sameAs line to:

```ts
'sameAs': [SITE_SOCIAL_LINKS.github, SITE_SOCIAL_LINKS.linkedin, SITE_SOCIAL_LINKS.orcid],
```

Create `src/components/seo/JsonLd.tsx`:

```tsx
/** Renders one schema.org block. Server component — emits static JSON, no hydration. */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      suppressHydrationWarning
    />
  );
}
```

Wire-in:

- `src/app/layout.tsx`: replace the inline `<script type="application/ld+json" …>` block with `<JsonLd data={buildPersonJsonLd()} />` and `<JsonLd data={buildWebSiteJsonLd()} />` (both where the old script sat, before the grain div). Update imports accordingly; the local `jsonLd` variable goes away.
- `src/app/about/page.tsx`: inside the returned `<article>`, first child: `<JsonLd data={buildProfilePageJsonLd()} />`.
- `src/app/work/[slug]/page.tsx`: inside the returned `<article>`, first child: `<JsonLd data={buildBreadcrumbJsonLd(c.title, c.slug)} />` (place after the `notFound()` guard so `c` is non-null).

- [ ] **Step 4: Append the rendered-layer e2e test**

Add to `e2e/seo.spec.ts`:

```ts
test.describe('structured data', () => {
  async function ldTypes(page: import('@playwright/test').Page) {
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    return blocks.map((b) => JSON.parse(b)['@type']);
  }

  test('every page carries Person + WebSite; about and case pages add their own', async ({ page }) => {
    await page.goto('/');
    expect((await ldTypes(page)).sort()).toEqual(['Person', 'WebSite']);

    await page.goto('/about');
    expect((await ldTypes(page)).sort()).toEqual(['Person', 'ProfilePage', 'WebSite']);

    await page.goto('/work/be-my-guide');
    expect((await ldTypes(page)).sort()).toEqual(['BreadcrumbList', 'Person', 'WebSite']);
  });
});
```

- [ ] **Step 5: Run to verify passes**

Run: `npm run test` and `npx playwright test e2e/seo.spec.ts`. Expected: PASS. (JSON.parse doubles as a validity check on every block.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/metadata.ts src/components/seo/JsonLd.tsx src/app/layout.tsx src/app/about/page.tsx "src/app/work/[slug]/page.tsx" tests/unit/metadata.test.ts e2e/seo.spec.ts
git commit -m "feat: entity graph JSON-LD (person @id, WebSite, ProfilePage, breadcrumbs)"
```

---

### Task 7: Brand assets — favicon set and OG card ⚠️ TASTE GATE

**Files:**

- Create: `scripts/generate-brand-assets.mjs`, `src/app/icon.svg`, `src/app/apple-icon.png`, `public/og.png`
- Modify: `src/lib/site.ts` (`SITE_OG_IMAGE` → og.png; new `SITE_PERSON_IMAGE`), `src/lib/metadata.ts` (Person image), `tests/unit/site.test.ts`, `tests/unit/metadata.test.ts`
- Modify: `e2e/seo.spec.ts` (append)

**Interfaces:**

- Consumes: Monogram geometry from `src/components/brand/Monogram.tsx` (120×120 viewBox; N: `M20 100 L20 20 L54 100 L54 20`; H: `M66 20 L66 100 M66 60 L100 60 M100 20 L100 100`; strokeWidth 8, round caps/joins).
- Produces: `SITE_PERSON_IMAGE` (the face photo, kept for Person JSON-LD), `SITE_OG_IMAGE` now `${SITE_URL}/og.png`.

- [ ] **Step 1: Write the failing tests**

`tests/unit/site.test.ts`, add:

```ts
it('OG image is the branded card; person image is the photo', async () => {
  const { SITE_OG_IMAGE, SITE_PERSON_IMAGE, SITE_URL } = await import('@/lib/site');
  expect(SITE_OG_IMAGE).toBe(`${SITE_URL}/og.png`);
  expect(SITE_PERSON_IMAGE).toBe(`${SITE_URL}/bigSmile.JPEG`);
});
```

`tests/unit/metadata.test.ts`, add inside the `buildPersonJsonLd` describe:

```ts
it('uses the person photo, not the OG card, as the Person image', () => {
  expect(buildPersonJsonLd().image).toBe(SITE_PERSON_IMAGE);
});
```

(add `SITE_PERSON_IMAGE` to that file's imports from `@/lib/site`.)

`e2e/seo.spec.ts`, append inside `rendered metadata`:

```ts
test('favicon links are emitted', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute('href', /icon/);
});

test('og image resolves to a real asset', async ({ page, request }) => {
  await page.goto('/');
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(og).toContain('/og.png');
  const res = await request.get('/og.png');
  expect(res.status()).toBe(200);
});
```

- [ ] **Step 2: Run to verify failures**

Run: `npx vitest run tests/unit/site.test.ts tests/unit/metadata.test.ts` — Expected: FAIL (`SITE_PERSON_IMAGE` missing).

- [ ] **Step 3: Author the icon and the generator script**

Create `src/app/icon.svg` (Next serves this as the favicon automatically):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#0E0E10"/>
  <g fill="none" stroke="#C6FF3D" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" transform="translate(60 60) scale(0.78) translate(-60 -60)">
    <path d="M20 100 L20 20 L54 100 L54 20"/>
    <path d="M66 20 L66 100 M66 60 L100 60 M100 20 L100 100"/>
  </g>
</svg>
```

Create `scripts/generate-brand-assets.mjs` (Playwright is already a devDependency; this renders two HTML canvases and screenshots them):

```js
// Generates src/app/apple-icon.png (180x180) and public/og.png (1200x630)
// from the NH monogram. Rerun after any monogram/palette change:
//   ulimit -n 10240 && node scripts/generate-brand-assets.mjs
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const iconSvg = readFileSync(new URL('../src/app/icon.svg', import.meta.url), 'utf8');

const MONOGRAM = `
  <g fill="none" stroke="#C6FF3D" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 100 L20 20 L54 100 L54 20"/>
    <path d="M66 20 L66 100 M66 60 L100 60 M100 20 L100 100"/>
  </g>`;

const ogHtml = `<!doctype html><html><body style="margin:0">
  <div style="width:1200px;height:630px;background:#0E0E10;display:grid;place-items:center">
    <svg viewBox="0 0 120 120" width="380" height="380">${MONOGRAM}</svg>
  </div></body></html>`;

const appleHtml = `<!doctype html><html><body style="margin:0">
  <div style="width:180px;height:180px;display:grid;place-items:center;background:#0E0E10">
    ${iconSvg.replace('<svg ', '<svg width="180" height="180" ')}
  </div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(ogHtml);
await page.locator('div').first().screenshot({ path: 'public/og.png' });

await page.setViewportSize({ width: 180, height: 180 });
await page.setContent(appleHtml);
await page.locator('div').first().screenshot({ path: 'src/app/apple-icon.png' });

await browser.close();
console.log('wrote public/og.png and src/app/apple-icon.png');
```

Run it (unsandboxed Bash, `ulimit -n 10240` first): `node scripts/generate-brand-assets.mjs` Verify dims: `sips -g pixelWidth -g pixelHeight public/og.png src/app/apple-icon.png` → 1200×630 and 180×180.

- [ ] **Step 4: Switch the constants**

`src/lib/site.ts`:

```ts
export const SITE_OG_IMAGE = `${SITE_URL}/og.png` as const;
export const SITE_PERSON_IMAGE = `${SITE_URL}/bigSmile.JPEG` as const;
```

`src/lib/metadata.ts`: import `SITE_PERSON_IMAGE` and use it for the Person builder's `image` field (the OG `defaultImage` keeps using `SITE_OG_IMAGE`, whose declared 1200×630 now matches the actual file).

- [ ] **Step 5: Run to verify passes**

Run: `npm run test` and `npx playwright test e2e/seo.spec.ts` — Expected: PASS.

- [ ] **Step 6: ⚠️ TASTE GATE — STOP and show Nima (ORCHESTRATOR-ONLY step)**

A subagent implementer CANNOT perform this step — it must return after Step 5 WITHOUT committing, reporting the generated asset paths. The orchestrator then sends Nima `public/og.png`, `src/app/apple-icon.png`, and a browser-tab-size rendering of `src/app/icon.svg` (screenshot of the actual favicon in a tab, or a 32px render), plays the approval sound, and waits. **Nothing merges past this point without his explicit approval of both assets.** Iterate on his feedback (stroke weight, corner radius, monogram scale) by editing the SVG/script and re-running the generator.

- [ ] **Step 7: Commit (after approval)**

```bash
git add src/app/icon.svg src/app/apple-icon.png public/og.png scripts/generate-brand-assets.mjs src/lib/site.ts src/lib/metadata.ts tests/unit/site.test.ts tests/unit/metadata.test.ts e2e/seo.spec.ts
git commit -m "feat: NH monogram favicon set and branded OG card"
```

---

### Task 8: Honest sitemap + idiomatic robots.ts

**Files:**

- Modify: `src/app/sitemap.ts`, `tests/server/sitemap.test.ts`
- Create: `src/app/robots.ts`
- Delete: `src/app/robots.txt/` (whole folder)
- Rewrite: `tests/server/robots.test.ts`

- [ ] **Step 1: Write the failing tests**

Rewrite `tests/server/sitemap.test.ts`'s last test (replace the changeFrequency/lastModified one):

```ts
it('entries are url-only — no fabricated lastModified/changeFrequency/priority', () => {
  for (const entry of sitemap()) {
    expect(Object.keys(entry)).toEqual(['url']);
  }
});
```

Also update the two priority assertions (`priority 1` / `priority 0.6` tests): drop the priority expectations, keep the URL-shape ones — rename to "uses the bare base URL (no trailing slash) for '/'" and "uses the full path for a non-root route".

Rewrite `tests/server/robots.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import robots from '@/app/robots';
import { SITE_URL } from '@/lib/site';

describe('robots', () => {
  it('allows all crawlers everything and points at the sitemap', () => {
    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: `${SITE_URL}/sitemap.xml`,
    });
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/server/` — Expected: FAIL (no `@/app/robots` module; sitemap entries carry extra keys).

- [ ] **Step 3: Implement**

Replace `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next';
import work from '@/data/work';
import { SITE_URL } from '@/lib/site';

const routes = ['/', '/about', '/work', '/contact', ...work.map((c) => `/work/${c.slug}`)] as const;

/**
 * URL list only, deliberately: the previous lastModified stamped `new Date()`
 * on every build (a false freshness signal on all URLs), and Google ignores
 * changeFrequency/priority. No signal beats a wrong signal.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({ url: `${SITE_URL}${route === '/' ? '' : route}` }));
}
```

Create `src/app/robots.ts`:

```ts
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

Delete the folder `src/app/robots.txt/` (`git rm -r src/app/robots.txt`).

- [ ] **Step 4: Run to verify passes**

Run: `npm run test`, then boot the dev server and check both endpoints render: `curl -s http://localhost:3000/robots.txt` → `User-Agent: *`, `Allow: /`, `Sitemap: https://hackimi.dev/sitemap.xml` `curl -s http://localhost:3000/sitemap.xml` → 7 `<loc>` entries, no `<lastmod>`.

- [ ] **Step 5: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts tests/server/   # robots.txt deletion already staged by git rm
git commit -m "refactor: url-only sitemap, robots.ts file convention, SITE_URL single-sourced"
```

---

### Task 9: Search Console verification slot + infra docs

**Files:**

- Modify: `src/lib/site.ts`, `src/lib/metadata.ts` (`buildRootMetadata`), `tests/unit/metadata.test.ts`
- Create: `docs/infra.md`

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/metadata.test.ts`'s `buildRootMetadata` describe:

```ts
it('emits no verification block while the GSC token is empty', () => {
  // SITE_GOOGLE_SITE_VERIFICATION is '' until Nima creates the property;
  // an empty <meta name="google-site-verification"> must never ship.
  expect(buildRootMetadata().verification).toBeUndefined();
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/metadata.test.ts` — Expected: FAIL only if the implementation adds an empty block; if it passes trivially (no `verification` key exists yet), proceed — the test pins the contract for when the token lands.

- [ ] **Step 3: Implement**

`src/lib/site.ts`:

```ts
/** Google Search Console meta-tag token. Empty until the property is created. */
export const SITE_GOOGLE_SITE_VERIFICATION = '';
```

`src/lib/metadata.ts` — in `buildRootMetadata`'s returned object, add:

```ts
...(SITE_GOOGLE_SITE_VERIFICATION
  ? { verification: { google: SITE_GOOGLE_SITE_VERIFICATION } }
  : {}),
```

(and import the constant).

Create `docs/infra.md`:

```markdown
# Infrastructure notes (state that lives outside this repo)

## Domains (Vercel dashboard → Settings → Domains)

- Production domains: `hackimi.dev` (apex) and `www.hackimi.dev`.
- **Canonical host: apex `https://hackimi.dev`** — every canonical tag, sitemap URL, robots Sitemap line, and JSON-LD url in this repo uses apex.
- Redirect direction: `www` → 308 → apex. (Flipped 2026-08-\_\_ by Nima; before that the dashboard had apex → www, contradicting the code's canonicals.)
- `hackimi.vercel.app` additionally 308s to apex via `next.config.js` (exact-host rule — preview URLs on \*.vercel.app are deliberately not matched).

## Deployments

- `vercel.json` sets `git.deploymentEnabled.main: false` — merging to `main` does NOT auto-deploy. Production deploys are triggered manually (dashboard or `vercel --prod`).

## Search Console

- Property: `https://hackimi.dev` (URL-prefix), meta-tag verification.
- Token lives in `SITE_GOOGLE_SITE_VERIFICATION` (`src/lib/site.ts`); empty string disables the tag entirely.
- After each SEO-relevant deploy: submit `sitemap.xml`, request indexing of changed URLs.
```

(The redirect-direction line contains a deliberate `2026-08-__` blank — Nima fills the date when he flips it; leave as-is.)

- [ ] **Step 4: Run to verify passes**

Run: `npm run test` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/site.ts src/lib/metadata.ts tests/unit/metadata.test.ts docs/infra.md
git commit -m "feat: search console verification slot; document domain/deploy state"
```

---

### Task 10: Full verification + PR

- [ ] **Step 1: Full local gate**

Run, in order, all from the repo root:

```bash
npm run lint        # must be 0 errors / 0 warnings
npm run check       # Prettier clean
npm run test        # full Vitest suite
npm run build       # production build succeeds
```

Then the full e2e suite against a production server (unsandboxed, `ulimit -n 10240`):

```bash
npx playwright test
```

Expected: everything green. A single flaky failure on a cold Turbopack dev server is a known non-signal — but this run is against the prod build, which is stable; failures here are real.

- [ ] **Step 2: Verify no stray "frontend" leaked into SEO surfaces**

```bash
grep -rn 'rontend' src/lib/ src/app/sitemap.ts src/app/robots.ts next.config.js
```

Expected: zero hits. (Visible-copy hits in `page.tsx`/`about`/`ContactClient`/`src/data/` are correct and expected — those stay.)

- [ ] **Step 3: Push and open PR**

Push (its own command, per git-push-guard): `git push -u origin seo/name-query`

PR against `main`, title "SEO: win the name query". Body: summary of the seven workstreams, a plain statement that the OG card and favicon were taste-approved (no links of any kind to sessions/conversations), and the post-merge checklist for Nima (Vercel apex flip → manual deploy → GSC property + token → sitemap submit → recrawl requests → LinkedIn/GitHub profile updates). No AI attribution anywhere. Note: `gh` requires unsandboxed Bash on this machine (sandboxed TLS to api.github.com fails).

- [ ] **Step 4: Post-deploy verification (after Nima merges + deploys)**

```bash
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://www.hackimi.dev/projects   # 308 → /work
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://hackimi.vercel.app/        # 308 → https://hackimi.dev/
curl -s https://www.hackimi.dev/ | grep -o '<title>[^<]*</title>'                            # name-led title
curl -s https://www.hackimi.dev/sitemap.xml | grep -c '<loc>'                                # 7
```

And after his Vercel flip: `curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://www.hackimi.dev/` → `308 https://hackimi.dev/`. Update `docs/infra.md`'s flip date. Move the ROADMAP.md row to Done.
