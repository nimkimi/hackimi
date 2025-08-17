'use client';
import { submitAndRedirect } from '@/app/contact/actions';
import AnimatedSection from '@/components/AnimatedSection';
import { Mail } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Toast, type ToastState } from '@/components/ui/Toast';

// Ensure Node.js runtime for this route segment so server actions can use nodemailer
export const runtime = 'nodejs';

function SubmitButton() {
  return (
    <button type="submit" className="btn btn-accent">
      Send
    </button>
  );
}

function ContactContent() {
  const formElementStyles = 'flex flex-col gap-1 w-full text-left';
  const qp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sent = qp.get('sent') === '1';
  const error = qp.get('error') === '1';
  const formRef = useRef<HTMLFormElement | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  // Optional QA helper: auto-submit when autosubmit=1
  useEffect(() => {
    if (qp.get('autosubmit') === '1') {
      formRef.current?.requestSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show toast based on query flags, then clear the querystring
  useEffect(() => {
    if (sent) {
      setToast({
        type: 'success',
        title: 'Message sent',
        desc: 'Thanks! I’ll get back to you soon.',
      });
      // Clear the query string to keep the URL clean
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
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 inline-flex items-center gap-3">
          <Mail className="h-7 w-7" /> Contact me
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
        <SubmitButton />
      </form>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </AnimatedSection>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto p-6 text-center">Loading…</div>
      }
    >
      <ContactContent />
    </Suspense>
  );
}
