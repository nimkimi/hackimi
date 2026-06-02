import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Reveal from '@/components/motion/Reveal';

/**
 * Characterization tests for Reveal. The component uses a direct
 * IntersectionObserver + CSS `translateY` transition, a ~2.5s safety
 * fallback timer, and respects `prefers-reduced-motion`.
 *
 * We override the global IntersectionObserver with a controllable mock that
 * captures the callback so we can fire it manually, and we control matchMedia
 * to drive the reduced-motion branch. Both are restored in afterEach.
 */

type IOCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
) => void;

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

/** Build a matchMedia stub whose `matches` is true only for the given query. */
function setMatchMedia(reduceMatches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches:
        query === '(prefers-reduced-motion: reduce)' ? reduceMatches : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

/** Fire the captured IntersectionObserver callback with a single entry. */
function fireIntersection(isIntersecting: boolean) {
  if (!capturedCallback) throw new Error('IntersectionObserver not constructed');
  act(() => {
    capturedCallback!(
      [{ isIntersecting } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });
}

beforeEach(() => {
  capturedCallback = null;
  disconnectSpy = vi.fn<(...args: unknown[]) => void>();
  observeSpy = vi.fn<(...args: unknown[]) => void>();
  vi.stubGlobal('IntersectionObserver', ControllableIO);
  setMatchMedia(false); // default: normal motion
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
      </Reveal>,
    );
    expect(screen.getByText('hello reveal')).toBeInTheDocument();
  });

  it('shows content immediately under prefers-reduced-motion (no hold state, no IO)', () => {
    setMatchMedia(true);

    const { container } = render(
      <Reveal className="my-class">
        <span>reduced</span>
      </Reveal>,
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
      </Reveal>,
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
      </Reveal>,
    );

    const inner = (container.firstElementChild as HTMLElement)
      .firstElementChild as HTMLElement;
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
      </Reveal>,
    );

    fireIntersection(false);

    const inner = (container.firstElementChild as HTMLElement)
      .firstElementChild as HTMLElement;
    expect(inner.style.transform).toBe('translateY(110%)');
  });

  it('reveals via the safety fallback timer if the observer never fires', () => {
    vi.useFakeTimers();

    const { container } = render(
      <Reveal>
        <span>slide me</span>
      </Reveal>,
    );

    const inner = (container.firstElementChild as HTMLElement)
      .firstElementChild as HTMLElement;
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
      </Reveal>,
    );

    const inner = (container.firstElementChild as HTMLElement)
      .firstElementChild as HTMLElement;
    expect(inner.style.transition).toContain('0.3s');
  });
});
