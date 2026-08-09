import { SITE_AUTHOR, SITE_ROLE, SITE_LOCATION } from '@/lib/site';

/**
 * Site-wide footer. Besides closing the page visually, this is the one
 * crawlable spot outside the hero h1 where the full name appears as text
 * on every route (the nav logo is an SVG with only an aria-label).
 */
export default function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="mt-[clamp(3rem,8vh,5rem)] border-t border-white/10 py-8">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
          © {new Date().getFullYear()} {SITE_AUTHOR} — {SITE_ROLE}, {SITE_LOCATION.city}
        </p>
      </div>
    </footer>
  );
}
