import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { installMatchMedia, resetMediaQueries } from './match-media';

// Unmount React trees and clear the DOM between tests, and put every media
// query back to "no match" so one test's `setMediaQuery` cannot leak into the
// next (the reset also reinstalls the fake over any per-test replacement).
afterEach(() => {
  cleanup();
  resetMediaQueries();
});

// jsdom does not implement matchMedia; install a controllable fake that defaults
// every query to "no match" (e.g. no prefers-reduced-motion). Unlike a plain
// stub it stores listeners, so `setMediaQuery` can drive a live change at
// anything subscribed via useSyncExternalStore. See ./match-media.ts.
installMatchMedia();

// jsdom lacks IntersectionObserver; provide an inert stub.
class IntersectionObserverStub implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);

// jsdom lacks ResizeObserver; provide an inert stub.
class ResizeObserverStub implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub);
