'use client';

import { submitContact } from '@/app/contact/actions';
import { initialContactState } from '@/app/contact/state';
import AnimatedSection from '@/components/AnimatedSection';
import { Toast, type ToastState } from '@/components/Toast';
import { IconMail } from '@tabler/icons-react';
import Script from 'next/script';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

type Props = { siteKey: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-accent" disabled={pending}>
      {pending ? 'Sending…' : 'Send'}
    </button>
  );
}

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return (
    <p id={id} className="text-xs text-red-500">
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
  const formElementStyles = 'flex flex-col gap-1 w-full text-left';
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
    <AnimatedSection>
      {siteKey ? <Script src="https://www.google.com/recaptcha/api.js" strategy="lazyOnload" /> : null}
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 inline-flex items-center gap-3 leading-none">
          <IconMail size={44} className="shrink-0" aria-hidden="true" />
          <span>Contact me</span>
        </h1>
      </div>
      <form
        action={formAction}
        ref={formRef}
        className="flex flex-col gap-4 w-full max-w-lg mx-auto p-6 rounded-xl border border-light-accent/20 dark:border-dark-accent/20 bg-white/60 dark:bg-black/20 backdrop-blur"
      >
        {state.status !== 'idle' && state.message ? (
          <div
            role={state.status === 'error' ? 'alert' : 'status'}
            className={`rounded-lg border px-3 py-2 text-sm ${
              state.status === 'error'
                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200'
                : 'border-light-accent/40 bg-light-accent/10 text-light-primary dark:border-dark-accent/40 dark:bg-dark-accent/10 dark:text-dark-primary'
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <fieldset disabled={pending} className="contents">
          <span className={formElementStyles}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              key={`name-${values.name}`}
              defaultValue={values.name}
              className="w-full rounded-md border border-light-accent/30 dark:border-dark-accent/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-accent/40 dark:focus:ring-dark-accent/40"
              required
              aria-invalid={fieldErrors.name ? 'true' : undefined}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
            />
            <FieldError id="name-error" errors={fieldErrors.name} />
          </span>
          <span className={formElementStyles}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              key={`email-${values.email}`}
              defaultValue={values.email}
              className="w-full rounded-md border border-light-accent/30 dark:border-dark-accent/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-accent/40 dark:focus:ring-dark-accent/40"
              required
              aria-invalid={fieldErrors.email ? 'true' : undefined}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            <FieldError id="email-error" errors={fieldErrors.email} />
          </span>
          <span className={formElementStyles}>
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              name="subject"
              type="text"
              key={`subject-${values.subject}`}
              defaultValue={values.subject}
              className="w-full rounded-md border border-light-accent/30 dark:border-dark-accent/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-accent/40 dark:focus:ring-dark-accent/40"
              required
              aria-invalid={fieldErrors.subject ? 'true' : undefined}
              aria-describedby={fieldErrors.subject ? 'subject-error' : undefined}
            />
            <FieldError id="subject-error" errors={fieldErrors.subject} />
          </span>
          <span className={formElementStyles}>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              key={`message-${values.message}`}
              defaultValue={values.message}
              className="min-h-[120px] w-full rounded-md border border-light-accent/30 dark:border-dark-accent/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-accent/40 dark:focus:ring-dark-accent/40"
              required
              aria-invalid={fieldErrors.message ? 'true' : undefined}
              aria-describedby={fieldErrors.message ? 'message-error' : undefined}
            />
            <FieldError id="message-error" errors={fieldErrors.message} />
          </span>
          {siteKey ? (
            <div className="self-start">
              <div className="g-recaptcha" data-sitekey={siteKey} />
            </div>
          ) : (
            <div className="text-sm text-red-500">reCAPTCHA is not configured.</div>
          )}
          <SubmitButton />
        </fieldset>
      </form>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </AnimatedSection>
  );
}
