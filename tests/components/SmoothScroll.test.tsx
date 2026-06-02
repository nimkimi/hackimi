import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SmoothScroll from '@/components/motion/SmoothScroll';

/**
 * Characterization tests for SmoothScroll.
 *
 * The source does `import Lenis from 'lenis'` and, on mount (in an effect),
 * instantiates `new Lenis({ lerp: 0.1 })`, drives it with a rAF loop, attaches
 * a document click listener for in-page hash navigation, and on unmount calls
 * cancelAnimationFrame, removes the listener, and `lenis.destroy()`.
 *
 * Under prefers-reduced-motion the effect returns early BEFORE constructing
 * Lenis — so Lenis is never instantiated and there is nothing to destroy.
 *
 * We mock the `lenis` module so the constructor is observable and its instance
 * methods are spies. The CSS side-effect import (`lenis/dist/lenis.css`) is
 * handled by Vitest's default CSS handling.
 */

// Shared instance + constructor mock. Built via vi.hoisted so they exist when
// the (hoisted) vi.mock factory runs.
const { lenisInstance, LenisMock } = vi.hoisted(() => {
  const instance = {
    raf: vi.fn(),
    destroy: vi.fn(),
    on: vi.fn(),
    scrollTo: vi.fn(),
  };
  // Use a `function` (not an arrow) so `new Lenis()` works; return the shared
  // instance so its methods are observable spies.
  return {
    lenisInstance: instance,
    LenisMock: vi.fn(function LenisCtor() {
      return instance;
    }),
  };
});

vi.mock('lenis', () => ({
  default: LenisMock,
}));

// The component also imports the Lenis stylesheet as a side effect. Stub it so
// the import resolves cleanly regardless of Vitest CSS config.
vi.mock('lenis/dist/lenis.css', () => ({}));

/** matchMedia stub: only prefers-reduced-motion follows `reduce`. */
function setMatchMedia(reduce: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? reduce : false,
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

beforeEach(() => {
  LenisMock.mockClear();
  lenisInstance.raf.mockClear();
  lenisInstance.destroy.mockClear();
  lenisInstance.on.mockClear();
  lenisInstance.scrollTo.mockClear();
  setMatchMedia(false); // normal motion by default
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('SmoothScroll', () => {
  it('renders its children', () => {
    render(
      <SmoothScroll>
        <span>scrolled content</span>
      </SmoothScroll>,
    );
    expect(screen.getByText('scrolled content')).toBeInTheDocument();
  });

  it('instantiates Lenis on mount (with lerp option) under normal motion', () => {
    render(
      <SmoothScroll>
        <span>x</span>
      </SmoothScroll>,
    );
    expect(LenisMock).toHaveBeenCalledTimes(1);
    expect(LenisMock).toHaveBeenCalledWith({ lerp: 0.1 });
  });

  it('drives the Lenis rAF loop after mount', async () => {
    render(
      <SmoothScroll>
        <span>x</span>
      </SmoothScroll>,
    );
    // The rAF callback calls lenis.raf(time); give the loop a frame to run.
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    expect(lenisInstance.raf).toHaveBeenCalled();
  });

  it('calls lenis.destroy() on unmount', () => {
    const { unmount } = render(
      <SmoothScroll>
        <span>x</span>
      </SmoothScroll>,
    );
    expect(lenisInstance.destroy).not.toHaveBeenCalled();
    unmount();
    expect(lenisInstance.destroy).toHaveBeenCalledTimes(1);
  });

  it('removes the document click listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(
      <SmoothScroll>
        <span>x</span>
      </SmoothScroll>,
    );
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function));
  });

  it('does NOT instantiate Lenis under prefers-reduced-motion', () => {
    setMatchMedia(true);
    const { unmount } = render(
      <SmoothScroll>
        <span>native scroll</span>
      </SmoothScroll>,
    );
    expect(screen.getByText('native scroll')).toBeInTheDocument();
    expect(LenisMock).not.toHaveBeenCalled();
    // Nothing to tear down.
    unmount();
    expect(lenisInstance.destroy).not.toHaveBeenCalled();
  });

  it('routes a same-page hash anchor click to lenis.scrollTo', () => {
    const { container } = render(
      <SmoothScroll>
        <a href="#target" data-testid="hash-link">
          jump
        </a>
        <section id="target">target section</section>
      </SmoothScroll>,
    );

    const link = screen.getByTestId('hash-link');
    // The anchor's resolved .href must share pathname/search with the page for
    // the handler to intercept it; jsdom resolves #target against location.
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));

    expect(lenisInstance.scrollTo).toHaveBeenCalledTimes(1);
    // Called with the resolved target element.
    expect(lenisInstance.scrollTo).toHaveBeenCalledWith(
      container.querySelector('#target'),
    );
  });

  it('ignores anchor clicks whose hash target does not exist', () => {
    render(
      <SmoothScroll>
        <a href="#missing" data-testid="dead-link">
          nowhere
        </a>
      </SmoothScroll>,
    );
    screen
      .getByTestId('dead-link')
      .dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
    expect(lenisInstance.scrollTo).not.toHaveBeenCalled();
  });
});
