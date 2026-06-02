'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'motion/react';
import type { MouseEvent, ReactNode } from 'react';

// A motion-enabled next/link so internal navigation stays client-side (no full
// reload, no re-firing the Preloader) while still receiving the magnetic spring
// transform via `style`.
const MotionLink = motion.create(Link);

/**
 * Internal app routes (`/contact`, `/about`) navigate client-side via next/link.
 * Hash-only links (`#work`) and external links (`http`, `mailto`, `tel`) stay as
 * plain anchors. A `/#work`-style link is treated as a hash link, not a route.
 */
function isInternalRoute(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('/#');
}

type MagneticButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  /** Max pixel translation toward the cursor. */
  strength?: number;
};

const BASE_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium bg-accent text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base';

/**
 * A CTA that drifts toward the cursor on hover and springs back on leave.
 *
 * The magnetic effect is disabled for touch devices (`pointer: coarse`) and
 * for users who request reduced motion — in those cases a plain, statically
 * styled element is rendered. With `href`, renders a next/link `<Link>` for
 * internal app routes (client-side nav, prefetch) and a plain `<a>` for hash
 * and external links; without `href`, a `<button>`.
 */
export default function MagneticButton({
  children,
  href,
  onClick,
  className,
  strength = 8,
}: MagneticButtonProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Detect touch pointers after mount only. Reading `matchMedia` during render
  // (SSR vs. client) would desync the markup and cause a hydration mismatch, so
  // we default to the safe, non-magnetic branch on the first paint and enable
  // the magnetic effect once we know we're on a fine-pointer device.
  const [magneticEnabled, setMagneticEnabled] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    setMagneticEnabled(!coarsePointer);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 250, damping: 18, mass: 0.4 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const classes = `${BASE_CLASS} ${className ?? ''}`.trim();

  // Touch devices and reduced-motion users get a plain element — no listeners,
  // no transforms. `magneticEnabled` starts false (matching SSR) and only flips
  // true after mount on a fine-pointer device.
  if (reduce || !magneticEnabled) {
    if (href) {
      if (isInternalRoute(href)) {
        return (
          <Link href={href} onClick={onClick} className={classes}>
            {children}
          </Link>
        );
      }
      return (
        <a href={href} onClick={onClick} className={classes}>
          {children}
        </a>
      );
    }
    return (
      <button type="button" onClick={onClick} className={classes}>
        {children}
      </button>
    );
  }

  const handleMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    // Normalise against half-size and clamp the pull to `strength` px.
    const cap = (v: number, half: number) =>
      Math.max(-1, Math.min(1, v / half)) * strength;
    x.set(cap(relX, rect.width / 2));
    y.set(cap(relY, rect.height / 2));
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const shared = {
    ref: ref as React.Ref<never>,
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    onClick,
    className: classes,
    style: { x: springX, y: springY },
  };

  if (href) {
    // Internal routes navigate client-side; the magnetic spring is applied to
    // the underlying <a> next/link renders, so the effect still works.
    if (isInternalRoute(href)) {
      return (
        <MotionLink href={href} {...shared}>
          {children}
        </MotionLink>
      );
    }
    return (
      <motion.a href={href} {...shared}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button type="button" {...shared}>
      {children}
    </motion.button>
  );
}
