import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, render } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

/**
 * Characterization tests for the signature arrival animation Preloader.
 *
 * The component (`src/components/intro/Preloader.tsx`):
 * - Renders a full-screen masked overlay (SSR-safe, identical server/client).
 *   The skip/play decision is made in a `useLayoutEffect`, never during render.
 * - Reads `window.matchMedia('(prefers-reduced-motion: reduce)')` and feeds it
 *   to `shouldPlayIntro(reduce)` (which is simply `!reduce`).
 * - SKIP path (reduced motion): the overlay is kept off the screen by CSS
 *   (`[data-arrival-overlay]` is `display: none` under reduced motion in
 *   globals.css — the only thing that resolves before first paint). The layout
 *   effect then unmounts the node on a microtask, so it never calls setState
 *   synchronously. No GSAP timeline is built. Hero / nav / period are left in
 *   their default visible state (never touched).
 * - PLAY path (motion allowed): schedules two nested `requestAnimationFrame`s;
 *   the inner one builds a `gsap.timeline(...)`. Every DOM lookup is guarded
 *   and the whole build is wrapped in try/catch; on any error (or missing
 *   load-bearing nodes) it calls `finish()`, which `gsap.set(..., {clearProps})`
 *   the hero/nav/period and `setShow(false)` to tear the overlay down.
 * - Cleanup on unmount cancels the rAFs, removes the resize listener,
 *   `tl?.kill()`, and — if the timeline never completed — clears the inline
 *   transforms on hero/nav/period and hides the overlay.
 *
 * GSAP import shape (source line 4): `import gsap from 'gsap';` — a DEFAULT
 * import used as `gsap.timeline()`, `gsap.set()`, `gsap.to()`. The mock below
 * therefore exposes a `default` export carrying those methods, plus a matching
 * named `gsap` export for safety.
 *
 * jsdom does not implement SVG measurement (`getTotalLength`,
 * `getPointAtLength`) or real layout (`getBoundingClientRect` returns zeros),
 * so even with all nodes present the full timeline build is expected to throw
 * and fall into the catch → `finish()`. We assert the BEHAVIOR CONTRACTS that
 * are observable under this constraint and clearly note the limits.
 */

// ---- gsap mock -----------------------------------------------------------
// The factory is hoisted to the top of the module, so it must NOT close over
// outer variables. Build the chainable timeline + api INSIDE the factory and
// retrieve typed references afterwards via the (mocked) gsap import.
vi.mock('gsap', () => {
  const timeline = {
    to: vi.fn(() => timeline),
    set: vi.fn(() => timeline),
    from: vi.fn(() => timeline),
    fromTo: vi.fn(() => timeline),
    add: vi.fn(() => timeline),
    play: vi.fn(() => timeline),
    eventCallback: vi.fn(() => timeline),
    kill: vi.fn(),
  };
  const api = {
    timeline: vi.fn(() => timeline),
    set: vi.fn(),
    to: vi.fn(),
    fromTo: vi.fn(),
    registerPlugin: vi.fn(),
    // Expose the timeline instance so tests can assert on it.
    __timeline: timeline,
  };
  return { default: api, gsap: api };
});

// Import AFTER vi.mock so the mock is in place.
import gsapDefault from 'gsap';
import Preloader from '@/components/intro/Preloader';

// Typed handles onto the mock surface for assertions.
const gsapApi = gsapDefault as unknown as {
  timeline: Mock;
  set: Mock;
  to: Mock;
  fromTo: Mock;
  registerPlugin: Mock;
  __timeline: {
    to: Mock;
    set: Mock;
    add: Mock;
    kill: Mock;
  };
};
const tl = gsapApi.__timeline;

// ---- matchMedia helper ---------------------------------------------------
// The stub stores the `change` listeners registered against the reduced-motion
// query so a test can flip the preference LIVE, the way the OS setting does
// mid-session. The global stub in tests/setup/jsdom-setup.ts records calls but
// stores nothing, so it cannot notify anybody.
const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';

