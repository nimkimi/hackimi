'use client';

import { useCallback, useSyncExternalStore } from 'react';

type QuerySubscription = {
  list: MediaQueryList;
  /** Every `useSyncExternalStore` callback currently watching this query. */
  subscribers: Set<() => void>;
  /** Removes the one native listener, or `null` while none is attached. */
  detach: (() => void) | null;
};

/**
 * One `MediaQueryList` and one native listener per distinct query, shared by
 * every component that asks for it.
 *
 * Without this, `getSnapshot` would call `window.matchMedia()` on every render
 * of every subscriber and each subscriber would register its own listener.
 * `Reveal` is on the page many times over, so that is a per-render allocation
 * and an O(subscribers) listener count on the site's most repeated component.
 * Sharing also makes `getSnapshot` return a plain boolean read off a stable
 * object, which is what React needs from a snapshot it calls during render.
 */
const subscriptions = new Map<string, QuerySubscription>();

function hasMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

/** Caller must have checked `hasMatchMedia()`. */
function subscriptionFor(query: string): QuerySubscription {
  const existing = subscriptions.get(query);
  if (existing) return existing;

  const created: QuerySubscription = {
    list: window.matchMedia(query),
    subscribers: new Set(),
    detach: null,
  };
  subscriptions.set(query, created);
  return created;
}

function subscribeToQuery(query: string, onStoreChange: () => void): () => void {
  const subscription = subscriptionFor(query);
  subscription.subscribers.add(onStoreChange);

  if (!subscription.detach) {
    const { list } = subscription;
    const notify = () => {
      // Copy first: a subscriber may unsubscribe itself as it reacts.
      for (const subscriber of [...subscription.subscribers]) subscriber();
    };

    if (typeof list.addEventListener === 'function') {
      list.addEventListener('change', notify);
      subscription.detach = () => list.removeEventListener('change', notify);
    } else {
      // Safari < 14 shipped MediaQueryList without the EventTarget interface.
      list.addListener(notify);
      subscription.detach = () => list.removeListener(notify);
    }
  }

  return () => {
    subscription.subscribers.delete(onStoreChange);
    if (subscription.subscribers.size > 0) return;
    // Last one out drops the native listener. The MediaQueryList itself stays
    // cached — it is inert without a listener, and keeping it means a query
    // that comes back (a route change remounting Reveals) does not re-allocate.
    subscription.detach?.();
    subscription.detach = null;
  };
}

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
      if (!hasMatchMedia()) return () => {};
      return subscribeToQuery(query, onStoreChange);
    },
    [query]
  );

  // Cheap enough to run on every render: a map lookup and a property read. It
  // returns a boolean, so an unchanged query always yields an identical value.
  const getSnapshot = useCallback(() => {
    if (!hasMatchMedia()) return serverFallback;
    return subscriptionFor(query).list.matches;
  }, [query, serverFallback]);

  const getServerSnapshot = useCallback(() => serverFallback, [serverFallback]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Drop every cached subscription. **Test-only.**
 *
 * The jsdom suite reinstalls its `window.matchMedia` fake between cases, and a
 * `MediaQueryList` cached from the previous fake would keep answering with the
 * previous case's state. Nothing in the app calls this: in a browser the cache
 * is meant to live as long as the document.
 */
export function resetMediaQueryCache(): void {
  for (const subscription of subscriptions.values()) subscription.detach?.();
  subscriptions.clear();
}
