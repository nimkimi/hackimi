'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * Lenis-powered smooth-scroll provider.
 *
 * Mounts a Lenis instance with a requestAnimationFrame loop on mount and tears
 * it down on unmount. Users who request reduced motion get native scrolling —
 * Lenis is never instantiated for them.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Default options: Lenis manages the `lenis*` classes on <html> itself.
    const lenis = new Lenis({ lerp: 0.1 });

    let id = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    });

    // Smooth in-page anchor navigation (`/#work`, `#playground`, `#contact`).
    // We intercept clicks on links whose target is a same-page hash and hand
    // the scroll to Lenis. Anything that isn't a resolvable in-page target is
    // left to the browser (native jump still works, the CSS import above fixes
    // the main scroll conflict).
    const handleAnchorClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement | null)?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || !href.includes('#')) return;
      if (anchor.target && anchor.target !== '_self') return;

      // Only handle same-page hashes (`#id` or `/path#id` matching this page).
      const url = new URL(anchor.href, window.location.href);
      if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
        return;
      }
      const hash = url.hash;
      if (!hash || hash === '#') return;

      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      lenis.scrollTo(target as HTMLElement);
      if (window.history.replaceState) {
        window.history.replaceState(null, '', hash);
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
