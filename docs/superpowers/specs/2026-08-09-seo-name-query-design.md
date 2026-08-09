# SEO: win the name query — design spec

**Date:** 2026-08-09
**Goal:** hackimi.dev is what people find when they search for Nima Hakimi.
**Branch:** `seo/name-query`

## Acceptance criteria

1. **#1 for qualified name queries** — "Nima Hakimi developer", "Nima Hakimi AI engineer", "Nima Hakimi utvikler" — measured in Google Search Console once set up.
2. **hackimi.dev on page 1 for bare "Nima Hakimi" searched from Norway.**
3. Global bare-name ranking is the long-game direction, not a gate: page 1 for the bare query is currently fully occupied by the Convoso CEO Nima Hakimi (press, speaker profiles, podcasts, LinkedIn since 2006). No code change can beat that authority head-on; only third-party mentions can, over time.

## SERP evidence (recon 2026-08-09)

- Bare "Nima Hakimi": hackimi.dev absent from page 1 (all slots: Convoso CEO + LinkedIn directory + Wikipedia surname pages). 6–7 distinct people share the name online.
- "Nima Hakimi developer": `hackimi.dev/projects` ranks **#1** — and **404s** (route renamed to `/work` in the 2026-06-02 redesign, no redirect). Homepage ranks #5.
- "Nima Hakimi utvikler": positions 6 and 9.
- "Nima Hakimi" + NAV/frontend: positions 1–2. The problem is specific to the unqualified query.
- `hackimi.vercel.app` is live, indexable (200, no noindex), and surfaces in SERPs — a duplicate of production.
- Search vantage was non-Norwegian; Norwegian results are likely already better. GSC will give real data.

## Decisions (grill round, settled 2026-08-09)

