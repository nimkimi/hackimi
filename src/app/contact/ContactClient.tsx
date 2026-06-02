'use client';

import { submitContact } from '@/app/contact/actions';
import { initialContactState } from '@/app/contact/state';
import { Toast, type ToastState } from '@/components/Toast';
import Reveal from '@/components/motion/Reveal';
import Script from 'next/script';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

type Props = { siteKey: string };

const FIELD_CLASS =
  'w-full min-h-11 rounded-lg border border-white/15 bg-surface px-3.5 py-2.5 text-base text-ink placeholder:text-muted/60 transition-colors focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50';

const LABEL_CLASS = 'mono-label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-base transition-colors hover:bg-accent-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <span className="sr-only">Sending</span>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-base/40 border-t-base"
          />
          <span aria-hidden="true">Sending…</span>
        </>
      ) : (
        'Send message'
      )}
    </button>
  );
}

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return (
    <p id={id} className="text-xs text-red-400">
      {errors[0]}
    </p>
  );
}

function resetRecaptcha() {
  if (typeof window === 'undefined') return;
  const maybeGrecaptcha = (window as typeof window & { grecaptcha?: { reset?: () => void } }).grecaptcha;
  maybeGrecaptcha?.reset?.();
}

export default function ContactClient({ siteKey }: Props) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [state, formAction, pending] = useActionState(submitContact, initialContactState);

  useEffect(() => {
    if (state.status === 'success') {
      setToast({ type: 'success', title: 'Message sent', desc: state.message ?? 'Thanks! I’ll get back to you soon.' });
      formRef.current?.reset();
      resetRecaptcha();
    } else if (state.status === 'error' && state.message) {
      setToast({ type: 'error', title: 'Something went wrong', desc: state.message });
    }

    if (state.status === 'success' || state.status === 'error') {
      const timeout = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [state]);

  const fieldErrors = state.fieldErrors ?? {};
  const values = state.values;

  return (
    <section className="py-12 sm:py-16">
      {siteKey ? <Script src="https://www.google.com/recaptcha/api.js" strategy="lazyOnload" /> : null}

      <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-[1fr_minmax(0,32rem)]">
        {/* Left — invitation */}
        <header className="max-w-xl">
          <Reveal>
            <div className="mb-[clamp(1.25rem,4vh,2.25rem)] flex items-center gap-3">
              <span aria-hidden className="h-px w-7 bg-accent" />
              <span className="mono-label text-accent">Contact</span>
            </div>
          </Reveal>

          <h1
            className="font-display font-bold leading-[1.04] tracking-tight"
            style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)' }}
          >
            <span className="block overflow-hidden">
              <Reveal>Let’s build</Reveal>
            </span>
            <span className="block overflow-hidden">
              <Reveal delay={0.06}>
                something <span className="text-accent">good.</span>
              </Reveal>
            </span>
          </h1>

          <Reveal delay={0.12} className="mt-[clamp(1.5rem,5vh,2.5rem)]">
            <p className="measure text-[clamp(1rem,2vw,1.1875rem)] leading-relaxed text-muted">
              Open to frontend roles and collaborations. Have a question about my work, or a team I’d be a fit for?
              Drop a line — I read everything and reply.
            </p>
          </Reveal>
        </header>

        {/* Right — form */}
        <Reveal delay={0.1}>
          <form
            action={formAction}
            ref={formRef}
            className="flex w-full flex-col gap-5 rounded-2xl border border-white/10 bg-surface/40 p-6 sm:p-8"
          >
            {state.status !== 'idle' && state.message ? (
              // Visual-only echo of the result; the Toast is the single live
              // region that announces to assistive tech (avoids double-announce).
              <div
                className={`rounded-lg border px-3.5 py-2.5 text-sm ${
                  state.status === 'error'
                    ? 'border-red-500/40 bg-red-500/10 text-red-300'
                    : 'border-accent/40 bg-accent/10 text-ink'
                }`}
              >
                {state.message}
              </div>
            ) : null}

            <fieldset disabled={pending} className="contents">
              <div className="flex flex-col gap-2 text-left">
                <label htmlFor="name" className={LABEL_CLASS}>
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  key={`name-${values.name}`}
                  defaultValue={values.name}
                  className={FIELD_CLASS}
                  required
                  aria-invalid={fieldErrors.name ? 'true' : undefined}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                />
                <FieldError id="name-error" errors={fieldErrors.name} />
              </div>

              <div className="flex flex-col gap-2 text-left">
                <label htmlFor="email" className={LABEL_CLASS}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  key={`email-${values.email}`}
                  defaultValue={values.email}
                  className={FIELD_CLASS}
                  required
                  aria-invalid={fieldErrors.email ? 'true' : undefined}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                />
                <FieldError id="email-error" errors={fieldErrors.email} />
              </div>

              <div className="flex flex-col gap-2 text-left">
                <label htmlFor="subject" className={LABEL_CLASS}>
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  key={`subject-${values.subject}`}
                  defaultValue={values.subject}
                  className={FIELD_CLASS}
                  required
                  aria-invalid={fieldErrors.subject ? 'true' : undefined}
                  aria-describedby={fieldErrors.subject ? 'subject-error' : undefined}
                />
                <FieldError id="subject-error" errors={fieldErrors.subject} />
              </div>

              <div className="flex flex-col gap-2 text-left">
                <label htmlFor="message" className={LABEL_CLASS}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  key={`message-${values.message}`}
                  defaultValue={values.message}
                  className={`${FIELD_CLASS} min-h-[140px] resize-y`}
                  required
                  aria-invalid={fieldErrors.message ? 'true' : undefined}
                  aria-describedby={fieldErrors.message ? 'message-error' : undefined}
                />
                <FieldError id="message-error" errors={fieldErrors.message} />
              </div>

              {siteKey ? (
                <div className="self-start">
                  <div className="g-recaptcha" data-sitekey={siteKey} />
                </div>
              ) : (
                <div className="text-sm text-red-400">reCAPTCHA is not configured.</div>
              )}

              <SubmitButton />
            </fieldset>
          </form>
        </Reveal>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </section>
  );
}
