import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ContactFormState } from '@/app/contact/state';
import { initialContactState } from '@/app/contact/state';

/**
 * ContactClient drives its rendered output entirely from the `ContactFormState`
 * tuple returned by React 19's `useActionState`. Rather than exercise the real
 * server action (network + email + reCAPTCHA), we mock `useActionState` to
 * return a controlled `[state, formAction, isPending]` tuple. This lets us
 * render idle / error-with-fieldErrors / success states deterministically and
 * assert the exact DOM the component produces for each.
 */

// A mutable holder the mocked `useActionState` reads from, set per test.
const actionState: { current: ContactFormState } = { current: initialContactState };
const formAction = vi.fn();

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useActionState: vi.fn(() => [actionState.current, formAction, false] as const),
  };
});

// The real server action is never invoked; stub it so the import resolves
// without pulling in `server-only` / nodemailer / captcha modules.
vi.mock('@/app/contact/actions', () => ({
  submitContact: vi.fn(),
}));

// `next/script` would try to inject a real <script>; render an inert marker so
// we can assert the reCAPTCHA api.js script is (or isn't) requested.
vi.mock('next/script', () => ({
  default: ({ src }: { src: string }) => <script data-testid="next-script" data-src={src} />,
}));

// Import the component AFTER mocks are registered.
import ContactClient from '@/app/contact/ContactClient';

function setState(partial: Partial<ContactFormState>) {
  actionState.current = { ...initialContactState, ...partial };
}

afterEach(() => {
  actionState.current = initialContactState;
  formAction.mockClear();
});

