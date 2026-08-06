import { renderToStaticMarkup } from 'react-dom/server';
import { act, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { mediaQuerySpies, setMediaQuery } from '../setup/match-media';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * Unit tests for the shared media-query subscription.
 *
 * The hook is the SSR-safe replacement for the mount-only `matchMedia` effects
 * that used to live in Reveal and MagneticButton. Its contract has four parts:
 *   - during SSR (and therefore on the first hydrating client render) it reports
 *     the caller's `serverFallback`, never the real query result;
 *   - on the client it reports the live `matches` value;
 *   - it re-renders when the query flips *after* mount;
 *   - it unsubscribes on unmount, and degrades to `serverFallback` where
 *     `matchMedia` does not exist at all.
 */

const QUERY = '(prefers-reduced-motion: reduce)';

function Probe({ query = QUERY, serverFallback = false }: { query?: string; serverFallback?: boolean }) {
  const matches = useMediaQuery(query, serverFallback);
  return <span data-testid="probe">{String(matches)}</span>;
}

describe('useMediaQuery — server snapshot', () => {
  it('renders the serverFallback during SSR even when the query matches', () => {
    setMediaQuery(QUERY, true);

    const html = renderToStaticMarkup(<Probe serverFallback={false} />);

    expect(html).toContain('>false<');
  });

  it('renders a true serverFallback during SSR even when the query does not match', () => {
    setMediaQuery('(pointer: coarse)', false);

    const html = renderToStaticMarkup(<Probe query="(pointer: coarse)" serverFallback={true} />);

    expect(html).toContain('>true<');
  });
});

describe('useMediaQuery — client snapshot', () => {
  it('reports false when the query does not match', () => {
    const { result } = renderHook(() => useMediaQuery(QUERY));

    expect(result.current).toBe(false);
  });

  it('reports true when the query already matches at mount', () => {
    setMediaQuery(QUERY, true);

    const { result } = renderHook(() => useMediaQuery(QUERY));

    expect(result.current).toBe(true);
  });

  it('ignores the serverFallback once rendering on the client', () => {
    setMediaQuery(QUERY, false);

    const { result } = renderHook(() => useMediaQuery(QUERY, true));

    expect(result.current).toBe(false);
  });

  it('reads each query independently', () => {
    setMediaQuery('(pointer: coarse)', true);

    const { result: reduce } = renderHook(() => useMediaQuery(QUERY));
    const { result: coarse } = renderHook(() => useMediaQuery('(pointer: coarse)'));

    expect(reduce.current).toBe(false);
    expect(coarse.current).toBe(true);
  });
});

describe('useMediaQuery — live updates', () => {
  it('re-renders when the query starts matching after mount', () => {
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('false');

    act(() => {
      setMediaQuery(QUERY, true);
    });

    expect(screen.getByTestId('probe')).toHaveTextContent('true');
  });

  it('re-renders when the query stops matching after mount', () => {
    setMediaQuery(QUERY, true);
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('true');

    act(() => {
      setMediaQuery(QUERY, false);
    });

    expect(screen.getByTestId('probe')).toHaveTextContent('false');
  });

  it('subscribes through the modern change-event API', () => {
    render(<Probe />);

    expect(mediaQuerySpies(QUERY).addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});

describe('useMediaQuery — teardown', () => {
  it('removes its change listener on unmount', () => {
    const { unmount } = render(<Probe />);
    const spies = mediaQuerySpies(QUERY);
    expect(spies.removeEventListener).not.toHaveBeenCalled();

    unmount();

    expect(spies.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('stops re-rendering after unmount', () => {
    const { unmount } = render(<Probe />);
    unmount();

    // No React tree is listening any more, so this must not throw or warn.
    act(() => {
      setMediaQuery(QUERY, true);
    });

    expect(screen.queryByTestId('probe')).toBeNull();
  });
});

describe('useMediaQuery — shared per-query subscription', () => {
  /** Every `window.matchMedia(...)` argument the fake has been handed so far. */
  function matchMediaCallsFor(query: string): unknown[][] {
    const matchMedia = window.matchMedia as unknown as ReturnType<typeof vi.fn>;
    return matchMedia.mock.calls.filter(([q]) => q === query);
  }

  it('allocates one MediaQueryList per query, not one per subscriber per render', () => {
    render(
      <>
        <Probe />
        <Probe />
        <Probe />
      </>
    );

    // Reveal is on the page many times over; a MediaQueryList per render is a
    // per-render allocation on the site's hottest component.
    expect(matchMediaCallsFor(QUERY)).toHaveLength(1);
  });

  it('registers a single native listener however many components subscribe', () => {
    render(
      <>
        <Probe />
        <Probe />
        <Probe />
      </>
    );

    expect(mediaQuerySpies(QUERY).addEventListener).toHaveBeenCalledTimes(1);
  });

  it('keeps the native listener while any subscriber is left', () => {
    const first = render(<Probe />);
    render(<Probe />);

    first.unmount();

    expect(mediaQuerySpies(QUERY).removeEventListener).not.toHaveBeenCalled();
  });

  it('removes the native listener when the last subscriber unsubscribes', () => {
    const first = render(<Probe />);
    const second = render(<Probe />);

    first.unmount();
    second.unmount();

    expect(mediaQuerySpies(QUERY).removeEventListener).toHaveBeenCalledTimes(1);
  });

  it('re-attaches a listener when a query is subscribed again after going quiet', () => {
    render(<Probe />).unmount();

    const { getAllByTestId } = render(<Probe />);
    act(() => {
      setMediaQuery(QUERY, true);
    });

    expect(mediaQuerySpies(QUERY).addEventListener).toHaveBeenCalledTimes(2);
    expect(getAllByTestId('probe')[0]).toHaveTextContent('true');
  });

  it('notifies every component sharing one query', () => {
    render(
      <>
        <Probe />
        <Probe />
      </>
    );
    const probes = screen.getAllByTestId('probe');
    expect(probes).toHaveLength(2);

    act(() => {
      setMediaQuery(QUERY, true);
    });

    for (const probe of probes) expect(probe).toHaveTextContent('true');
  });

  it('keeps two different queries independent when both are live', () => {
    render(
      <>
        <Probe />
        <Probe query="(pointer: coarse)" />
      </>
    );

    act(() => {
      setMediaQuery('(pointer: coarse)', true);
    });

    const [reduce, coarse] = screen.getAllByTestId('probe');
    expect(reduce).toHaveTextContent('false');
    expect(coarse).toHaveTextContent('true');
    expect(mediaQuerySpies(QUERY).addEventListener).toHaveBeenCalledTimes(1);
    expect(mediaQuerySpies('(pointer: coarse)').addEventListener).toHaveBeenCalledTimes(1);
  });
});

describe('useMediaQuery — no matchMedia at all', () => {
  it('falls back to the serverFallback instead of throwing', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useMediaQuery(QUERY, true));

    expect(result.current).toBe(true);
  });

  it('defaults to false when no serverFallback is given', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useMediaQuery(QUERY));

    expect(result.current).toBe(false);
  });
});