type ReduceListener = (event: MediaQueryListEvent) => void;

let reduceListeners: ReduceListener[] = [];
let reduceQueries: { matches: boolean }[] = [];

function setReduceMotion(matches: boolean) {
  reduceListeners = [];
  reduceQueries = [];
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => {
      const isReduceQuery = query === REDUCE_QUERY;
      const mql = {
        matches: isReduceQuery ? matches : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((type: string, listener: ReduceListener) => {
          if (isReduceQuery && type === 'change') reduceListeners.push(listener);
        }),
        removeEventListener: vi.fn((type: string, listener: ReduceListener) => {
          if (isReduceQuery && type === 'change') {
            reduceListeners = reduceListeners.filter((registered) => registered !== listener);
          }
        }),
        dispatchEvent: vi.fn(),
      };
      if (isReduceQuery) reduceQueries.push(mql);
      return mql;
    }),
  });
}

/**
 * Flip the live reduced-motion preference and notify every registered `change`
 * listener, exactly as a real MediaQueryList does when the OS setting changes
 * while the page is open.
 */
function flipReduceMotion(matches: boolean) {
  reduceQueries.forEach((mql) => {
    mql.matches = matches;
  });
  const event = { matches, media: REDUCE_QUERY } as unknown as MediaQueryListEvent;
  act(() => {
    reduceListeners.slice().forEach((listener) => listener(event));
  });
}

/**
 * jsdom implements neither SVG path measurement (`getTotalLength`,
 * `getPointAtLength`) nor real layout (`getBoundingClientRect` returns zeros),
 * so the play path's geometry helpers must be stubbed for the build to reach
 * `gsap.timeline()` instead of throwing into the catch → `finish()`. Returns a
 * restore function.
 */
function stubSvgMeasurement() {
  const proto = SVGElement.prototype as unknown as Record<string, unknown>;
  const pathProto = (globalThis.SVGPathElement?.prototype ?? SVGElement.prototype) as unknown as Record<
    string,
    unknown
  >;
  const orig = {
    getTotalLength: pathProto.getTotalLength,
    getPointAtLength: pathProto.getPointAtLength,
    gbcr: proto.getBoundingClientRect,
  };
  pathProto.getTotalLength = () => 100;
  pathProto.getPointAtLength = () => ({ x: 10, y: 10 });
  proto.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    width: 120,
    height: 120,
    right: 120,
    bottom: 120,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  return () => {
    pathProto.getTotalLength = orig.getTotalLength;
    pathProto.getPointAtLength = orig.getPointAtLength;
    proto.getBoundingClientRect = orig.gbcr;
  };
}

// ---- requestAnimationFrame control --------------------------------------
// The play path uses two nested rAFs before building the timeline. Capture the
// queued callbacks so we can flush them deterministically (jsdom's rAF is not
// driven by fake timers reliably across versions).
let rafQueue: FrameRequestCallback[] = [];
let rafId = 0;

function flushRaf(times = 1) {
  for (let n = 0; n < times; n++) {
    const cbs = rafQueue;
    rafQueue = [];
    act(() => {
      cbs.forEach((cb) => cb(performance.now()));
    });
  }
}

/**
 * Mount stub DOM nodes the Preloader queries by selector so its lookups find
 * targets: hero lines ([data-hero-line]), the nav logo slot (#nav-logo-slot,
 * with an inner <svg>), and the name period (#name-period). Returns the root
 * to remove afterwards.
 */
function mountTargetDom() {
  const root = document.createElement('div');
  root.innerHTML = `
    <h1>
      <span data-hero-line>Nima</span>
      <span data-hero-line>Hakimi<span id="name-period">.</span></span>
    </h1>
    <div id="nav-logo-slot"><svg></svg></div>
  `;
  document.body.appendChild(root);
  return root;
}

