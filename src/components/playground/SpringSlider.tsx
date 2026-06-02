'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';

const MIN = 0;
const MAX = 100;

/**
 * A draggable slider with a springy thumb that drives a live value readout and
 * an acid-lime fill. The thumb is a native-feeling custom control built on an
 * ARIA `slider` role so it is fully keyboard-operable (Arrow keys step by 1,
 * Shift+Arrow / PageUp/Down by 10, Home/End to the bounds).
 *
 * Reduced motion: the spring is collapsed to an instant follow so the thumb
 * tracks the pointer/keyboard with no overshoot.
 */
export default function SpringSlider() {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(64);
  const [dragging, setDragging] = useState(false);

  // Fraction 0..1 of the current value, smoothed by a spring for the visual.
  const pct = useMotionValue(value / MAX);
  const springPct = useSpring(pct, { stiffness: 420, damping: 32, mass: 0.6 });
  const visualPct = reduce ? pct : springPct;

  const fillWidth = useTransform(visualPct, (p) => `${p * 100}%`);
  const thumbLeft = useTransform(visualPct, (p) => `${p * 100}%`);

  useEffect(() => {
    pct.set(value / MAX);
  }, [value, pct]);

  const setFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const next = Math.round(MIN + Math.min(1, Math.max(0, ratio)) * (MAX - MIN));
    setValue(next);
  };

  const startDrag = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
    setFromClientX(e.clientX);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setFromClientX(e.clientX);
  };

  const endDrag = () => setDragging(false);

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next = value;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = value + (e.shiftKey ? 10 : 1);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = value - (e.shiftKey ? 10 : 1);
        break;
      case 'PageUp':
        next = value + 10;
        break;
      case 'PageDown':
        next = value - 10;
        break;
      case 'Home':
        next = MIN;
        break;
      case 'End':
        next = MAX;
        break;
      default:
        return;
    }
    e.preventDefault();
    setValue(Math.min(MAX, Math.max(MIN, next)));
  };

  return (
    <div className="w-full max-w-xs select-none">
      <div className="mb-4 flex items-baseline gap-2 font-display">
        <span className="text-4xl font-bold tabular-nums text-ink">{value}</span>
        <span className="text-sm text-muted">/ {MAX}</span>
      </div>

      <div
        ref={trackRef}
        onPointerDown={startDrag}
        onPointerMove={onMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative h-10 cursor-pointer touch-none"
      >
        {/* Rail */}
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10" />
        {/* Fill */}
        <motion.div
          aria-hidden
          style={{ width: fillWidth }}
          className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
        />
        {/* Thumb */}
        <motion.div
          role="slider"
          aria-label="Value"
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={value}
          tabIndex={0}
          onKeyDown={onKeyDown}
          style={{ left: thumbLeft }}
          animate={reduce ? undefined : { scale: dragging ? 1.25 : 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-base shadow-[0_0_0_4px_rgba(198,255,61,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-base"
        />
      </div>
    </div>
  );
}
