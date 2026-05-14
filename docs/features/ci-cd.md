# Feature: CI/CD Pipeline (GitHub Actions)

## Context

A CI/CD pipeline runs tests automatically on every push and deploys to production on merge to main. For a portfolio targeting technical co-founders or in-house dev reviewers, a green CI badge on the GitHub repo is a visible signal of professionalism. It also protects the portfolio from regressions as new features are added.

## Scope

**In scope:**
- GitHub Actions workflow: `.github/workflows/ci.yml`
- On every push / PR: install deps, run `npm run lint`, run `npm run check` (prettier), run Vitest unit tests
- On push to `main`: trigger Vercel deployment (Vercel's GitHub integration handles this automatically — just confirm it's set up)
- Optional: Playwright E2E tests in CI (requires more setup — headed browser in CI)
- Add CI status badge to `README.md`

**Out of scope:**
- Self-hosted runners
- Preview deployments per PR (Vercel handles this automatically)

## Open Questions

- Run Playwright E2E in CI from the start or add later (needs browser install step, slower)?
- Cache `node_modules` between runs to speed up CI?
- Notify on failure via email or Slack?