beforeEach(() => {
  rafQueue = [];
  rafId = 0;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
    rafQueue.push(cb);
    return ++rafId;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  setReduceMotion(false);
  // Reset call history on the shared gsap mocks between tests.
  gsapApi.timeline.mockClear();
  gsapApi.set.mockClear();
  gsapApi.to.mockClear();
  tl.to.mockClear();
  tl.set.mockClear();
  tl.add.mockClear();
  tl.kill.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Preloader — first render (SSR-safe overlay)', () => {
  it('renders the full-screen overlay on first paint regardless of motion pref', () => {
    const { container } = render(<Preloader />);
    // The overlay root is an aria-hidden fixed inset-0 div.
    const overlay = container.querySelector('[aria-hidden]');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('fixed', 'inset-0');
    // It contains the mask SVG with the aperture mask + monogram paths.
    expect(container.querySelector('#aperture-mask')).toBeInTheDocument();
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(2);
  });
});

/**
 * The a11y contract: under `prefers-reduced-motion: reduce` the overlay must
 * never be PAINTED — not "removed quickly after hydration". JavaScript cannot
 * satisfy that on its own, because the overlay is server-rendered and the first
 * paint can happen before React hydrates. A stylesheet rule is what actually
 * resolves before first paint, so the contract has two halves and both are
 * asserted here: the markup must carry a stable hook attribute from its very
 * first render, and the stylesheet must hide that hook under reduced motion.
 */
describe('Preloader — reduced-motion never paints (pre-hydration contract)', () => {
  it('carries the data-arrival-overlay hook on the server render, before any effect runs', () => {
    // Server rendering runs no effects at all, so this is the markup a
    // reduced-motion user's browser paints before hydration.
    const html = renderToStaticMarkup(<Preloader />);

    expect(html).toContain('data-arrival-overlay');
    // Sanity: this really is the overlay markup, not an empty render.
    expect(html).toContain('aperture-mask');
  });

  it('hides [data-arrival-overlay] from the stylesheet under prefers-reduced-motion', () => {
    const css = readFileSync(join(__dirname, '..', '..', 'src/app/globals.css'), 'utf8');

    // Whitespace-insensitive: only the rule's existence is the contract, not
    // its formatting (Prettier owns that).
    const rule =
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^]*?\[data-arrival-overlay\][^}]*\{[^}]*display:\s*none/;
    expect(css).toMatch(rule);
  });
});

