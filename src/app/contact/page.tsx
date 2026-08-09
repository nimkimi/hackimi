import { buildPageMetadata } from '@/lib/metadata';
import ContactClient from './ContactClient';

export const runtime = 'nodejs';

export const metadata = buildPageMetadata({
  title: 'Contact',
  description: 'Send a message to Nima Hakimi through a secure contact form powered by reCAPTCHA.',
  path: '/contact',
});

export default function ContactPage() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || process.env.RECAPTCHA_SITE_KEY || '';

  return <ContactClient siteKey={siteKey} />;
}
