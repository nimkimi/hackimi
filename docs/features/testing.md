# Feature: Testing (Playwright + Vitest)

## Context

There are currently no tests in the project. As the codebase grows — more server actions, inquiry form, blog, case studies — untested code becomes risky to change. Testing strategy is decided: Playwright for E2E user flows, Vitest for server action unit tests. React Testing Library is deferred until the redesign adds meaningful client-side interactivity worth isolating.

## Scope

**In scope:**

*Vitest — server action unit tests:*
- Install `vitest`, `@vitest/coverage-v8`
- Configure `vitest.config.ts` for Next.js ESM environment
- Initial test file: `src/app/contact/__tests__/actions.test.ts`
- Cover: Zod validation edge cases (missing fields, invalid email, too-short message), reCAPTCHA bypass in test env, nodemailer mock, success + error response shapes
- Pattern extends to future server actions (inquiry form, etc.)

*Playwright — E2E user flows:*
- Install `@playwright/test`
- Configure `playwright.config.ts` — baseURL `http://localhost:3000`, Chromium only to start
- Add `npm run test:e2e` script to `package.json`
- Initial test suites:
  - Navigation: all links resolve, active state highlights correctly
  - Homepage: hero renders, CTA buttons present
  - Contact form: happy path, validation errors on empty submit, reCAPTCHA widget present
  - 404: unknown routes show not-found UI

*`CLAUDE.md` update:*
- Add `npm run test` (Vitest) and `npm run test:e2e` (Playwright) to the Commands section
- Note that server action tests live in `__tests__/` alongside the action file

**Out of scope:**
- React Testing Library / component tests (revisit after redesign)
- CI pipeline integration (separate concern)
- Visual regression testing

## Open Questions

- Run Playwright against dev server or production build? (Recommendation: dev server for speed; CI can use `next build && next start`)
- Enable Vitest coverage reporting from the start, or add later?
- Mock nodemailer at the module level or use a test SMTP server?
