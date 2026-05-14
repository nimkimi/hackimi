# Feature: Availability Indicator

## Context

A simple "Currently available for projects starting [month]" badge signals that Nima is an active working professional taking on new work — not a student with a static portfolio. It creates mild urgency, sets timeline expectations, and makes the portfolio feel alive.

## Scope

**In scope:**
- Small availability badge/indicator visible in the header and/or hero section
- A field in `src/lib/site.ts` to control the status (available, limited, unavailable) and the "starting from" date
- Update manually when availability changes

**Out of scope:**
- Dynamic/automated availability (calendar integration, etc.)

## Open Questions

- Static string in `site.ts` (simple, manual update) or a more structured status field with enum states?
- Display locations: header only, hero only, or both + services page?
- Visual style: green dot + text, a badge chip, or inline sentence in the hero copy?
