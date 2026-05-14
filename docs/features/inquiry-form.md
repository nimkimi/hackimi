# Feature: Structured Inquiry Form

## Context

The current contact form is generic — it accepts any message with no context. A structured inquiry form (project type, budget range, timeline) pre-qualifies leads before a call, filters out bad-fit clients, and signals professionalism. Nima arrives at every discovery call already knowing what the client needs.

## Scope

**In scope:**
- Replace or extend the contact form at `/contact` (or add a new `/hire` route)
- Additional fields: project type (dropdown: landing page, web app, e-commerce, maintenance, other), rough budget range (radio: under €1k, €1–5k, €5–15k, €15k+), desired start date (month picker or text), brief description of the project
- Keep the existing Zod validation + reCAPTCHA + nodemailer flow
- Update the email template to include the new fields

**Out of scope:**
- CRM integration
- Auto-responder sequences

## Open Questions

- Replace the existing `/contact` form or add as a separate `/hire` or `/start-a-project` route? (Recommendation: separate route, keep contact for general messages)
- How to handle the reCAPTCHA widget position with more form fields?
- Budget ranges — use EUR (Oslo-based) or keep currency-neutral?
