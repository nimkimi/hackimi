# Feature: Lighthouse / Core Web Vitals Showcase

## Context

"This site scores 100 on performance" is a powerful statement on a frontend developer's portfolio. It demonstrates that Nima doesn't just build things that look good — he builds things that perform. Small businesses increasingly hear about page speed from Google Ads and SEO consultants, so this resonates even with non-technical clients.

## Scope

**In scope:**
- Display Lighthouse scores (Performance, Accessibility, Best Practices, SEO) prominently — likely on the homepage or services page
- Scores should be real, kept up to date (manual or automated)
- Visual treatment: the four circular score indicators styled to match the site's design

**Out of scope:**
- Automated Lighthouse CI (can add later via `lighthouse-ci` GitHub Action)
- Real-time score fetching (static is fine — update when deploying major changes)

## Open Questions

- Static scores (hardcoded, manually updated) or automated via Lighthouse CI GitHub Action?
- Where to display: homepage hero area, footer, or services page as a trust signal?
- Show all four scores or just Performance + Accessibility?
