# Infrastructure notes (state that lives outside this repo)

## Domains (Vercel dashboard → Settings → Domains)

- Production domains: `hackimi.dev` (apex) and `www.hackimi.dev`.
- **Canonical host: apex `https://hackimi.dev`** — every canonical tag, sitemap URL, robots Sitemap line, and JSON-LD url in this repo uses apex.
- Redirect direction: `www` → 308 → apex. (Flipped 2026-08-\_\_ by Nima; before that the dashboard had apex → www, contradicting the code's canonicals.)
- `hackimi.vercel.app` additionally 308s to apex via `next.config.js` (exact-host rule — preview URLs on \*.vercel.app are deliberately not matched).

## Deployments

- Production deploys are automatic but CI-gated (commit `1c92564`, 2026-06-02): GitHub Actions runs lint/types/Vitest/Playwright on every push, and a deploy job (`vercel build` + `vercel deploy --prebuilt --prod`) runs only on `main` after the tests pass.
- `vercel.json` sets `git.deploymentEnabled.main: false` to disable Vercel's OWN git auto-deploy for `main` only — so production flows exclusively through the tested CI gate while PR/branch previews keep deploying via Vercel as normal. Merging to `main` therefore DOES deploy, via CI.

## Search Console

- Property: `https://hackimi.dev` (URL-prefix), meta-tag verification.
- Token lives in `SITE_GOOGLE_SITE_VERIFICATION` (`src/lib/site.ts`); empty string disables the tag entirely.
- After each SEO-relevant deploy: submit `sitemap.xml`, request indexing of changed URLs.
