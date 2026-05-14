# Feature: FAQ Section

## Context

Potential clients have the same questions before they reach out: "Do you work outside Norway?", "What does a project cost?", "How long does it take?", "Do you offer maintenance?" Answering these on the site removes friction, filters for good-fit clients, and reduces back-and-forth before first contact.

## Scope

**In scope:**
- FAQ section — likely on the services page or as a standalone section at the bottom of the homepage
- 6–10 questions covering: process, pricing, timeline, tech stack, maintenance, geographic availability, communication style
- Accordion UI (expand/collapse) to keep the page scannable
- Schema markup (`FAQPage` JSON-LD) for Google rich results

**Out of scope:**
- Dynamic CMS-managed FAQ (static is fine, update as needed)

## Open Questions

- Location: homepage (broad audience), services page (pre-sales context), or its own `/faq` route?
- Write the questions from scratch or workshop them based on real inquiries received?
- Accordion animation: CSS-only or Framer Motion (once redesign lands)?
