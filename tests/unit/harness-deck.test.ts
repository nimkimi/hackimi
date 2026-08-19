import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import sitemap from '@/app/sitemap';
import nextConfig from '../../next.config.js';

const repoRoot = join(__dirname, '..', '..');
const deck = readFileSync(join(repoRoot, 'public/harness.html'), 'utf8');

// The talk deck at /harness is unlisted, not private: nothing links to it, but
// the site's robots.txt allows the whole origin, so a crawler that ever learns
// the URL (a shared link, a referrer header) would index it and put a Norwegian
// slide deck in the results for a name the homepage is tuned to own. "Unlisted"
// has to be enforced on the page itself — listing /harness in robots.txt would
// advertise the exact URL it is meant to keep quiet.
describe('unlisted talk deck', () => {
  it('carries a noindex robots directive', () => {
    expect(deck).toMatch(/<meta\s+name="robots"\s+content="[^"]*noindex/i);
  });

  it('is absent from the sitemap', () => {
    const urls = sitemap().map((e) => e.url);

    expect(urls.some((u) => u.includes('harness'))).toBe(false);
  });

  it('is reachable at /harness via a rewrite to the static file', async () => {
    // `rewrites` is optional on NextConfig, so losing the whole hook is a way
    // this could break that a lookup in its result would not catch.
    const { rewrites } = nextConfig;
    if (!rewrites) throw new Error('next.config.js no longer defines rewrites()');

    expect(await rewrites()).toContainEqual({
      source: '/harness',
      destination: '/harness.html',
    });
  });
});

// The deck is presented from a laptop in a meeting room, where the wifi is
// someone else's problem and a blocked CDN means a broken slide mid-talk. It is
// one file with everything inlined, and that is a property worth holding: any
// external <script>, <link>, @import, url() or fetch() would make rendering
// depend on the network at exactly the wrong moment.
describe('talk deck is self-contained', () => {
  it('loads no external subresources', () => {
    expect(deck).not.toMatch(/\bsrc\s*=/i);
    expect(deck).not.toMatch(/\bhref\s*=/i);
    expect(deck).not.toMatch(/@import\b/i);
    expect(deck).not.toMatch(/\burl\(/i);
    expect(deck).not.toMatch(/\bfetch\(/i);
  });

  it('references no remote origin', () => {
    expect(deck).not.toMatch(/https?:\/\//i);
  });
});
