# Feature: Manual Dark/Light Mode Toggle

## Context

The site currently follows system preference only (`darkMode: 'media'` in Tailwind). Users expect a manual toggle — it's a visible sign of attention to detail, and some users prefer a different mode than their system default. Also useful for demonstrating the design in both themes during a client presentation.

## Scope

**In scope:**
- Toggle button in the header (sun/moon icon)
- Persist preference to `localStorage`
- Override system preference when the user has set one explicitly
- Fallback to system preference on first visit (no flash of wrong theme)
- Switch Tailwind from `darkMode: 'media'` to `darkMode: 'class'` — apply `dark` class on `<html>`

**Out of scope:**
- System preference sync after user overrides (user's manual choice wins until they reset)

## Technical Notes

- Requires switching `tailwind.config.ts` `darkMode` from `'media'` to `'class'`
- Needs a small inline script in `<head>` (before paint) to apply the saved class and avoid flash
- Toggle component must be a `'use client'` component
- All existing `dark:` utility classes continue to work unchanged — only the trigger mechanism changes
