# Feature: Case Studies

## Context

The current `/projects` page lists what was built. Business clients care about outcomes, not tech — they want to know: "Has this person solved a problem like mine before?" Case studies reframe each project as problem → solution → result. This is the highest-trust content type for lead conversion.

## Scope

**In scope:**
- Redesign projects section or add a `/work` route with case study format
- Each entry: client/context, problem statement, approach, result (metrics where possible), tech used in plain language
- Photography/screenshots of the work

**Out of scope:**
- Blog-style long-form writing (separate feature)

## Open Questions

- Separate `/work` route or replace `/projects`? (Recommendation: `/work` to signal professional framing; keep `/projects` for open-source/personal)
- How to handle projects without real client outcomes — frame as "concept" or "personal project"?
- Data lives in `src/data/projects.ts` — extend the type, or create a new `src/data/work.ts`?