| Decision | Outcome |
| --- | --- |
| Canonical host | **Apex `hackimi.dev`.** Nima flips Vercel's primary domain in the dashboard (his hands); code already points at apex everywhere and stays. Dashboard state gets documented in-repo. |
| Positioning wording | **"Developer & AI Engineer"** in all SEO surfaces this spec touches (title, jobTitle, descriptions, footer). Visible site copy (hero, about prose, case studies, contact blurb) keeps "frontend" for now — content repositioning is a separate later job Nima owns. Temporary mismatch accepted. |
| Search Console | Not set up yet. Code ships a verification-token slot; Nima creates the property and supplies the token (separate tiny commit). |
| OG image | Simple branded card: **NH monogram on near-black with acid-lime accent**, static 1200×630. No name/role text on the card (Nima's call). Taste-gated: he sees the built image before it ships. |
| Favicon | Built from the NH monogram. Taste-gated the same way. |
| Out of scope | Blog/content marketing; per-page dynamic OG images (`docs/features/dynamic-og-images.md` stays unexecuted — abandoned-direction artifact); any visible-copy repositioning. |

## Workstream 1 — Recover dead ranking equity (ships first)

`next.config.js` permanent redirects:

- `/projects` → `/work` (the currently-#1, currently-404 URL; the only content route the old site had — verified via `git log --diff-filter=D`, no `/projects/:slug` children, no pages-router history).
- `/projects/:path*` → `/work` (insurance against indexed variants).
- Host-based: **exact host** `hackimi.vercel.app` → `https://hackimi.dev/:path*`, permanent. Exact match only — `*.vercel.app` preview deployments must stay untouched.

**Acceptance:** `curl -I https://www.hackimi.dev/projects` → 308 to `/work`; e2e asserts the redirect locally; vercel.app redirect verified post-deploy (host matching hard to e2e locally).

## Workstream 2 — Canonical consistency

- Nima (dashboard): set `hackimi.dev` as the primary domain in Vercel so www 308s to apex, matching every code signal. Currently it's inverted (apex 308s to www while all canonicals/sitemap/JSON-LD say apex — conflicting signals).
- Code: consolidate the 3× independently hardcoded `https://hackimi.dev` — `src/app/sitemap.ts` and the robots implementation import `SITE_URL` from `src/lib/site.ts`.
- Convert `src/app/robots.txt/route.ts` (route-handler folder) to the idiomatic `src/app/robots.ts` (`MetadataRoute.Robots`). Same output: allow all, sitemap line.
- Document the Vercel domain setup (primary domain, redirect direction, who owns it) in `docs/infra.md` so the dashboard state is no longer invisible to version control.

## Workstream 3 — Name-led metadata

Files: `src/lib/site.ts`, `src/lib/metadata.ts`, `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/contact/page.tsx`, root `layout.tsx` (footer).

- `SITE_ROLE` = `'Developer & AI Engineer'`; `SITE_TITLE` = `` `${SITE_AUTHOR} — ${SITE_ROLE}` `` (em-dash form; reads better in tabs/SERPs than the pipe).
- **Homepage title becomes the explicit full string "Nima Hakimi — Developer & AI Engineer".** Root cause being fixed: Next's `title.template` applies only to child segments, so the root `page.tsx`'s `title: 'Portfolio'` rendered as literally `<title>Portfolio</title>` — no name on the site's most important page. The fix must be asserted at the rendered layer (see Testing) because the metadata *object* was always "correct" while the resolved output was wrong.
- `SITE_DESCRIPTION` and the home/about meta descriptions drop "frontend developer" for "developer and AI engineer" phrasing. `SITE_KEYWORDS` → `['Nima Hakimi', 'Developer', 'AI Engineer', 'Next.js', 'React', 'Oslo']` (Google ignores the tag; kept harmless and consistent).
- **Footer (new, site-wide):** visible name line — `© <year> Nima Hakimi — Developer & AI Engineer, Oslo`. Today the name exists as visible text only in the hero h1; this adds one crawlable, every-page occurrence. Small server component, near-black/muted styling consistent with the design system, no navigation duties.
- **Contact page** reroutes through `buildPageMetadata()` — fixes the shipping bug where its unspecified `openGraph` falls through to the root layout's homepage OG object.
- `work/[slug]/generateMetadata` returns a real not-found title instead of `{}` on unknown slugs (minor hygiene).

## Workstream 4 — Entity graph (structured data)

Files: `src/lib/metadata.ts` (builders), `src/lib/site.ts` (links), page layouts.

- Person JSON-LD gains `@id: 'https://hackimi.dev/#person'` and ORCID (`https://orcid.org/0009-0002-6656-2498`, already public on his GitHub profile) added to `sameAs` alongside GitHub + LinkedIn. `jobTitle` follows `SITE_ROLE`.
- New **WebSite** block (all pages): name "Nima Hakimi", url apex, `publisher`/`author` referencing the Person `@id`. This is the block Google ties to site-name display in results.
- New **ProfilePage** block on `/about` with `mainEntity` → Person `@id`.
- New **BreadcrumbList** on `/work/[slug]`: Home → Work → case title.
- All emitted as separate `<script type="application/ld+json">` blocks; builders unit-tested like `buildPersonJsonLd` already is.

## Workstream 5 — Assets (taste-gated)

- **Favicon:** none exists today — Google renders a generic globe next to every hackimi.dev result. Add `src/app/icon.svg` (NH monogram, acid-lime on near-black) + `src/app/apple-icon.png` (180×180) via Next file conventions. Legacy `favicon.ico` fallback if the svg-only setup leaves gaps.
- **OG card:** replace `bigSmile.JPEG` (1536×2048 portrait declared as 1200×630 landscape — platforms may crop/reject) with a committed static `public/og.png`, 1200×630: NH monogram on near-black, acid-lime accent, simple. Declared dims match actual dims.
- **Gate:** both assets rendered and screenshotted for Nima's approval before merge. The monogram SVG already exists in the codebase (`Monogram` component) — reuse its paths.

## Workstream 6 — Sitemap honesty

`src/app/sitemap.ts`: today every URL stamps `lastModified: new Date()` on every build — a false freshness signal on all 7 URLs. Google ignores `changeFrequency`/`priority` entirely. The sitemap becomes a clean URL list (no lastmod/changefreq/priority): no signal beats a false signal, and hand-maintained dates would rot. `tests/server/sitemap.test.ts` updated to pin the new shape.

## Workstream 7 — Search Console wiring

- `verification: { google: GSC_VERIFICATION_TOKEN }` slot in `buildRootMetadata`, constant in `site.ts`, filled when Nima supplies the token (empty/absent until then — must not emit an empty tag).
- After deploy + verification, GSC gives the real index inventory (the `site:` operator probes were unreliable), recrawl requests for `/`, `/work`, `/projects` (to pick up the redirect), and the measurement layer for the acceptance criteria.

## Off-site checklist (Nima's hands — delivered with the PR)

1. **Vercel:** flip primary domain to `hackimi.dev` (Settings → Domains). One minute. Tell me when done so I verify the redirect direction flipped.
2. **Google Search Console:** create property for `https://hackimi.dev` (URL-prefix), choose meta-tag verification, send me the token. After deploy: submit `sitemap.xml`, request indexing of `/`, `/work`, `/projects`.
3. **LinkedIn:** add `hackimi.dev` to the profile website/contact section; confirm public-profile visibility is on. Your LinkedIn never surfaced in any name search — that slot is currently occupied by other Nima Hakimis.
4. **GitHub nit:** put `https://hackimi.dev` in the dedicated website field (API shows `blog: ""`; it's currently only in social links).
5. **Long game (no action now):** third-party mentions — talks, articles, podcasts — are the only lever that eventually contests the bare-name query globally.

## Testing

TDD throughout, repo conventions (`tests/unit`, `tests/server`, `tests/integration`, `e2e/`).

- **Rendered-layer first:** new `e2e/seo.spec.ts` — the homepage-title bug was invisible to unit tests (object right, resolution wrong), so the RED tests assert what a crawler sees: exact homepage `<title>`, canonical hrefs per page, `/projects` → `/work` redirect status, presence + JSON-parseability of each JSON-LD block per page type, favicon link tags, footer name line visible.
- **Unit:** metadata builders (new titles/descriptions/verification slot), new JSON-LD builders (WebSite/ProfilePage/BreadcrumbList, `@id` wiring), `resolveUrl` unchanged.
- **Server:** sitemap new shape; `robots.ts` output equivalent to the old route handler (allow all + sitemap line).
- **Post-deploy verification (not in CI):** curl the production redirects (www→apex after the flip, vercel.app→apex, /projects→/work), Google Rich Results test on `/` and one case study.

## Sequencing

1. Redirects (equity recovery — the dead #1 URL)
2. Name-led metadata + footer
3. Entity graph JSON-LD
4. Assets (favicon, OG card) — taste gates
5. Sitemap/robots consolidation
6. GSC wiring + `docs/infra.md`
7. PR → merge → deploy → his checklist → post-deploy verification → ROADMAP.md Done entry

Single branch `seo/name-query`, PR to `main`. No AI attribution anywhere in commits/PR (standing rule).

## Non-goals

- Changing visible site copy/positioning (his separate later job).
- Blog, per-page dynamic OG images, content marketing.
- Beating the Convoso CEO on the bare global query as an acceptance criterion.
