'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { INTRO_KEY, shouldPlayIntro } from '@/lib/intro';

/**
 * SIGNATURE ARRIVAL ANIMATION — "Reveal through the mark" (aperture, variant B).
 *
 * Ported from the validated prototype `mockups/arrival-b-aperture/index.html`.
 * Choreography (~2.1s, once per session):
 *   1. A centered NH monogram DRAWS ON via strokeDashoffset, a glowing acid-lime
 *      spark riding the drawing tip; strokes settle lime -> ink ("ink drying").
 *   2. The stroked NH cross-fades into a SOLID NH, which becomes a TRANSPARENT
 *      HOLE punched out of a full-screen opaque overlay (SVG <mask>: white rect =
 *      opaque overlay, black NH = hole). The hole SCALES UP from its own centre
 *      (~1 -> 16) so the hero is revealed THROUGH the letterforms, a lime rim
 *      glowing on the opening edge.
 *   3. As the aperture opens, the hero name reveals (masked yPercent 110 -> 0),
 *      the nav logo settles in, and the parked spark flies into the name's period.
 *
 * Correctness contract (kept from v1):
 * - SSR-safe: the overlay is rendered on first paint, identical server/client.
 *   sessionStorage / matchMedia are read ONLY inside the layout effect.
 * - No CLS: the hero and nav already exist in final layout *under* the overlay.
 *   This component only animates their reveal; it never gates their existence.
 * - Skip path (reduced-motion OR already-seen): overlay removed before paint,
 *   hero/nav/period left in their default visible state. No GSAP, no flash.
 * - Fail-safe: every DOM lookup is guarded; the timeline build is wrapped in
 *   try/catch that restores the final visible state on any error. The page can
 *   never get stuck behind the overlay or with the hero hidden.
 * - Mobile-first: the mask SVG viewBox is the viewport in px; works at 375px+.
 */

const BG = '#0E0E10';
const INK = '#F5F5F0';
const ACCENT = '#C6FF3D';

// NH geometry in a 120x120 userspace box — copied verbatim from the prototype so
// the aperture math (centre, period landing, hole thickness) stays identical.
const NH = {
  N: 'M22 96 L22 24 L74 92 L74 24',
  H: 'M84 96 L84 24 M84 60 L112 60 M112 24 L112 96',
};
// Same NH as explicit point lists, used to author the aperture/rim paths in
// screen px so GSAP only has to scale them around their own centre.
const NH_USER = {
  N: [
    [22, 96],
    [22, 24],
    [74, 92],
    [74, 24],
  ] as const,
  H: [
    [
      [84, 96],
      [84, 24],
    ],
    [
      [84, 60],
      [112, 60],
    ],
    [
      [112, 24],
      [112, 96],
    ],
  ] as const,
};

type Centered = {
  x: number;
  y: number;
  scale: number;
  size: number;
  cx: number;
  cy: number;
};

