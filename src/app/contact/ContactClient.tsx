'use client';
import { submitAndRedirect } from '@/app/contact/actions';
import AnimatedSection from '@/components/AnimatedSection';
import { Toast, type ToastState } from '@/components/Toast';
import { IconMail } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

type Props = { siteKey: string };

function SubmitButton() {
  return (
    <button type="submit" className="btn btn-accent">
      Send
    </button>
  );
}

export default function ContactClient({ siteKey }: Props) {
  const formElementStyles = 'flex flex-col gap-1 w-full text-left';
  const qp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sent = qp.get('sent') === '1';
  const error = qp.get('error') === '1';
  const formRef = useRef<HTMLFormElement | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (qp.get('autosubmit') === '1') {
      formRef.current?.requestSubmit();
    }
  }, [qp]);

  useEffect(() => {
    if (sent) {
      setToast({ type: 'success', title: 'Message sent', desc: 'Thanks! I’ll get back to you soon.' });
      router.replace(pathname, { scroll: false });
    } else if (error) {
      setToast({
        type: 'error',
        title: 'Something went wrong',
        desc: 'Could not send your message. Please try again.',
      });
      router.replace(pathname, { scroll: false });
    }

    if (sent || error) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [sent, error, router, pathname]);

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
        action={submitAndRedirect}
        ref={formRef}
        className="flex flex-col gap-4 w-full max-w-lg mx-auto p-6 rounded-xl border border-light-accent/20 dark:border-dark-accent/20 bg-white/60 dark:bg-black/20 backdrop-blur"
      >
        <span className={formElementStyles}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={qp.get('name') || ''}
            className="w-full rounded-md border border-light-accent/30 dark:border-dark-accent/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-accent/40 dark:focus:ring-dark-accent/40"
            required
          />
        </span>
        <span className={formElementStyles}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={qp.get('email') || ''}
            className="w-full rounded-md border border-light-accent/30 dark:border-dark-accent/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-accent/40 dark:focus:ring-dark-accent/40"
            required
          />
        </span>
        <span className={formElementStyles}>
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            name="subject"
            type="text"
            defaultValue={qp.get('subject') || ''}
            className="w-full rounded-md border border-light-accent/30 dark:border-dark-accent/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-accent/40 dark:focus:ring-dark-accent/40"
            required
          />
        </span>
        <span className={formElementStyles}>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            defaultValue={qp.get('message') || ''}
            className="min-h-[120px] w-full rounded-md border border-light-accent/30 dark:border-dark-accent/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-accent/40 dark:focus:ring-dark-accent/40"
            required
          />
        </span>
        {siteKey ? (
          <div className="self-start">
            <div className="g-recaptcha" data-sitekey={siteKey} />
          </div>
        ) : (
          <div className="text-sm text-red-500">reCAPTCHA is not configured.</div>
        )}
        <SubmitButton />
      </form>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </AnimatedSection>
  );
}
