# Feature: Dynamic OG Images

## Context

The site currently uses a single static OG image (`/bigSmile.JPEG`) for all pages. When a page is shared on LinkedIn, Slack, or iMessage, the preview is always the same generic photo. Dynamic OG images — generated per page with title, description, and branding — improve click-through rates and look significantly more professional.

## Scope

**In scope:**
- Use Next.js built-in `ImageResponse` from `next/og` to generate images at `app/opengraph-image.tsx` (or per-route)
- Each page gets a branded image with: site name, page title, role/tagline, and a consistent visual style
- Routes to cover: homepage, about, projects, contact, services (when built), blog posts (when built)

**Out of scope:**
- Animated OG images
- Third-party OG image services

## Technical Notes

- Next.js App Router supports `opengraph-image.tsx` co-located with each route — no API route needed
- `ImageResponse` renders JSX to a PNG at request time (or statically at build time for static routes)
- Fonts need to be loaded via `fetch()` inside the image handler (not via `next/font`)
- Current `buildPageMetadata()` in `src/lib/metadata.ts` sets `openGraph.images` — this will be superseded by the file-based approach

## Open Questions

- Static generation (fast, cached) or dynamic (personalised per post for blog)?
- Design: dark background matching the site's dark theme, or light branded card?
