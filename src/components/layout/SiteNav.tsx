'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Monogram from '@/components/brand/Monogram';
import UnderlineLink from '@/components/motion/UnderlineLink';
import MagneticButton from '@/components/motion/MagneticButton';

type NavItem = { label: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Playground', href: '/#playground' },
  { label: 'Contact', href: '/contact' },
];

/**
 * Sticky primary site navigation.
 *
 * Left holds `#nav-logo-slot` — the landing target for the arrival animation.
 * The monogram is rendered visible by default so no-JS, reduced-motion, and
 * repeat-visit users always see the logo; the Preloader only hides/reveals it
 * when it actually plays the intro. Sits at `z-40`, below the intro overlay
 * (`z-[60]`).
 */
export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-40 border-b border-white/10 bg-dark/70 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
        {/* Logo slot — arrival animation landing target. Visible by default. */}
        <Link
          id="nav-logo-slot"
          href="/"
          aria-label="Nima Hakimi — home"
          className="relative flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
        >
          <Monogram
            className="h-7 w-7 text-ink"
            title="Nima Hakimi — home"
          />
        </Link>

        {/* Desktop links + CTA */}
        <div className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-7">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <UnderlineLink
                  href={item.href}
                  className="mono-label transition-colors hover:text-ink"
                >
                  {item.label}
                </UnderlineLink>
              </li>
            ))}
          </ul>
          <MagneticButton
            href="/contact"
            className="mono-label !text-dark"
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-dark"
            />
            Let&apos;s talk
          </MagneticButton>
        </div>

        {/* Mobile: compact CTA + menu toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <Link
            href="/contact"
            className="mono-label inline-flex min-h-11 items-center rounded-full bg-accent px-4 py-2.5 !text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
          >
            Let&apos;s talk
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
          >
            <span className="relative block h-3.5 w-5" aria-hidden>
              <span
                className={`absolute left-0 block h-px w-full bg-current transition-transform duration-300 ${
                  open ? 'top-1/2 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 block h-px w-full bg-current transition-opacity duration-200 ${
                  open ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-full bg-current transition-transform duration-300 ${
                  open ? 'top-1/2 -rotate-45' : 'bottom-0'
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        id="mobile-nav-panel"
        hidden={!open}
        className="border-t border-white/10 bg-dark/95 backdrop-blur md:hidden"
      >
        <ul className="mx-auto flex max-w-6xl flex-col px-5 py-2 sm:px-6">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="mono-label block py-3.5 transition-colors hover:text-ink focus-visible:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