describe('Preloader — reduced-motion (skip path)', () => {
  it('does NOT build a gsap timeline and tears the overlay down (returns null)', async () => {
    setReduceMotion(true);
    const root = mountTargetDom();
    const heroLines = root.querySelectorAll('[data-hero-line]');

    const { container } = render(<Preloader />);

    // The layout effect runs synchronously on mount: skip path → no animation.
    // No gsap timeline is ever created.
    expect(gsapApi.timeline).not.toHaveBeenCalled();

    // The unmount is scheduled out of the layout-effect body (a microtask, which
    // still flushes before the browser paints); flush it before asserting.
    await act(async () => {});

    // Overlay unmounted: `if (!show) return null`.
    expect(container.querySelector('[aria-hidden]')).toBeNull();
    expect(container.querySelector('#aperture-mask')).toBeNull();

    // The hero lines are left present and untouched (their defaults are final).
    expect(heroLines.length).toBe(2);
    heroLines.forEach((line) => expect(line).toBeInTheDocument());

    // Skip path also schedules no animation frames.
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('does not setState during the layout effect — first render still matches SSR', async () => {
    setReduceMotion(true);
    mountTargetDom();

    const { container } = render(<Preloader />);

    // Immediately after mount (layout effects have run) the overlay is STILL
    // in the DOM: the skip decision did not cascade a synchronous re-render.
    // This is also what keeps the first client render identical to the server's.
    expect(container.querySelector('[aria-hidden]')).toBeInTheDocument();
    expect(container.querySelector('[data-arrival-overlay]')).toBeInTheDocument();

    // It goes away on the very next microtask — before any paint.
    await act(async () => {});

    expect(container.querySelector('[data-arrival-overlay]')).toBeNull();
  });

  it('does not gate hero/nav existence — content remains in the DOM', async () => {
    setReduceMotion(true);
    const root = mountTargetDom();
    render(<Preloader />);
    await act(async () => {});

    expect(root.querySelector('#nav-logo-slot')).toBeInTheDocument();
    expect(root.querySelector('#name-period')).toBeInTheDocument();
    expect(root.querySelectorAll('[data-hero-line]').length).toBe(2);
  });
});

describe('Preloader — motion allowed (play path)', () => {
  it('keeps the overlay mounted and schedules animation frames on mount', () => {
    mountTargetDom();
    const { container } = render(<Preloader />);

    // Play path: overlay stays mounted (not yet set to hidden in render).
    expect(container.querySelector('[aria-hidden]')).toBeInTheDocument();
    // Two nested rAFs are scheduled (the outer one immediately on effect run).
    expect(window.requestAnimationFrame).toHaveBeenCalled();
    // No timeline yet — it's built inside the inner rAF.
    expect(gsapApi.timeline).not.toHaveBeenCalled();
  });

  it('builds a gsap timeline once the nested rAFs flush (all target nodes present)', () => {
    // jsdom implements neither SVG path measurement nor real layout, so the
    // play path's geometry helpers (getTotalLength / getPointAtLength /
    // getBoundingClientRect) must be stubbed for the build to reach
    // gsap.timeline() instead of throwing into the catch → finish().
    const proto = SVGElement.prototype as unknown as Record<string, unknown>;
    const pathProto = (globalThis.SVGPathElement?.prototype ?? SVGElement.prototype) as unknown as Record<
      string,
      unknown
    >;
    const orig = {
      getTotalLength: pathProto.getTotalLength,
      getPointAtLength: pathProto.getPointAtLength,
      gbcr: proto.getBoundingClientRect,
    };
    pathProto.getTotalLength = () => 100;
    pathProto.getPointAtLength = () => ({ x: 10, y: 10 });
    proto.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 120,
      height: 120,
      right: 120,
      bottom: 120,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    mountTargetDom();
    render(<Preloader />);

    // Flush outer rAF (queues inner) then inner rAF (builds timeline).
    flushRaf(); // outer
    flushRaf(); // inner

    // Restore the prototype regardless of assertion outcome.
    pathProto.getTotalLength = orig.getTotalLength;
    pathProto.getPointAtLength = orig.getPointAtLength;
    proto.getBoundingClientRect = orig.gbcr;

    // The signature contract: a gsap timeline is created to drive the arrival.
    expect(gsapApi.timeline).toHaveBeenCalledTimes(1);
    // The timeline is configured with an onComplete handler (the `finish`
    // resting-frame restore) — part of the fail-safe contract.
    const cfg = gsapApi.timeline.mock.calls[0]?.[0] as { onComplete?: unknown } | undefined;
    expect(typeof cfg?.onComplete).toBe('function');
    // Priming uses gsap.set to stage the start/resting state.
    expect(gsapApi.set).toHaveBeenCalled();
  });

  it('falls back to finish() when load-bearing nodes are missing (no hero lines)', () => {
    // No target DOM mounted → heroLines.length === 0 → guard bails to finish().
    const { container } = render(<Preloader />);
    flushRaf(); // outer
    flushRaf(); // inner

    // finish() restores the resting frame and tears the overlay down.
    expect(container.querySelector('[aria-hidden]')).toBeNull();
    // No timeline was built because the guard returned before timeline().
    expect(gsapApi.timeline).not.toHaveBeenCalled();
  });
});

/**
 * The stylesheet keeps the overlay off the screen for anyone who ALREADY has
 * reduced motion on. It cannot serve the user who switches it on halfway
 * through the intro: by then the timeline has the hero parked at
 * `yPercent: 110` and gsap has written an inline `display: block` onto the
 * overlay that outranks the reduced-motion rule. Left alone, that user gets
 * either a blank hero or a still-running animation until the timeline ends —
 * up to ~2s. The intro must instead jump to its settled resting frame at once.
 */
describe('Preloader — reduced motion switched on mid-intro', () => {
  it('settles the hero at once instead of leaving it parked until the timeline ends', () => {
    const restoreSvgMeasurement = stubSvgMeasurement();
    mountTargetDom();
    const { container } = render(<Preloader />);

    flushRaf(); // outer
    flushRaf(); // inner — timeline built, hero parked off-screen
    restoreSvgMeasurement();

    // Precondition: the hero really is parked, so "blank hero" is the state we
    // are rescuing the user from.
    expect(gsapApi.set).toHaveBeenCalledWith(expect.anything(), { yPercent: 110 });
    gsapApi.set.mockClear();

    flipReduceMotion(true);

    // The hero's parked transform is cleared right away — the resting frame,
    // not two seconds of nothing.
    const clearedHeroTransform = gsapApi.set.mock.calls.some(([targets, vars]) => {
      const nodes = Array.from((targets ?? []) as ArrayLike<Element>);
      return (
        (vars as { clearProps?: string } | undefined)?.clearProps === 'transform' &&
        nodes.length > 0 &&
        nodes.every((node) => node.hasAttribute?.('data-hero-line'))
      );
    });
    expect(clearedHeroTransform).toBe(true);

    // The motion is stopped, not merely fast-forwarded.
    expect(tl.kill).toHaveBeenCalled();

    // And the overlay is gone, so nothing is left covering the settled page.
    expect(container.querySelector('[data-arrival-overlay]')).toBeNull();
  });

  it('never starts the timeline when the flip lands before the first frame', () => {
    const restoreSvgMeasurement = stubSvgMeasurement();
    mountTargetDom();
    const { container } = render(<Preloader />);

    // Flip while the two nested rAFs are still queued.
    flipReduceMotion(true);

    // Frames that were already scheduled must not resurrect the intro — a
    // timeline built now would re-park the hero after the page had settled.
    flushRaf(); // outer
    flushRaf(); // inner
    restoreSvgMeasurement();

    expect(gsapApi.timeline).not.toHaveBeenCalled();
    expect(container.querySelector('[data-arrival-overlay]')).toBeNull();
  });

  it('stops listening once the component is unmounted', () => {
    const restoreSvgMeasurement = stubSvgMeasurement();
    mountTargetDom();
    const { unmount } = render(<Preloader />);

    flushRaf(); // outer
    flushRaf(); // inner
    restoreSvgMeasurement();

    unmount();
    gsapApi.set.mockClear();

    // No listener survives the unmount to touch the DOM or setState afterwards.
    expect(() => flipReduceMotion(true)).not.toThrow();
    expect(gsapApi.set).not.toHaveBeenCalled();
  });
});

describe('Preloader — cleanup / fail-safe on unmount', () => {
  it('kills the timeline and restores content on unmount mid-play', () => {
    const root = mountTargetDom();
    const { container, unmount } = render(<Preloader />);

    flushRaf(); // outer
    flushRaf(); // inner — timeline built (or finished via catch)

    const timelineWasBuilt = gsapApi.timeline.mock.calls.length > 0;

    unmount();

    // Cleanup cancels frames and removes the resize listener; if a timeline was
    // created it must be killed.
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
    if (timelineWasBuilt) {
      expect(tl.kill).toHaveBeenCalled();
    }

    // Fail-safe: hero/nav/period are restored (clearProps via gsap.set) and the
    // overlay is hidden — content is never left stuck/hidden.
    expect(gsapApi.set).toHaveBeenCalled();
    // The target DOM nodes still exist (the component never removes them).
    expect(root.querySelectorAll('[data-hero-line]').length).toBe(2);
    expect(container).toBeTruthy();
  });

  it('unmounting from the skip path is a clean no-op for animation teardown', () => {
    setReduceMotion(true);
    mountTargetDom();
    const { unmount } = render(<Preloader />);

    // Skip path already set show=false and built no timeline.
    expect(() => unmount()).not.toThrow();
    expect(tl.kill).not.toHaveBeenCalled();
  });
});
