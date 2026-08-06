import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setMediaQuery } from '../setup/match-media';
import Reveal from '@/components/motion/Reveal';

/**
 * Characterization tests for Reveal. The component uses a direct
 * IntersectionObserver + CSS `translateY` transition, a ~2.5s safety
 * fallback timer, and respects `prefers-reduced-motion`.
 *
 * We override the global IntersectionObserver with a controllable mock that
 * captures the callback so we can fire it manually, and we drive the
 * reduced-motion branch through the shared matchMedia fake. IntersectionObserver
 * is restored in afterEach; the media-query registry is reset globally.
 *
 * `prefers-reduced-motion` is a live subscription (useMediaQuery), not a
 * mount-time read, so `setReducedMotion` works mid-test as well as before mount.
 */

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

type IOCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void;

let capturedCallback: IOCallback | null = null;
let disconnectSpy: ReturnType<typeof vi.fn<(...args: unknown[]) => void>>;
let observeSpy: ReturnType<typeof vi.fn<(...args: unknown[]) => void>>;

class ControllableIO {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  constructor(cb: IOCallback) {
    capturedCallback = cb;
  }
  observe = (...args: unknown[]) => observeSpy(...args);
  unobserve(): void {}
  disconnect = (...args: unknown[]) => disconnectSpy(...args);
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

/** Point the shared matchMedia fake at a prefers-reduced-motion answer. */
function setReducedMotion(reduceMatches: boolean) {
  setMediaQuery(REDUCED_MOTION, reduceMatches);
}

/** Fire the captured IntersectionObserver callback with a single entry. */
function fireIntersection(isIntersecting: boolean) {
  if (!capturedCallback) throw new Error('IntersectionObserver not constructed');
  act(() => {
    capturedCallback!([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver);
  });
}

beforeEach(() => {
  capturedCallback = null;
  disconnectSpy = vi.fn<(...args: unknown[]) => void>();
  observeSpy = vi.fn<(...args: unknown[]) => void>();
  vi.stubGlobal('IntersectionObserver', ControllableIO);
  setReducedMotion(false); // default: normal motion
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Reveal', () => {
  it('renders its children', () => {
    render(
      <Reveal>
        <span>hello reveal</span>
      </Reveal>
    );
    expect(screen.getByText('hello reveal')).toBeInTheDocument();
  });

  it('shows content immediately under prefers-reduced-motion (no hold state, no IO)', () => {
    setReducedMotion(true);

    const { container } = render(
      <Reveal className="my-class">
        <span>reduced</span>
      </Reveal>
    );

    expect(screen.getByText('reduced')).toBeInTheDocument();

    // Reduced-motion branch renders a single plain div with the passed
    // className and no overflow-hidden wrapper / transform inner.
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.className).toBe('my-class');
    expect(outer.className).not.toContain('overflow-hidden');

    // No element carries the pre-reveal transform.
    expect(container.querySelector('[style*="translateY"]')).toBeNull();

    // No IntersectionObserver hold was ever set up.
    expect(capturedCallback).toBeNull();
    expect(observeSpy).not.toHaveBeenCalled();
  });

  it('starts in the pre-reveal (hidden/translated) state under normal motion', () => {
    const { container } = render(
      <Reveal>
        <span>slide me</span>
      </Reveal>
    );

    // Outer wrapper clips overflow; inner holds the transform.
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.className).toContain('overflow-hidden');

    const inner = outer.firstElementChild as HTMLElement;
    expect(inner.style.transform).toBe('translateY(110%)');

    // The observer was wired up.
    expect(observeSpy).toHaveBeenCalledTimes(1);
  });

  it('reveals when the IntersectionObserver fires with isIntersecting:true', () => {
    const { container } = render(
      <Reveal>
        <span>slide me</span>
      </Reveal>
    );

    const inner = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    expect(inner.style.transform).toBe('translateY(110%)');

    fireIntersection(true);

    expect(inner.style.transform).toBe('translateY(0)');
    // On reveal the observer disconnects.
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('does NOT reveal when the observer fires with isIntersecting:false', () => {
    const { container } = render(
      <Reveal>
        <span>slide me</span>
      </Reveal>
    );

    fireIntersection(false);

    const inner = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    expect(inner.style.transform).toBe('translateY(110%)');
  });

  it('reveals via the safety fallback timer if the observer never fires', () => {
    vi.useFakeTimers();

    const { container } = render(
      <Reveal>
        <span>slide me</span>
      </Reveal>
    );

    const inner = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    expect(inner.style.transform).toBe('translateY(110%)');

    // Observer never fires; advance past the ~2.5s fallback.
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(inner.style.transform).toBe('translateY(0)');
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('applies the delay to the transition timing', () => {
    const { container } = render(
      <Reveal delay={0.3}>
        <span>delayed</span>
      </Reveal>
    );

    const inner = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    expect(inner.style.transition).toContain('0.3s');
  });
});

describe('Reveal — live prefers-reduced-motion changes', () => {
  it('drops to the static branch when reduced motion is turned on after mount', () => {
    const { container } = render(
      <Reveal className="my-class">
        <span>live switch</span>
      </Reveal>
    );

    // Starts in the animated branch: clipping wrapper + translated inner.
    expect((container.firstElementChild as HTMLElement).className).toContain('overflow-hidden');
    expect(container.querySelector('[style*="translateY"]')).not.toBeNull();

    act(() => {
      setReducedMotion(true);
    });

    // Now the plain, untransformed element — same as mounting with it already on.
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.className).toBe('my-class');
    expect(container.querySelector('[style*="translateY"]')).toBeNull();
    expect(screen.getByText('live switch')).toBeInTheDocument();
  });

  it('returns to the animated branch when reduced motion is turned back off', () => {
    setReducedMotion(true);

    const { container } = render(
      <Reveal className="my-class">
        <span>back again</span>
      </Reveal>
    );
    expect((container.firstElementChild as HTMLElement).className).toBe('my-class');

    act(() => {
      setReducedMotion(false);
    });

    expect((container.firstElementChild as HTMLElement).className).toContain('overflow-hidden');
    // The observer is set up on the way back, so content is never stranded.
    expect(observeSpy).toHaveBeenCalled();
  });

  it('keeps content the user is already looking at visible when reduced motion is turned off', () => {
    setReducedMotion(true);

    const { container } = render(
      <Reveal>
        <span>already painted</span>
      </Reveal>
    );

    act(() => {
      setReducedMotion(false);
    });

    // The animated branch takes over, but the content was on screen a moment
    // ago: it must render revealed rather than snapping back under the mask and
    // replaying the 0.8s slide.
    const inner = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    expect(inner.style.transform).toBe('translateY(0)');
  });

  it('keeps content visible across a reduced-motion on/off round trip that never revealed', () => {
    // Mounted animated and still below the fold, so the observer never fired and
    // `shown` is false. Turning reduced motion on paints it anyway; turning it
    // back off must not take it away again.
    const { container } = render(
      <Reveal>
        <span>round trip</span>
      </Reveal>
    );
    expect(((container.firstElementChild as HTMLElement).firstElementChild as HTMLElement).style.transform).toBe(
      'translateY(110%)'
    );

    act(() => {
      setReducedMotion(true);
    });
    act(() => {
      setReducedMotion(false);
    });

    const inner = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    expect(inner.style.transform).toBe('translateY(0)');
  });

  it('still holds content under the mask on the ordinary path, with no flip involved', () => {
    // Guards the fix from over-reaching: a component that has never seen
    // reduced motion must still start hidden and wait for the observer.
    const { container } = render(
      <Reveal>
        <span>ordinary</span>
      </Reveal>
    );

    const inner = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    expect(inner.style.transform).toBe('translateY(110%)');

    fireIntersection(true);

    expect(inner.style.transform).toBe('translateY(0)');
  });
});

describe('Reveal — IntersectionObserver unavailable', () => {
  it('still reveals the content rather than stranding it translated off-screen', () => {
    vi.useFakeTimers();
    vi.stubGlobal('IntersectionObserver', undefined);

    const { container } = render(
      <Reveal>
        <span>no observer</span>
      </Reveal>
    );

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const inner = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    expect(inner.style.transform).toBe('translateY(0)');
  });
});
