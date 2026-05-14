# Feature: Project Cost Estimator

## Context

An interactive calculator where potential clients select their project type, number of pages, and desired features, and get a rough cost and timeline estimate. This is both a practical tool for clients (no need to book a call just to get a ballpark) and a showcase of frontend interactivity. Highly differentiating — very few solo dev portfolios have this.

## Scope

**In scope:**
- New `/estimate` route or embedded widget on the services/pricing page
- Inputs: project type (landing page, web app, e-commerce), number of pages/screens, feature checklist (contact form, CMS, auth, animations, i18n, etc.), timeline urgency
- Output: estimated price range + estimated duration range + CTA to book a call / start inquiry
- Pure client-side calculation (no backend needed) — formula defined in a config object
- Disclaimer: "This is a rough estimate — book a call for an accurate quote"

**Out of scope:**
- Saved/shareable estimates
- PDF export

## Open Questions

- Embed in services/pricing page or give it its own `/estimate` route?
- How to structure the pricing formula — linear multipliers or a lookup table?
- Add an email capture at the end ("Send me this estimate") to build the list?
