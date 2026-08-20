# Infrastructure notes (state that lives outside this repo)

## Domains (Vercel dashboard → Settings → Domains)

- Production domains: `hackimi.dev` (apex) and `www.hackimi.dev`.
- **Canonical host: apex `https://hackimi.dev`** — every canonical tag, sitemap URL, robots Sitemap line, and JSON-LD url in this repo uses apex.
- Redirect direction: `www` → 308 → apex. (Flipped 2026-08-20. Before that it ran apex → www, which did more than contradict the code's canonicals: `sitemap.xml` fed Google the apex, the apex redirected to `www`, and `www` served a page whose canonical pointed back at the apex — so every submitted URL redirected away from itself onto a page pointing back at the redirector.)
- That direction is a per-project domain setting, and `vercel domains` has no subcommand for it — it is API-only: `PATCH /v9/projects/{projectId}/domains/{domain}?teamId=…` with `{"redirect", "redirectStatusCode"}`. Clear the old redirect before adding the new one; setting the new one first leaves the two hosts pointing at each other. DNS is not involved — apex `A 76.76.21.21` and `www CNAME → apex` already serve both, and the nameservers are Hostinger's.
- `hackimi.vercel.app` additionally 308s to apex via `next.config.js` (exact-host rule — preview URLs on \*.vercel.app are deliberately not matched).

## Deployments

- Production deploys are automatic but CI-gated (commit `1c92564`, 2026-06-02): GitHub Actions runs lint/types/Vitest/Playwright on every push, and a deploy job (`vercel build` + `vercel deploy --prebuilt --prod`) runs only on `main` after the tests pass.
- `vercel.json` sets `git.deploymentEnabled.main: false` to disable Vercel's OWN git auto-deploy for `main` only — so production flows exclusively through the tested CI gate while PR/branch previews keep deploying via Vercel as normal. Merging to `main` therefore DOES deploy, via CI.

## Search Console

- Property: `https://hackimi.dev` (URL-prefix), meta-tag verification.
- Token lives in `SITE_GOOGLE_SITE_VERIFICATION` (`src/lib/site.ts`); empty string disables the tag entirely.
- After each SEO-relevant deploy: submit `sitemap.xml`, request indexing of changed URLs.
