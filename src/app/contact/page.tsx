import { Suspense } from 'react';
import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Send a message to Nima Hakimi through a secure contact form powered by reCAPTCHA.',
  alternates: {
    canonical: 'https://hackimi.dev/contact',
  },
};

export default function ContactPage() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || process.env.RECAPTCHA_SITE_KEY || '';

  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-6 text-center">Loading…</div>}>
      <ContactClient siteKey={siteKey} />
    </Suspense>
  );
}
