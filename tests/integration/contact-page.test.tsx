import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Integration test for the /contact page (a synchronous React Server
 * Component wrapper).
 *
 * The page reads the reCAPTCHA site key from the environment and passes it to
 * <ContactClient siteKey={...} />. The key resolution is:
 *
 *   process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
 *     || process.env.RECAPTCHA_SITE_KEY
 *     || ''
 *
 * We mock ContactClient to a spy so we can assert the exact prop the page
 * forwards without dragging in the whole form (useActionState, the server
 * action, next/script, etc.). Env is mutated per-test and the page module is
 * re-imported each time (it reads process.env at render, but resetModules keeps
 * the spy/import wiring clean and isolated).
 */

const contactClientSpy = vi.fn(
  (_props: { siteKey: string }) => <div data-testid="contact-client" />,
);
vi.mock('@/app/contact/ContactClient', () => ({
  default: (props: { siteKey: string }) => contactClientSpy(props),
}));

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  contactClientSpy.mockClear();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

async function renderContactPage() {
  const ContactPage = (await import('@/app/contact/page')).default;
  render(<ContactPage />);
}

describe('Contact page (/contact)', () => {
  it('passes NEXT_PUBLIC_RECAPTCHA_SITE_KEY to ContactClient when set', async () => {
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'public-site-key';
    delete process.env.RECAPTCHA_SITE_KEY;

    await renderContactPage();

    expect(screen.getByTestId('contact-client')).toBeInTheDocument();
    expect(contactClientSpy).toHaveBeenCalledTimes(1);
    expect(contactClientSpy).toHaveBeenCalledWith(
      expect.objectContaining({ siteKey: 'public-site-key' }),
    );
  });

  it('falls back to RECAPTCHA_SITE_KEY when the public key is absent', async () => {
    delete process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    process.env.RECAPTCHA_SITE_KEY = 'fallback-key';

    await renderContactPage();

    expect(contactClientSpy).toHaveBeenCalledWith(
      expect.objectContaining({ siteKey: 'fallback-key' }),
    );
  });

  it('passes an empty string when no site key env is set', async () => {
    delete process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    delete process.env.RECAPTCHA_SITE_KEY;

    await renderContactPage();

    expect(contactClientSpy).toHaveBeenCalledWith(
      expect.objectContaining({ siteKey: '' }),
    );
  });

  it('prefers the public key over the fallback when both are set', async () => {
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'public-key';
    process.env.RECAPTCHA_SITE_KEY = 'fallback-key';

    await renderContactPage();

    expect(contactClientSpy).toHaveBeenCalledWith(
      expect.objectContaining({ siteKey: 'public-key' }),
    );
  });

  it('exports static contact metadata', async () => {
    const { metadata } = await import('@/app/contact/page');
    expect(metadata.title).toBe('Contact');
    expect(metadata.alternates?.canonical).toBe('https://hackimi.dev/contact');
  });
});
