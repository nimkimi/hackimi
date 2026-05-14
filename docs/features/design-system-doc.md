# Feature: Design System Document

## Context

As new features are added, design decisions get made inconsistently across sessions. A single `docs/DESIGN.md` captures the target visual language — colors, typography, spacing, motion principles, component patterns — and gets referenced in `CLAUDE.md` so every Claude Code session automatically follows it. Prevents drift between features.

## Scope

**In scope:**
- Create `docs/DESIGN.md` covering: color tokens (light/dark), typography (font, scale, weights), spacing conventions, animation philosophy, component patterns (card, btn, muted, etc.), dark mode rules, accessibility baseline
- Add a pointer to it in `.claude/CLAUDE.md`

**Out of scope:**
- No code changes — document only
- Not a Figma file or visual mockup

## Open Questions

- Should this document the **current** design as-is, or define the **target** design direction for the redesign first? (Recommendation: do the redesign spec first, then write DESIGN.md to reflect the new direction)
- What tools/format? Plain markdown is simplest and Claude-readable.
