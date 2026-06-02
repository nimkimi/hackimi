'use client';
import { useEffect, useRef, useState } from 'react';
import { IconAlertTriangleFilled, IconCircleCheckFilled } from '@tabler/icons-react';

export type ToastState = {
  type: 'success' | 'error';
  title: string;
  desc: string;
} | null;

export function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  const [renderedToast, setRenderedToast] = useState<ToastState>(toast);
  const [visible, setVisible] = useState(Boolean(toast));
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (toast) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      setRenderedToast(toast);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    if (renderedToast) {
      setVisible(false);
      const timeout = setTimeout(() => {
        setRenderedToast(null);
        hideTimeoutRef.current = null;
      }, 200);
      hideTimeoutRef.current = timeout;
      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [toast, renderedToast]);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

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
          className="absolute top-2.5 right-2.5 inline-flex h-6 w-6 items-center justify-center rounded-md text-base/none text-muted transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
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
