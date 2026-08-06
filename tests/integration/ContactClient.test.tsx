import { act, render, screen } from '@testing-library/react';
import { Profiler, type ReactNode } from 'react';
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

/**
 * React documents `useMemo` as a discardable performance hint: it may throw the
 * cached value away and recompute (it already does on Suspense/Offscreen paths).
 * Flipping this on makes every `useMemo` in the tree recompute on every render,
 * which is the worst case React is allowed to hand a component. Nothing derived
 * from a memo may change behaviour under it.
 */
const discardMemo = { current: false };

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useActionState: vi.fn(() => [actionState.current, formAction, false] as const),
    // `actual.useMemo` is always called so hook order never shifts; only the
    // returned value differs when the cache is treated as discarded.
    useMemo: <T,>(factory: () => T, deps: unknown[]): T => {
      const cached = actual.useMemo(factory, deps);
      return discardMemo.current ? factory() : cached;
    },
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
  discardMemo.current = false;
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

/**
 * Every test above mounts already in its target state, so none of them
 * exercises the toast reacting to a CHANGED action result. These do: they
 * re-render with a fresh `ContactFormState` (which is what `useActionState`
 * hands back per submission) and assert the toast follows.
 */
describe('ContactClient — toast across successive submissions', () => {
  it('replaces a success toast with an error toast on a second submission', () => {
    setState({ status: 'success', message: 'Thanks! I’ll get back to you soon.' });
    const { rerender } = render(<ContactClient siteKey="test-site-key" />);

    expect(screen.getByText('Message sent')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');

    setState({ status: 'error', message: 'Could not send your message right now. Please try again.' });
    rerender(<ContactClient siteKey="test-site-key" />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText('Message sent')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the new message when a second submission succeeds again', () => {
    setState({ status: 'success', message: 'First message delivered.' });
    const { rerender } = render(<ContactClient siteKey="test-site-key" />);

    // The message also appears in the inline banner, so assert on the toast
    // itself — it is the only role="status" on the page.
    expect(screen.getByRole('status')).toHaveTextContent('First message delivered.');

    setState({ status: 'success', message: 'Second message delivered.' });
    rerender(<ContactClient siteKey="test-site-key" />);

    const statuses = screen.getAllByRole('status');
    expect(statuses).toHaveLength(1);
    // The toast desc echoes the action's message, so it must track the new one.
    expect(statuses[0]).toHaveTextContent('Message sent');
    expect(statuses[0]).toHaveTextContent('Second message delivered.');
    expect(statuses[0]).not.toHaveTextContent('First message delivered.');
  });

  // Setting the toast from an effect defers it to a second commit, so the
  // browser paints a frame with the result banner but no toast — the live
  // region arrives a frame late for assistive tech and visibly pops in after
  // the banner. Deriving it from `state` puts both in the same commit.
  it('renders the toast in the same commit as the result banner', () => {
    setState({});
    const commits: string[] = [];
    const probe = (): ReactNode => (
      <Profiler id="contact" onRender={() => commits.push(document.body.textContent ?? '')}>
        <ContactClient siteKey="test-site-key" />
      </Profiler>
    );

    const { rerender } = render(probe());

    setState({ status: 'success', message: 'Thanks! I’ll get back to you soon.' });
    commits.length = 0;
    rerender(probe());

    expect(commits.length).toBeGreaterThan(0);
    expect(commits[0]).toContain('Message sent');
  });

  it('auto-dismisses the toast 4s after a result, then unmounts it after the 200ms exit', () => {
    vi.useFakeTimers();
    try {
      setState({ status: 'success', message: 'Thanks! I’ll get back to you soon.' });
      render(<ContactClient siteKey="test-site-key" />);

      expect(screen.getByRole('status')).toBeInTheDocument();

      // Just before the auto-dismiss the toast is still up.
      act(() => {
        vi.advanceTimersByTime(3999);
      });
      expect(screen.getByRole('status')).toBeInTheDocument();

      // At 4s it is dismissed, but stays mounted for its exit transition.
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByRole('status')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  /**
   * `Toast` detects a new toast by object identity, so the derived toast must
   * keep the same identity for as long as the action result does — including
   * across a render where React has thrown the memo cache away. A fresh object
   * for an unchanged result reads as a brand-new toast: it re-runs the enter
   * effect, which cancels the pending reveal frame and queues another one. One
   * re-render only delays the reveal; a parent re-rendering every frame (scroll,
   * a live region, a hovering sibling) would hold the toast invisible for good.
   */
  it('keeps the pending enter frame when an unchanged result is re-derived from a discarded memo', () => {
    const frames: FrameRequestCallback[] = [];
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    });
    const cafSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    discardMemo.current = true;

    try {
      setState({});
      const { rerender } = render(<ContactClient siteKey="test-site-key" />);

      // The result arrives: the toast commits hidden with one frame queued to
      // reveal it.
      setState({ status: 'success', message: 'Thanks! I’ll get back to you soon.' });
      rerender(<ContactClient siteKey="test-site-key" />);
      expect(screen.getByRole('status')).toHaveClass('opacity-0', 'translate-y-3');
      expect(frames).toHaveLength(1);

      // A re-render for an unrelated reason, with the memo cache discarded. The
      // action result has not changed, so the queued reveal must survive it.
      rerender(<ContactClient siteKey="test-site-key" />);
      expect(cafSpy).not.toHaveBeenCalled();
      expect(frames).toHaveLength(1);

      act(() => {
        frames.splice(0).forEach((cb) => cb(0));
      });
      expect(screen.getByRole('status')).toHaveClass('opacity-100', 'translate-y-0');
    } finally {
      rafSpy.mockRestore();
      cafSpy.mockRestore();
    }
  });

  it('dismisses the toast when the user clicks Dismiss, without re-showing it', () => {
    vi.useFakeTimers();
    try {
      setState({ status: 'success', message: 'Thanks! I’ll get back to you soon.' });
      const { rerender } = render(<ContactClient siteKey="test-site-key" />);

      act(() => {
        screen.getByRole('button', { name: 'Dismiss' }).click();
      });
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      // A re-render for an unrelated reason must not resurrect the toast — the
      // dismissal is remembered against this action result, not this render.
      rerender(<ContactClient siteKey="test-site-key" />);
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
