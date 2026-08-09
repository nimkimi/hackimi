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
