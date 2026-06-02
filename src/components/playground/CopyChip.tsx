'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const VALUE = 'hakimi.nima1@gmail.com';

/**
 * A copy-to-clipboard chip. Clicking copies the value and swaps the label to
 * "COPIED" with a tick for 1.5s, then reverts. The swap is a cross-fade that
 * collapses to an instant cut under reduced motion. `aria-live` announces the
 * state change to screen readers; the button stays a single focusable target.
 */
export default function CopyChip() {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(VALUE);
    } catch {
      // Clipboard may be blocked (e.g. insecure context); still flash feedback.
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  };

  const swap = reduce
    ? { initial: false, animate: {}, exit: {} }
    : {
        initial: { y: 8, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -8, opacity: 0 },
      };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied to clipboard' : `Copy ${VALUE}`}
      className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-surface py-2 pl-4 pr-3 font-mono text-sm text-ink transition-colors hover:border-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
    >
      <span className="truncate">{VALUE}</span>
      <span
        aria-hidden
        className="relative grid h-6 w-16 place-items-center overflow-hidden rounded-full bg-white/5 text-[0.625rem] font-medium uppercase tracking-[0.12em]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="copied"
              {...swap}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 flex items-center justify-center gap-1 text-accent"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 6.5L4.8 8.8L9.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Copied
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              {...swap}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 flex items-center justify-center text-muted"
            >
              Copy
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span aria-live="polite" className="sr-only">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </button>
  );
}
