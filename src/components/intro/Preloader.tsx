'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Monogram from '@/components/brand/Monogram';
import { INTRO_KEY, shouldPlayIntro } from '@/lib/intro';

/**
 * SIGNATURE ARRIVAL ANIMATION (Task 5).
 *
 * A ~2.0s, once-per-session intro ported from the validated prototype
 * (`mockups/v3/index.html`). An NH monogram strokes on at center, flies into the
 * nav as the logo, the hero name reveals behind a mask, and the settled nav mark
 * gives one acid-lime pop.
 *
 * Correctness contract:
 * - SSR-safe: the overlay is rendered on first paint, identical server/client.
 *   sessionStorage / matchMedia are only read inside the layout effect.
 * - No CLS: the hero and nav already exist in final layout *under* the overlay.
 *   This component only animates their reveal; it never gates their existence.
 * - Skip path (reduced-motion OR already-seen): the overlay is removed before
 *   paint and the hero/nav defaults (visible) are left untouched. No GSAP, no flash.
 * - Fail-safe: every DOM lookup is guarded and the whole timeline is wrapped in
 *   try/catch that restores the final visible state on any error.
 */

const EXPO = 'expo.out';
const ACCENT = '#C6FF3D';
const INK = '#F5F5F0';

export default function Preloader() {
  // `show` controls whether the overlay stays mounted. It starts `true` so the
  // first render (server + client) is identical — the decision to skip/play is
  // made in the layout effect below, never during render.
  const [show, setShow] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const flyingRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // SSR guard — only ever runs client-side, but be explicit.
    if (typeof window === 'undefined') return;

    // Optional replay affordance, test-only: ?replay clears the seen flag.
    if (window.location.search.includes('replay')) {
      try {
        window.sessionStorage.removeItem(INTRO_KEY);
      } catch {
        /* ignore */
      }
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const play = shouldPlayIntro(window.sessionStorage, reduce);

    // Restores the final, visible state and tears down the overlay. Safe to call
    // from the skip path, on completion, or from the error handler.
    const finish = () => {
      const navSlot = document.querySelector<HTMLElement>('#nav-logo-slot');
      const heroLines =
        document.querySelectorAll<HTMLElement>('[data-hero-line]');
      // Leave nav + hero in their default visible state (clear any inline
      // styles the timeline may have set).
      if (navSlot) gsap.set(navSlot, { clearProps: 'opacity' });
      if (heroLines.length) gsap.set(heroLines, { clearProps: 'transform' });
      setShow(false);
    };

    // SKIP PATH — hide instantly, no GSAP, no flash. Defaults are already final.
    if (!play) {
      setShow(false);
      return;
    }

    // PLAY PATH ----------------------------------------------------------------
    let tl: gsap.core.Timeline | null = null;

    // Wait two frames so fonts/layout settle before measuring rects.
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        try {
          const overlay = overlayRef.current;
          const flying = flyingRef.current;
          const navSlot =
            document.querySelector<HTMLElement>('#nav-logo-slot');
          const heroLines =
            document.querySelectorAll<HTMLElement>('[data-hero-line]');
          const flyingPaths = flying
            ? Array.from(flying.querySelectorAll<SVGPathElement>('path'))
            : [];

          // Robustness: if anything load-bearing is missing, fail safe.
          if (
            !overlay ||
            !flying ||
            !navSlot ||
            heroLines.length === 0 ||
            flyingPaths.length === 0
          ) {
            finish();
            return;
          }

          // PREP --------------------------------------------------------------
          gsap.set(navSlot, { opacity: 0 });
          gsap.set(heroLines, { yPercent: 110 });
          // Prime the flying monogram's stroke draw.
          flyingPaths.forEach((p) => {
            const len = p.getTotalLength();
            p.style.strokeDasharray = String(len);
            p.style.strokeDashoffset = String(len);
          });
          gsap.set(flying, { x: 0, y: 0, scale: 1, opacity: 1 });
          gsap.set(overlay, { yPercent: 0, backgroundColor: '#0E0E10' });

          // MEASURE: flying center vs nav-slot center.
          const startRect = flying.getBoundingClientRect();
          const slotRect = navSlot.getBoundingClientRect();
          const dx =
            slotRect.left +
            slotRect.width / 2 -
            (startRect.left + startRect.width / 2);
          const dy =
            slotRect.top +
            slotRect.height / 2 -
            (startRect.top + startRect.height / 2);
          const targetScale = slotRect.width / startRect.width;

          tl = gsap.timeline({
            defaults: { ease: EXPO },
            onComplete: () => {
              try {
                window.sessionStorage.setItem(INTRO_KEY, '1');
              } catch {
                /* ignore */
              }
              finish();
            },
          });

          // 1) DRAW ON (0.0 -> ~0.9)
          tl.to(
            flyingPaths,
            { strokeDashoffset: 0, duration: 0.9, stagger: 0.06 },
            0,
          );

          // 2) FLY TO NAV (~0.85 -> 1.55) — lands exactly on the nav slot.
          tl.to(
            flying,
            {
              x: dx,
              y: dy,
              scale: targetScale,
              duration: 0.7,
              immediateRender: false,
            },
            0.85,
          );

          // Overlay background fades to transparent + lifts to reveal the hero.
          tl.to(
            overlay,
            { backgroundColor: 'rgba(14,14,16,0)', duration: 0.6 },
            1.0,
          );
          tl.to(overlay, { yPercent: -2, duration: 0.7 }, 1.0);

          // 4) NAME REVEAL (~1.0 -> 1.8). Page becomes interactive as it starts.
          tl.set(overlay, { pointerEvents: 'none' }, 1.0);
          tl.to(
            heroLines,
            { yPercent: 0, duration: 0.9, stagger: 0.08 },
            1.0,
          );

          // 5) HAND-OFF: reveal the nav logo a hair BEFORE the flying mark fades,
          // so there is no 1-frame gap.
          tl.to(navSlot, { opacity: 1, duration: 0.25 }, 1.5);
          tl.to(
            flying,
            { opacity: 0, duration: 0.3, ease: 'power2.out' },
            1.6,
          );

          // ACCENT POP (~1.6 -> 2.0): one acid-lime beat on the settled nav mark.
          tl.add(() => {
            const navPaths = navSlot.querySelectorAll<SVGPathElement>('path');
            if (!navPaths.length) return;
            gsap.fromTo(
              navPaths,
              { stroke: INK },
              {
                stroke: ACCENT,
                duration: 0.18,
                ease: 'power2.out',
                onComplete: () => {
                  gsap.to(navPaths, {
                    stroke: INK,
                    duration: 0.5,
                    ease: 'power2.inOut',
                    // Clear so the resting mark falls back to currentColor.
                    onComplete: () => gsap.set(navPaths, { clearProps: 'stroke' }),
                  });
                },
              },
            );
          }, 1.62);
        } catch {
          // Any failure: restore final state, never leave the page stuck.
          finish();
        }
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      tl?.kill();
    };
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden
      className="fixed inset-0 z-[60] flex items-center justify-center bg-base"
    >
      <div ref={flyingRef} className="will-change-transform">
        <Monogram className="h-24 w-24 text-ink sm:h-28 sm:w-28" />
      </div>
    </div>
  );
}
