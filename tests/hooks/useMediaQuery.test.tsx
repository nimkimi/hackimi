import { renderToStaticMarkup } from 'react-dom/server';
import { act, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
