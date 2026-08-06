'use client';
import { useEffect, useState } from 'react';
import { IconAlertTriangleFilled, IconCircleCheckFilled } from '@tabler/icons-react';

export type ToastState = {
  type: 'success' | 'error';
  title: string;
  desc: string;
} | null;

/**
 * The toast outlives its `toast` prop: when the parent clears it, the content
 * has to stay mounted for the 200ms exit transition. `renderedToast` is that
 * lagging copy, and `visible` drives the enter/exit classes.
 */
export function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  const [renderedToast, setRenderedToast] = useState<ToastState>(toast);
  const [visible, setVisible] = useState(Boolean(toast));
  const [prevToast, setPrevToast] = useState<ToastState>(toast);

  // Adjust state during render rather than from an effect. Passive effects run
  // after paint, so setting `renderedToast` there costs a frame that still
  // shows the previous toast's title, icon and role; a render-phase update is
  // re-rendered before the browser paints at all.
  if (toast !== prevToast) {
    setPrevToast(toast);
    if (toast) {
      // Enter: commit the new content with `visible` untouched, so a toast
      // arriving from nothing mounts hidden and the rAF below animates it in.
      setRenderedToast(toast);
    } else if (renderedToast) {
      // Exit: start fading now; the timeout below unmounts once it has played.
      setVisible(false);
    }
  }

  useEffect(() => {
    if (!toast) return undefined;
    // One frame after the hidden mount so the transition has two values to
    // interpolate between — setting `visible` in the same commit skips it.
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [toast]);

  useEffect(() => {
    if (toast || !renderedToast) return undefined;
    // Matches the 200ms `duration-200` exit transition; cleanup covers both a
    // toast arriving mid-exit and the component unmounting mid-exit.
    const timeout = setTimeout(() => setRenderedToast(null), 200);
    return () => clearTimeout(timeout);
  }, [toast, renderedToast]);

  if (!renderedToast) {
    return null;
  }

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 pointer-events-none transition-all duration-200 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
      role={renderedToast.type === 'error' ? 'alert' : 'status'}
      aria-live={renderedToast.type === 'error' ? 'assertive' : 'polite'}
    >
      <div
        className={`pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border border-white/10 bg-surface/95 px-4 py-3 text-sm shadow-2xl shadow-black/40 backdrop-blur-xl max-w-[92vw] sm:max-w-sm before:absolute before:inset-y-0 before:left-0 before:w-1 ${
          renderedToast.type === 'success' ? 'before:bg-accent' : 'before:bg-red-500'
        }`}
      >
        <button
          aria-label="Dismiss"
          className="absolute top-2.5 right-2.5 inline-flex h-6 w-6 items-center justify-center rounded-md text-base/none text-muted transition-colors hover:text-ink focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent/50"
          onClick={onClose}
        >
          ×
        </button>
        {renderedToast.type === 'success' ? (
          <IconCircleCheckFilled size={20} className="shrink-0 text-accent" aria-hidden="true" />
        ) : (
          <IconAlertTriangleFilled size={20} className="shrink-0 text-red-500" aria-hidden="true" />
        )}
        <div className="pr-6 leading-5">
          <p className="font-medium leading-5 text-ink">{renderedToast.title}</p>
          <p className="mt-0.5 text-[13px] leading-5 text-muted">{renderedToast.desc}</p>
        </div>
        <span
          aria-hidden
          className={`pointer-events-none absolute bottom-0 left-0 h-0.5 ${
            renderedToast.type === 'success' ? 'bg-accent/70' : 'bg-red-500/80'
          } animate-toast-progress`}
        />
      </div>
    </div>
  );
}
