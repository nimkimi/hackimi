import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Toast, type ToastState } from '@/components/Toast';

const successToast: NonNullable<ToastState> = {
  type: 'success',
  title: 'Saved',
  desc: 'Your message was sent.',
};

const errorToast: NonNullable<ToastState> = {
  type: 'error',
  title: 'Failed',
  desc: 'Something went wrong.',
};

describe('Toast', () => {
  it('renders the toast title and description when given an active toast', () => {
    render(<Toast toast={successToast} onClose={() => {}} />);

    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Your message was sent.')).toBeInTheDocument();
  });

  it('renders nothing when there is no active toast (initial null)', () => {
    const { container } = render(<Toast toast={null} onClose={() => {}} />);

    // Guard: `if (!renderedToast) return null` short-circuits the render.
    expect(container).toBeEmptyDOMElement();
  });

  it('uses role="status" with polite live region for a success toast', () => {
    render(<Toast toast={successToast} onClose={() => {}} />);

    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    // Success accent bar.
    expect(region.querySelector('.before\\:bg-accent')).toBeInTheDocument();
  });

  it('uses role="alert" with assertive live region for an error toast', () => {
    render(<Toast toast={errorToast} onClose={() => {}} />);

    const region = screen.getByRole('alert');
    expect(region).toHaveAttribute('aria-live', 'assertive');
    // Error variant uses the red accent bar instead of the success accent.
    expect(region.querySelector('.before\\:bg-red-500')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders a distinct status icon per type (success vs error)', () => {
    // Icons differ by class: success -> text-accent, error -> text-red-500.
    const { container: successContainer } = render(
      <Toast toast={successToast} onClose={() => {}} />,
    );
    const successIcon = successContainer.querySelector('svg.shrink-0');
    expect(successIcon).toHaveClass('text-accent');

    const { container: errorContainer } = render(
      <Toast toast={errorToast} onClose={() => {}} />,
    );
    const errorIcon = errorContainer.querySelector('svg.shrink-0');
    expect(errorIcon).toHaveClass('text-red-500');
  });

  it('invokes onClose when the Dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Toast toast={successToast} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // No auto-dismiss timer that calls onClose: the component is fully controlled
  // by the parent via the `toast` prop. Its internal setTimeout (200ms) only
  // nulls `renderedToast` to play the exit animation when the parent clears the
  // toast — it never calls onClose. So the timer-based onClose case does not
  // apply. We instead characterize that exit-animation teardown below.
  it('keeps the toast mounted after the parent clears it, then unmounts after the 200ms exit animation', () => {
    vi.useFakeTimers();
    try {
      const onClose = vi.fn();
      const { rerender, container } = render(
        <Toast toast={successToast} onClose={onClose} />,
      );

      expect(screen.getByText('Saved')).toBeInTheDocument();

      // Parent clears the toast; component should still be mounted for the exit anim.
      rerender(<Toast toast={null} onClose={onClose} />);
      expect(screen.getByText('Saved')).toBeInTheDocument();

      // After the 200ms exit timer, renderedToast is nulled and it unmounts.
      // Wrap in act so React flushes the timer-driven state update.
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(container).toBeEmptyDOMElement();

      // onClose is never invoked by the internal timer.
      expect(onClose).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
