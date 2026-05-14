# Feature: Blog / Articles

## Context

Content marketing compounds over time. Articles like "5 things small businesses should know before building a website" drive organic SEO traffic from the exact audience Nima wants to reach, and position him as a knowledgeable advisor rather than just a vendor. Long-term lead generation that doesn't require active outreach.

## Scope

**In scope:**
- New `/blog` route with list view + article view
- MDX-based (content lives in the repo, no external CMS to maintain)
- Start with 2–3 articles targeted at small business owners
- Add "Blog" or "Articles" to main navigation

**Out of scope:**
- Comments, subscriptions, or newsletter integration (separate feature if desired)
- Headless CMS (unless MDX feels too limiting after starting)

## Open Questions

- MDX in-repo (simple, fast, Claude can help write articles) vs. headless CMS like Sanity or Contentful (better editing UX but more setup)?
- What's a realistic writing cadence — 1 article/month?
- Article topics to start with: brainstorm 3–5 titles targeted at small business owners before building the feature