export default function Preloader() {
  // `show` controls whether the overlay stays mounted. Starts `true` so the
  // first render (server + client) is identical; the skip/play decision is made
  // in the layout effect, never during render.
  const [show, setShow] = useState(true);

  const arrivalRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const maskRef = useRef<SVGMaskElement>(null);
  const maskBgRef = useRef<SVGRectElement>(null);
  const overlayRectRef = useRef<SVGRectElement>(null);
  const apertureGRef = useRef<SVGGElement>(null);
  const maskNRef = useRef<SVGPathElement>(null);
  const maskHRef = useRef<SVGPathElement>(null);
  const rimGRef = useRef<SVGGElement>(null);
  const rimNRef = useRef<SVGPathElement>(null);
  const rimHRef = useRef<SVGPathElement>(null);
  const monoRef = useRef<HTMLDivElement>(null);
  const monoSvgRef = useRef<SVGSVGElement>(null);
  const strokeNRef = useRef<SVGPathElement>(null);
  const strokeHRef = useRef<SVGPathElement>(null);
  const fillNRef = useRef<SVGPathElement>(null);
  const fillHRef = useRef<SVGPathElement>(null);
  const sparkRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    // Test affordance: ?replay clears the seen flag so the intro plays again.
    if (window.location.search.includes('replay')) {
      try {
        window.sessionStorage.removeItem(INTRO_KEY);
      } catch {
        /* ignore */
      }
    }

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const play = shouldPlayIntro(window.sessionStorage, reduce);

    // Restores the final, visible resting frame and tears down the overlay.
    // Safe to call from the skip path, on completion, or from error handling.
    const finish = () => {
      const heroLines =
        document.querySelectorAll<HTMLElement>('[data-hero-line]');
      const navSlot = document.querySelector<HTMLElement>('#nav-logo-slot');
      const period = document.querySelector<HTMLElement>('#name-period');
      if (heroLines.length) gsap.set(heroLines, { clearProps: 'transform' });
      if (navSlot) gsap.set(navSlot, { clearProps: 'opacity,transform' });
      if (period) gsap.set(period, { clearProps: 'opacity,transform' });
      setShow(false);
    };

    // SKIP PATH — hide instantly. Hero/nav/period defaults are already final.
    if (!play) {
      setShow(false);
      return;
    }

    // PLAY PATH --------------------------------------------------------------
    let tl: gsap.core.Timeline | null = null;
    let resizeHandler: (() => void) | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        try {
          const arrival = arrivalRef.current;
          const svg = svgRef.current;
          const mask = maskRef.current;
          const maskBg = maskBgRef.current;
          const overlayRect = overlayRectRef.current;
          const apertureG = apertureGRef.current;
          const maskN = maskNRef.current;
          const maskH = maskHRef.current;
          const rimG = rimGRef.current;
          const rimN = rimNRef.current;
          const rimH = rimHRef.current;
          const mono = monoRef.current;
          const monoSvg = monoSvgRef.current;
          const strokeN = strokeNRef.current;
          const strokeH = strokeHRef.current;
          const fillN = fillNRef.current;
          const fillH = fillHRef.current;
          const spark = sparkRef.current;

          const heroLines =
            document.querySelectorAll<HTMLElement>('[data-hero-line]');
          const navSlot =
            document.querySelector<HTMLElement>('#nav-logo-slot');
          const navLogo = navSlot?.querySelector<SVGElement>('svg') ?? null;
          const period =
            document.querySelector<HTMLElement>('#name-period');

          // If anything load-bearing is missing, bail to the resting frame.
          if (
            !arrival ||
            !svg ||
            !mask ||
            !maskBg ||
            !overlayRect ||
            !apertureG ||
            !maskN ||
            !maskH ||
            !rimG ||
            !rimN ||
            !rimH ||
            !mono ||
            !monoSvg ||
            !strokeN ||
            !strokeH ||
            !fillN ||
            !fillH ||
            !spark ||
            heroLines.length === 0
          ) {
            finish();
            return;
          }

          // ---- geometry helpers --------------------------------------------
          // Convert an SVG userspace point (mono 0..120 viewBox) to viewport px
          // using the mono svg's live rect, so the spark rides the real tip.
          const svgPointToPage = (x: number, y: number) => {
            const r = monoSvg.getBoundingClientRect();
            return {
              x: r.left + (x / 120) * r.width,
              y: r.top + (y / 120) * r.height,
            };
          };

          const lenN = strokeN.getTotalLength();
          const lenH = strokeH.getTotalLength();
          const lenTotal = lenN + lenH;

          const tipAt = (p: number) => {
            const d = p * lenTotal;
            const pt =
              d <= lenN
                ? strokeN.getPointAtLength(d)
                : strokeH.getPointAtLength(Math.min(d - lenN, lenH));
            return svgPointToPage(pt.x, pt.y);
          };

          // Centered display geometry, shared by the drawn mono AND the aperture.
          const computeCentered = (): Centered => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            let displaySize = Math.min(vw, vh) * 0.34;
            displaySize = Math.max(150, Math.min(displaySize, 320));
            const scale = displaySize / 120;
            const x = vw / 2 - displaySize / 2;
            const y = vh * 0.44 - displaySize / 2;
            return { x, y, scale, size: displaySize, cx: vw / 2, cy: vh * 0.44 };
          };

          let centered: Centered = computeCentered();

          const sizeArrivalSvg = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
            mask.setAttribute('width', String(vw));
            mask.setAttribute('height', String(vh));
            maskBg.setAttribute('width', String(vw));
            maskBg.setAttribute('height', String(vh));
            overlayRect.setAttribute('width', String(vw));
            overlayRect.setAttribute('height', String(vh));
          };

          const placeMonoCentered = () => {
            centered = computeCentered();
            gsap.set(mono, {
              x: centered.x,
              y: centered.y,
              scale: centered.scale,
            });
          };

          const ptToPx = (c: Centered, x: number, y: number) =>
            [c.x + x * c.scale, c.y + y * c.scale] as const;

          const polyToD = (
            c: Centered,
            pts: readonly (readonly [number, number])[],
          ) =>
            pts
              .map((p, i) => {
                const q = ptToPx(c, p[0], p[1]);
                return (
                  (i === 0 ? 'M' : 'L') +
                  q[0].toFixed(2) +
                  ' ' +
                  q[1].toFixed(2)
                );
              })
              .join(' ');

          const segsToD = (
            c: Centered,
            segs: readonly (readonly (readonly [number, number])[])[],
          ) =>
            segs
              .map((s) => {
                const a = ptToPx(c, s[0][0], s[0][1]);
                const b = ptToPx(c, s[1][0], s[1][1]);
                return (
                  'M' +
                  a[0].toFixed(2) +
                  ' ' +
                  a[1].toFixed(2) +
                  ' L' +
                  b[0].toFixed(2) +
                  ' ' +
                  b[1].toFixed(2)
                );
              })
              .join(' ');

          // Author the aperture (mask hole) + rim NH paths in screen px so they
          // sit exactly over the drawn mono. GSAP only scales them around the
          // NH centre (svgOrigin); the holes grow from the mark's own centre.
          const placeAperture = () => {
            const c = centered;
            const dN = polyToD(c, NH_USER.N);
            const dH = segsToD(c, NH_USER.H);
            const swMask = (9 * c.scale).toFixed(2);
            const swRim = (4 * c.scale).toFixed(2);

            maskN.setAttribute('d', dN);
            maskH.setAttribute('d', dH);
            maskN.setAttribute('stroke-width', swMask);
            maskH.setAttribute('stroke-width', swMask);
            rimN.setAttribute('d', dN);
            rimH.setAttribute('d', dH);
            rimN.setAttribute('stroke-width', swRim);
            rimH.setAttribute('stroke-width', swRim);

            const originX = c.x + 60 * c.scale;
            const originY = c.y + 60 * c.scale;
            // Set the scale pivot ONCE here (not per frame) — the open tween then
            // only animates `scale`, reusing this origin.
            [apertureG, rimG].forEach((g) => {
              gsap.set(g, { scale: 1, svgOrigin: `${originX} ${originY}` });
            });
          };

          // ---- prime the resting/start state -------------------------------
          sizeArrivalSvg();

          // Overlay visible & FULLY opaque during Part 1 (no hole yet — mask is
          // detached so the drawn mono reads against solid black; the hole is
          // applied only at the handoff so the hero never peeks early).
          gsap.set(arrival, { display: 'block' });
          gsap.set(svg, { opacity: 1 });
          overlayRect.removeAttribute('mask');

          gsap.set(mono, { opacity: 1 });
          gsap.set([fillN, fillH], { opacity: 0 });
          gsap.set([rimN, rimH], { opacity: 0 });

          // Prime the stroke draw (full -> 0).
          gsap.set(strokeN, {
            strokeDasharray: lenN,
            strokeDashoffset: lenN,
            stroke: ACCENT,
            opacity: 1,
          });
          gsap.set(strokeH, {
            strokeDasharray: lenH,
            strokeDashoffset: lenH,
            stroke: ACCENT,
            opacity: 1,
          });

          // Hero name hidden behind its mask; nav logo hidden. The period is NOT
          // hidden separately — it rides with the name line so the reveal is one
          // clean motion (no "name without its period" gap).
          gsap.set(heroLines, { yPercent: 110 });
          if (navLogo) gsap.set(navLogo, { opacity: 0, scale: 0.7 });
          // Centre the spark on its own coordinate (GSAP owns the transform,
          // so we can't rely on a CSS translate -50% — use xPercent/yPercent).
          gsap.set(spark, { opacity: 0, xPercent: -50, yPercent: -50 });

          placeMonoCentered();
          placeAperture();

          // ---- the sequence ------------------------------------------------
          tl = gsap.timeline({
            defaults: { ease: 'expo.out' },
            onComplete: () => {
              try {
                window.sessionStorage.setItem(INTRO_KEY, '1');
              } catch {
                /* ignore */
              }
              finish();
            },
          });

          // PART 1 — NH draws on (0.0 -> 1.0s) with the spark riding the tip.
          tl.add(() => {
            const t0 = tipAt(0);
            gsap.set(spark, { x: t0.x, y: t0.y, opacity: 1 });
          }, 0);

          const draw = { p: 0 };
          tl.to(
            draw,
            {
              p: 1,
              duration: 0.9,
              ease: 'expo.out',
              onUpdate: () => {
                const p = draw.p;
                const drawn = p * lenTotal;
                strokeN.style.strokeDashoffset = String(
                  Math.max(0, lenN - drawn),
                );
                strokeH.style.strokeDashoffset = String(
                  Math.max(0, lenH - Math.max(0, drawn - lenN)),
                );
                const t = tipAt(p);
                gsap.set(spark, { x: t.x, y: t.y });
              },
            },
            0.05,
          );

          // "ink drying": strokes settle lime -> ink after they finish.
          tl.to(
            strokeN,
            { stroke: INK, duration: 0.35, ease: 'power1.out' },
            0.05 + 0.9 * (lenN / lenTotal) + 0.05,
          );
          tl.to(
            strokeH,
            { stroke: INK, duration: 0.35, ease: 'power1.out' },
            0.05 + 0.9 + 0.04,
          );

          // Park the spark exactly at the path end.
          tl.add(() => {
            const tEnd = tipAt(1);
            gsap.set(spark, { x: tEnd.x, y: tEnd.y });
          }, 0.05 + 0.9);

          // PART 2 — stroke -> fill (the mark becomes solid, ready to be a hole).
          tl.to(
            [fillN, fillH],
            { opacity: 1, duration: 0.22, ease: 'power2.out' },
            1.0,
          );
          tl.to(
            [strokeN, strokeH],
            { opacity: 0, duration: 0.2, ease: 'power2.out' },
            1.06,
          );

          // APERTURE OPENS — apply the mask (NH becomes a transparent hole over
          // the now-hidden solid mono; pixel-aligned, so the swap is invisible),
          // bring in the lime rim, then scale the hole up from its own centre.
          tl.add(() => {
            overlayRect.setAttribute('mask', 'url(#aperture-mask)');
            gsap.set(mono, { opacity: 0 });
            gsap.set([rimN, rimH], { opacity: 1 });
            // Page becomes interactive once the reveal begins.
            gsap.set(arrival, { pointerEvents: 'none' });
          }, 1.2);

          // Open the aperture: scale the NH hole up only a MODEST amount (cheap
          // raster; svgOrigin was set once in placeAperture), then let a GPU-cheap
          // opacity dissolve finish the reveal. Scaling a masked + filtered group
          // all the way to fill the screen is what made v1 janky — this keeps the
          // per-frame raster small and hands the rest to a composited fade.
          const grow = { k: 1 };
          tl.to(
            grow,
            {
              k: 5.5,
              duration: 0.55,
              ease: 'power3.out',
              onUpdate: () => {
                gsap.set([apertureG, rimG], { scale: grow.k });
              },
            },
            1.2,
          );

          // The dark overlay dissolves to complete the reveal — overlaps the scale
          // so it reads as "the mark opens and melts into the page".
          tl.to(
            [rimN, rimH],
            { opacity: 0, duration: 0.3, ease: 'power1.out' },
            1.5,
          );
          tl.to(
            svg,
            { opacity: 0, duration: 0.5, ease: 'power2.inOut' },
            1.5,
          );
          tl.add(() => {
            gsap.set(arrival, { display: 'none' });
          }, 2.05);

          // HERO UNVEILED — name reveal timed to the opening aperture.
          tl.to(
            heroLines,
            { yPercent: 0, duration: 0.7, ease: 'expo.out' },
            1.6,
          );

          // Flourish: the parked spark glides into the name's period and lands
          // with a small lime pulse. The period is already visible (it rode in
          // with the name), so this never leaves a "missing period" gap. Fully
          // guarded — if the period can't be measured, the spark just fades out.
          if (period) {
            tl.add(() => {
              const rp = period.getBoundingClientRect();
              if (!rp.width && !rp.height) {
                gsap.to(spark, { opacity: 0, duration: 0.2 });
                return;
              }
              const px = rp.left + rp.width * 0.5;
              const py = rp.top + rp.height * 0.55;
              gsap.set(spark, { opacity: 1 });
              gsap.to(spark, {
                x: px,
                y: py,
                duration: 0.32,
                ease: 'power2.inOut',
                onComplete: () => {
                  gsap.to(spark, { opacity: 0, duration: 0.18 });
                  gsap.fromTo(
                    period,
                    { scale: 1 },
                    {
                      scale: 1.3,
                      duration: 0.15,
                      yoyo: true,
                      repeat: 1,
                      transformOrigin: 'center 80%',
                      ease: 'power2.out',
                    },
                  );
                },
              });
            }, 2.0);
          }

          // The small NH settles into the nav logo slot as the persistent logo.
          if (navLogo) {
            tl.to(
              navLogo,
              {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: 'back.out(1.8)',
              },
              2.05,
            );
          }

          // Resize-safe: re-author the px geometry if the viewport changes
          // while the overlay is still showing (the intro is short).
          resizeHandler = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
              if (arrival.style.display !== 'none') {
                sizeArrivalSvg();
                placeMonoCentered();
                placeAperture();
              }
            }, 120);
          };
          window.addEventListener('resize', resizeHandler);
        } catch {
          // Any failure: restore the final visible state, never get stuck.
          finish();
        }
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (resizeHandler) window.removeEventListener('resize', resizeHandler);
      clearTimeout(resizeTimer);
      tl?.kill();
    };
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show) return null;

  return (
    <div
      ref={arrivalRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    >
      {/* Full-screen masked overlay. viewBox is set to px in the effect so the
          mask geometry is in real screen pixels (accurate at any size). */}
      <svg
        ref={svgRef}
        className="absolute inset-0 block h-full w-full will-change-[opacity]"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask
            id="aperture-mask"
            ref={maskRef}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="100"
            height="100"
          >
            {/* WHITE = overlay is OPAQUE (covers hero). */}
            <rect
              ref={maskBgRef}
              x="0"
              y="0"
              width="100"
              height="100"
              fill="#fff"
            />
            {/* BLACK NH = transparent HOLE; lives in the scaled group so the
                hole grows from the NH centre. The d is rewritten to screen px
                in the effect. */}
            <g ref={apertureGRef}>
              <path
                ref={maskNRef}
                d={NH.N}
                fill="none"
                stroke="#000"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                ref={maskHRef}
                d={NH.H}
                fill="none"
                stroke="#000"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </mask>
        </defs>

        {/* The opaque overlay, with the NH punched out by the mask. */}
        <rect
          ref={overlayRectRef}
          x="0"
          y="0"
          width="100"
          height="100"
          fill={BG}
          mask="url(#aperture-mask)"
        />

        {/* VISIBLE lime rim/glow NH, scaled in lockstep with the aperture. */}
        <g ref={rimGRef}>
          {/* Lime rim on the opening edge. No drop-shadow filter — recomputing a
              filter on a scaling path every frame is a major jank source; a plain
              lime stroke scales cleanly. */}
          <path
            ref={rimNRef}
            d={NH.N}
            fill="none"
            stroke={ACCENT}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0}
          />
          <path
            ref={rimHRef}
            d={NH.H}
            fill="none"
            stroke={ACCENT}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0}
          />
        </g>
      </svg>

      {/* The drawing monogram (Part 1). Strokes draw on; a solid version
          cross-fades in so the mark can become the window. Positioned/scaled
          in the effect. */}
      <div
        ref={monoRef}
        className="fixed left-0 top-0 z-[62] h-[120px] w-[120px] origin-top-left will-change-transform"
      >
        <svg
          ref={monoSvgRef}
          viewBox="0 0 120 120"
          className="block h-[120px] w-[120px] overflow-visible"
          fill="none"
        >
          {/* Solid NH (handoff target): same geometry & thickness (9) as the
              aperture-mask NH, so the solid mark == the future transparent hole. */}
          <path
            ref={fillNRef}
            d={NH.N}
            fill="none"
            stroke={INK}
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0}
          />
          <path
            ref={fillHRef}
            d={NH.H}
            fill="none"
            stroke={INK}
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0}
          />
          {/* Stroked NH (the draw): N then H. */}
          <path
            ref={strokeNRef}
            d={NH.N}
            fill="none"
            stroke={ACCENT}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            ref={strokeHRef}
            d={NH.H}
            fill="none"
            stroke={ACCENT}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* The glowing spark dot that rides the drawing tip. */}
      <div
        ref={sparkRef}
        className="fixed left-0 top-0 z-[64] h-[9px] w-[9px] rounded-full opacity-0 will-change-transform"
        style={{
          background: ACCENT,
          boxShadow:
            '0 0 6px 2px rgba(198,255,61,.55), 0 0 14px 5px rgba(198,255,61,.35), 0 0 30px 10px rgba(198,255,61,.18)',
        }}
      />
    </div>
  );
}
