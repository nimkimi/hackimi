'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Masked scroll-reveal. The wrapper clips overflow while the child slides up
 * from beneath the mask the first time it enters the viewport.
 *
 * Implemented with a direct IntersectionObserver + CSS transition (NOT Motion's
 * `whileInView`, whose percentage `rootMargin` silently failed to set up the
 * observer and left content stranded off-screen). Hard guarantees:
 *  - content reveals as soon as it enters the viewport (or immediately if it's
 *    already in view on mount);
 *  - a safety fallback reveals it regardless after a short delay, and if
 *    IntersectionObserver is unavailable, so content can never be stranded;
 *  - under `prefers-reduced-motion` it renders statically (no transform).
 *  - SSR-safe: first render is identical server/client (starts hidden), the
 *    reveal decision happens only in the effect.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduce(true);
      setShown(true);
      return;
    }

    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.01 },
    );
    io.observe(el);

    // Safety net: never leave content stranded, even if the observer misbehaves.
    const fallback = window.setTimeout(() => {
      setShown(true);
      io.disconnect();
    }, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ''}`}>
      <div
        style={{
          transform: shown ? 'translateY(0)' : 'translateY(110%)',
          transition: `transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
