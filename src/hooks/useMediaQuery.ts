'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribe to a CSS media query.
 *
 * `matchMedia` is browser state React does not own, so it is read through
 * `useSyncExternalStore` rather than copied into `useState` from a mount effect.
 * That buys three things over the effect it replaced: no cascading render on
 * mount, an explicit server snapshot instead of an implicit one, and — the part
 * the effect could never do — a live response when the query flips after mount
 * (the user turning on Reduce Motion, or a 2-in-1 switching to touch).
 *
 * `serverFallback` is what the query reports during SSR *and* on the first
 * hydrating client render, so the initial client markup always matches the
 * server's. React re-reads the real value immediately after hydration and
 * re-renders if it differs. Pick the value whose branch is safe to show to
 * everyone for one frame.
 */
export function useMediaQuery(query: string, serverFallback = false): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return () => {};
      }

      const list = window.matchMedia(query);

      if (typeof list.addEventListener === 'function') {
        list.addEventListener('change', onStoreChange);
        return () => list.removeEventListener('change', onStoreChange);
      }

      // Safari < 14 shipped MediaQueryList without the EventTarget interface.
      list.addListener(onStoreChange);
      return () => list.removeListener(onStoreChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return serverFallback;
    }
    return window.matchMedia(query).matches;
  }, [query, serverFallback]);

  const getServerSnapshot = useCallback(() => serverFallback, [serverFallback]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
