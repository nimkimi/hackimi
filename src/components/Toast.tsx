'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { IconAlertTriangleFilled, IconCircleCheckFilled } from '@tabler/icons-react';

export type ToastState = {
  type: 'success' | 'error';
  title: string;
  desc: string;
} | null;

export function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed top-20 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 pointer-events-none"
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
        >
          <div
            className={`pointer-events-auto relative flex items-start gap-3 rounded-xl px-4 py-3 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-xl bg-white/80 dark:bg-black/50 text-sm max-w-[92vw] sm:max-w-sm before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-xl ${
              toast.type === 'success' ? 'before:bg-light-accent dark:before:bg-dark-accent' : 'before:bg-red-500'
            }`}
          >
            <button
              aria-label="Dismiss"
              className="absolute top-2.5 right-2.5 inline-flex h-6 w-6 items-center justify-center rounded-md text-xs/none opacity-60 hover:opacity-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-light-accent/40 dark:focus-visible:ring-dark-accent/40"
              onClick={onClose}
            >
              ×
            </button>
            {toast.type === 'success' ? (
              <IconCircleCheckFilled
                size={20}
                className="shrink-0 text-light-accent dark:text-dark-accent"
                aria-hidden="true"
              />
            ) : (
              <IconAlertTriangleFilled size={20} className="shrink-0 text-red-500" aria-hidden="true" />
            )}
            <div className="pr-6 leading-5">
              <p className="font-medium leading-5">{toast.title}</p>
              <p className="mt-0.5 text-[13px] muted leading-5">{toast.desc}</p>
            </div>
            <motion.span
              aria-hidden
              className={`pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-b-xl ${
                toast.type === 'success' ? 'bg-light-accent/70 dark:bg-dark-accent/70' : 'bg-red-500/80'
              }`}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 4, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
