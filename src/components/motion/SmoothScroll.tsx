'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

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

    const lenis = new Lenis({ lerp: 0.1 });

    let id = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