describe('ContactClient — form fields', () => {
  beforeEach(() => setState({}));

  it('renders all form fields with their name attributes and required markers', () => {
    render(<ContactClient siteKey="test-site-key" />);

    const name = screen.getByLabelText('Name');
    const email = screen.getByLabelText('Email');
    const subject = screen.getByLabelText('Subject');
    const message = screen.getByLabelText('Message');

    expect(name).toHaveAttribute('name', 'name');
    expect(email).toHaveAttribute('name', 'email');
    expect(subject).toHaveAttribute('name', 'subject');
    expect(message).toHaveAttribute('name', 'message');

    expect(name).toBeRequired();
    expect(email).toBeRequired();
    expect(subject).toBeRequired();
    expect(message).toBeRequired();

    // Email field uses type=email.
    expect(email).toHaveAttribute('type', 'email');
  });

  it('renders a submit button', () => {
    render(<ContactClient siteKey="test-site-key" />);
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('renders no field errors or top-level message in the idle state', () => {
    render(<ContactClient siteKey="test-site-key" />);

    // No alert / status banner in idle.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    // Fields are not marked invalid.
    expect(screen.getByLabelText('Name')).not.toHaveAttribute('aria-invalid');
  });
});

describe('ContactClient — error state with field errors', () => {
  it('renders field-level error messages associated with the right fields', () => {
    setState({
      status: 'error',
      fieldErrors: {
        name: ['Name is required.'],
        email: ['Enter a valid email.'],
        message: ['Message is too short.'],
      },
      values: { name: '', email: 'bad', subject: '', message: 'hi' },
    });

    render(<ContactClient siteKey="test-site-key" />);

    expect(screen.getByText('Name is required.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email.')).toBeInTheDocument();
    expect(screen.getByText('Message is too short.')).toBeInTheDocument();

    // Each error is wired to its field via aria-describedby + aria-invalid.
    const name = screen.getByLabelText('Name');
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAttribute('aria-describedby', 'name-error');
    expect(screen.getByText('Name is required.')).toHaveAttribute('id', 'name-error');

    const email = screen.getByLabelText('Email');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAttribute('aria-describedby', 'email-error');

    // Subject had no error → not flagged invalid.
    expect(screen.getByLabelText('Subject')).not.toHaveAttribute('aria-invalid');
  });

  it('renders only the first error when a field has multiple errors', () => {
    setState({
      status: 'error',
      fieldErrors: { email: ['First problem.', 'Second problem.'] },
      values: initialContactState.values,
    });

    render(<ContactClient siteKey="test-site-key" />);

    expect(screen.getByText('First problem.')).toBeInTheDocument();
    expect(screen.queryByText('Second problem.')).not.toBeInTheDocument();
  });
});

describe('ContactClient — top-level error message', () => {
  it('renders the message in an alert with error styling', () => {
    setState({
      status: 'error',
      message: 'Something went wrong sending your message.',
      values: initialContactState.values,
    });

    render(<ContactClient siteKey="test-site-key" />);

    // The inline banner is now visual-only (no role); it carries the exact
    // message with error styling. (The message also appears in the Toast, so
    // disambiguate by the banner's container class.)
    const banner = screen
      .getAllByText('Something went wrong sending your message.')
      .find((el) => el.className.includes('rounded-lg'));
    expect(banner).toBeDefined();
    expect(banner?.className).toContain('text-red-300');

    // The Toast (driven by the effect) is the SINGLE live region announcing the
    // error to assistive tech — exactly one role="alert" on the page now.
    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(1);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});

describe('ContactClient — success state', () => {
  it('renders the success message as a status banner with accent styling', () => {
    setState({
      status: 'success',
      message: 'Thanks! Your message is on its way.',
      values: initialContactState.values,
    });

    render(<ContactClient siteKey="test-site-key" />);

    // The inline banner is now visual-only (no role); it carries the message
    // with accent (not error) styling. (The message also appears in the Toast,
    // so disambiguate by the banner's container class.)
    const banner = screen
      .getAllByText('Thanks! Your message is on its way.')
      .find((el) => el.className.includes('rounded-lg'));
    expect(banner).toBeDefined();
    expect(banner?.className).toContain('border-accent/40');
    expect(banner?.className).not.toContain('text-red-300');

    // The Toast is the SINGLE live region announcing success — exactly one
    // role="status" on the page now.
    const statuses = screen.getAllByRole('status');
    expect(statuses).toHaveLength(1);
    expect(screen.getByText('Message sent')).toBeInTheDocument();
  });

  it('renders empty inputs on success (state carries empty values)', () => {
    setState({
      status: 'success',
      message: 'Sent!',
      values: initialContactState.values,
    });

    render(<ContactClient siteKey="test-site-key" />);

    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Subject')).toHaveValue('');
    expect(screen.getByLabelText('Message')).toHaveValue('');
  });
});

describe('ContactClient — values repopulate on error', () => {
  it('reflects state.values in the inputs so the user does not lose input', () => {
    setState({
      status: 'error',
      message: 'Please fix the errors below.',
      fieldErrors: { email: ['Enter a valid email.'] },
      values: {
        name: 'Ada Lovelace',
        email: 'not-an-email',
        subject: 'Collaboration',
        message: 'Hello there, lets build something.',
      },
    });

    render(<ContactClient siteKey="test-site-key" />);

    expect(screen.getByLabelText('Name')).toHaveValue('Ada Lovelace');
    expect(screen.getByLabelText('Email')).toHaveValue('not-an-email');
    expect(screen.getByLabelText('Subject')).toHaveValue('Collaboration');
    expect(screen.getByLabelText('Message')).toHaveValue('Hello there, lets build something.');
  });
});

describe('ContactClient — reCAPTCHA widget', () => {
  it('renders the widget container and loads the api script when a site key is provided', () => {
    setState({});
    const { container } = render(<ContactClient siteKey="real-site-key" />);

    const widget = container.querySelector('.g-recaptcha');
    expect(widget).not.toBeNull();
    expect(widget).toHaveAttribute('data-sitekey', 'real-site-key');

    const script = screen.getByTestId('next-script');
    expect(script).toHaveAttribute('data-src', 'https://www.google.com/recaptcha/api.js');

    // The "not configured" fallback is absent when a key exists.
    expect(screen.queryByText('reCAPTCHA is not configured.')).not.toBeInTheDocument();
  });

  it('skips the widget/script and shows a not-configured notice when site key is empty', () => {
    setState({});
    const { container } = render(<ContactClient siteKey="" />);

    expect(container.querySelector('.g-recaptcha')).toBeNull();
    expect(screen.queryByTestId('next-script')).not.toBeInTheDocument();
    expect(screen.getByText('reCAPTCHA is not configured.')).toBeInTheDocument();
  });
});
