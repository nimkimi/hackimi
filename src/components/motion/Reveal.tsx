'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/** No observer to wait for, so reveal on the next task rather than never. */
const NO_OBSERVER_DELAY_MS = 0;
/** Safety net behind a misbehaving observer — long enough not to pre-empt a real hit. */
const OBSERVER_FALLBACK_MS = 2500;

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
 *  - under `prefers-reduced-motion` it renders statically (no transform), and
 *    it follows that preference live, not only as it stood at mount;
 *  - a live preference change never un-reveals: content already on screen stays
 *    on screen when the query flips, in either direction;
 *  - both states render the same two wrappers, so a flip never remounts the
 *    children and never drops their DOM state — the contact form is an
 *    uncontrolled <form> sitting inside a Reveal;
 *  - SSR-safe: first render is identical server/client (starts hidden, animated
 *    branch), because `useMediaQuery`'s server snapshot is "not reduced".
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
  // Derived from the media query rather than copied into state by an effect, so
  // there is no cascading render on mount and the preference is followed live.
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Following the preference live means the static branch can hand back over to
  // the animated one mid-session, and the animated branch starts hidden. The
  // static branch has been painting this content all along, so without a latch
  // turning Reduce Motion *off* would yank content out from under the user and
  // replay the 0.8s slide on it.
  //
  // This is React's documented "adjust state when a value changes" pattern
  // (react.dev/learn/you-might-not-need-an-effect): the set during render
  // re-runs this component before anything commits, so the hidden state is
  // discarded rather than painted. An effect would paint it first, and a ref
  // cannot be written during render at all.
  const [wasReduced, setWasReduced] = useState(reduce);
  if (wasReduced !== reduce) {
    setWasReduced(reduce);
    // Only the reduce -> animated direction needs seeding; the other direction
    // is leaving the animated branch, which has nothing to preserve.
    if (wasReduced) setShown(true);
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Under reduced motion nothing carries a transform to undo, so there is
    // nothing to observe and nothing to reveal.
    if (reduce) return;

    const el = ref.current;
    const io =
      el && typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              if (entries.some((e) => e.isIntersecting)) {
                setShown(true);
                io?.disconnect();
              }
            },
            { rootMargin: '0px 0px -10% 0px', threshold: 0.01 }
          )
        : null;

    if (io && el) io.observe(el);

    // Never leave content stranded: a safety net behind the observer, and the
    // only reveal path at all when there is no observer to wait for. Both run
    // as timer callbacks, so neither sets state synchronously during the effect.
    const fallback = window.setTimeout(
      () => {
        setShown(true);
        io?.disconnect();
      },
      io ? OBSERVER_FALLBACK_MS : NO_OBSERVER_DELAY_MS
    );

    return () => {
      io?.disconnect();
      window.clearTimeout(fallback);
    };
  }, [reduce]);

  // One tree in both states, differing only by a class and an inline style.
  // These used to be two returns of different shape — children at depth 1 under
  // reduced motion, at depth 2 under the transform div otherwise. That was
  // harmless while the branch was fixed for the life of the page, but now that
  // `reduce` follows the query live, React sees a type mismatch on every flip
  // and remounts the subtree, discarding any DOM state inside it. ContactClient
  // wraps an uncontrolled <form> directly in a Reveal, so that cost a visitor
  // their half-written message and their focus, in both directions.
  return (
    <div ref={ref} className={reduce ? className : `overflow-hidden ${className ?? ''}`}>
      <div
        style={
          reduce
            ? undefined
            : {
                transform: shown ? 'translateY(0)' : 'translateY(110%)',
                transition: `transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
              }
        }
      >
        {children}
      </div>
    </div>
  );
}
