'use client';

import { useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const OPTIONS = ['Design', 'Build', 'Ship'] as const;
type Option = (typeof OPTIONS)[number];

/**
 * A segmented control with a single acid-lime indicator that slides between
 * options. The indicator uses a shared `layoutId` so it physically travels
 * (springs) from one segment to the next; under reduced motion it jumps.
 *
 * Keyboard: roving tabindex — Left/Right (and Up/Down) move the selection,
 * Home/End jump to the ends. Implemented as an ARIA radiogroup.
 */
export default function SegmentedControl() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<Option>('Build');
  const groupId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusIndex = (i: number) => {
    const clamped = (i + OPTIONS.length) % OPTIONS.length;
    setActive(OPTIONS[clamped]);
    refs.current[clamped]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        focusIndex(i + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        focusIndex(i - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusIndex(0);
        break;
      case 'End':
        e.preventDefault();
        focusIndex(OPTIONS.length - 1);
        break;
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Workflow stage"
      className="inline-flex rounded-full border border-white/10 bg-surface p-1"
    >
      {OPTIONS.map((opt, i) => {
        const selected = opt === active;
        return (
          <button
            key={opt}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => setActive(opt)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            {selected && (
              <motion.span
                layoutId={`seg-${groupId}`}
                aria-hidden
                className="absolute inset-0 rounded-full bg-accent"
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 480, damping: 34 }}
              />
            )}
            <span className={`relative z-10 ${selected ? 'text-dark' : 'text-muted'}`}>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
