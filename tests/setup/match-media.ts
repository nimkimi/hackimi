import { vi } from 'vitest';

/**
 * A controllable `window.matchMedia` fake for the jsdom project.
 *
 * jsdom implements no media queries at all, and the stub this replaced returned
 * `matches: false` with `addEventListener`/`addListener` as bare `vi.fn()`
 * spies — they recorded calls and stored nothing, so nothing could ever notify a
 * registered listener. That was fine while components read `matchMedia` once in
 * a mount effect, but `useMediaQuery` subscribes, and a subscription that can
 * never fire is untestable.
 *
 * So state lives in a registry keyed by query string rather than on the returned
 * `MediaQueryList`. Real `matchMedia` hands back a fresh object per call, this
 * fake does too, and the registry keeps `matches` and the listener set coherent
 * across all of them — which is exactly the case a per-object stub would get
 * wrong (subscribe on one object, unsubscribe on another).
 *
 * Unregistered queries report `matches: false`, matching the old stub, so tests
 * that never opt in behave exactly as before.
 */

type ChangeListener = (event: MediaQueryListEvent) => void;

type QueryEntry = {
  matches: boolean;
  listeners: Set<ChangeListener>;
  /** Shared across every MediaQueryList handed out for this query, so a test can
   * assert on subscribe/unsubscribe without capturing the exact object. */
  spies: MediaQuerySpies;
};

type ListenerSpy = ReturnType<typeof vi.fn<(...args: unknown[]) => void>>;

export type MediaQuerySpies = {
  addEventListener: ListenerSpy;
  removeEventListener: ListenerSpy;
  addListener: ListenerSpy;
  removeListener: ListenerSpy;
};

const registry = new Map<string, QueryEntry>();

function entryFor(query: string): QueryEntry {
  const existing = registry.get(query);
  if (existing) return existing;

  const entry: QueryEntry = {
    matches: false,
    listeners: new Set(),
    spies: {
      addEventListener: vi.fn<(...args: unknown[]) => void>(),
      removeEventListener: vi.fn<(...args: unknown[]) => void>(),
      addListener: vi.fn<(...args: unknown[]) => void>(),
      removeListener: vi.fn<(...args: unknown[]) => void>(),
    },
  };
  registry.set(query, entry);
  return entry;
}

function createMediaQueryList(query: string): MediaQueryList {
  const entry = entryFor(query);

  const list = {
    media: query,
    onchange: null,
    // A getter, not a snapshot: `setMediaQuery` must be visible to a list that
    // was obtained before the flip.
    get matches() {
      return entry.matches;
    },
    addEventListener: (type: string, listener: ChangeListener) => {
      entry.spies.addEventListener(type, listener);
      if (type === 'change') entry.listeners.add(listener);
    },
    removeEventListener: (type: string, listener: ChangeListener) => {
      entry.spies.removeEventListener(type, listener);
      if (type === 'change') entry.listeners.delete(listener);
    },
    // Safari < 14 only ever had this pair; the hook falls back to it.
    addListener: (listener: ChangeListener) => {
      entry.spies.addListener(listener);
      entry.listeners.add(listener);
    },
    removeListener: (listener: ChangeListener) => {
      entry.spies.removeListener(listener);
      entry.listeners.delete(listener);
    },
    dispatchEvent: () => true,
  };

  return list as unknown as MediaQueryList;
}

/**
 * Flip a query's result and synchronously notify every registered listener,
 * the way a real browser does when the underlying condition changes.
 * Wrap the call in `act()` when a React tree is subscribed.
 */
export function setMediaQuery(query: string, matches: boolean): void {
  const entry = entryFor(query);
  entry.matches = matches;

  const event = { matches, media: query } as MediaQueryListEvent;
  // Copy first: a listener may unsubscribe itself while we iterate.
  for (const listener of [...entry.listeners]) listener(event);
}

/** The subscribe/unsubscribe spies shared by every list handed out for `query`. */
export function mediaQuerySpies(query: string): MediaQuerySpies {
  return entryFor(query).spies;
}

/** Install the fake on `window`. Called by the global jsdom setup. */
export function installMatchMedia(): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    // The implementation is passed to `vi.fn()` rather than set afterwards so a
    // test file's `vi.restoreAllMocks()` resets to this, not to a no-op.
    value: vi.fn((query: string) => createMediaQueryList(query)),
  });
}

/**
 * Drop all registered queries (so every query reports `matches: false` again)
 * and reinstall the fake, undoing any per-test replacement of `window.matchMedia`.
 */
export function resetMediaQueries(): void {
  registry.clear();
  installMatchMedia();
}
