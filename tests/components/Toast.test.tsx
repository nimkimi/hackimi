import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profiler, type ReactNode } from 'react';
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
    const { container: successContainer } = render(<Toast toast={successToast} onClose={() => {}} />);
    const successIcon = successContainer.querySelector('svg.shrink-0');
    expect(successIcon).toHaveClass('text-accent');

    const { container: errorContainer } = render(<Toast toast={errorToast} onClose={() => {}} />);
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
      const { rerender, container } = render(<Toast toast={successToast} onClose={onClose} />);

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

  it('updates content, role and aria-live when the toast prop is replaced', () => {
    const { rerender } = render(<Toast toast={successToast} onClose={() => {}} />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');

    rerender(<Toast toast={errorToast} onClose={() => {}} />);

    const region = screen.getByRole('alert');
    expect(region).toHaveAttribute('aria-live', 'assertive');
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  // The replacement must land in the SAME commit as the prop change. Setting
  // `renderedToast` from an effect defers it to a second commit, and passive
  // effects run after paint — so the browser shows one frame of the previous
  // toast's title, icon and role before the new one appears.
  it('never commits a frame still showing the previous toast after the prop is replaced', () => {
    const commits: string[] = [];
    const probe = (toast: ToastState): ReactNode => (
      <Profiler id="toast" onRender={() => commits.push(document.body.textContent ?? '')}>
        <Toast toast={toast} onClose={() => {}} />
      </Profiler>
    );

    const { rerender } = render(probe(successToast));
    commits.length = 0;

    rerender(probe(errorToast));

    expect(commits.length).toBeGreaterThan(0);
    expect(commits.filter((text) => text.includes('Saved'))).toHaveLength(0);
    expect(commits.at(-1)).toContain('Failed');
  });

  // The enter transition only animates if the element is first committed at
  // its pre-transition values and flipped on a later frame. Committing it
  // already at `opacity-100` would make the toast pop in with no animation.
  it('commits a newly arriving toast hidden, then reveals it on the next animation frame', () => {
    const frames: FrameRequestCallback[] = [];
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    });
    const cafSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    try {
      const { rerender } = render(<Toast toast={null} onClose={() => {}} />);
      rerender(<Toast toast={successToast} onClose={() => {}} />);

      const region = screen.getByRole('status');
      expect(region).toHaveClass('opacity-0', 'translate-y-3');
      expect(region).not.toHaveClass('opacity-100');

      act(() => {
        frames.splice(0).forEach((cb) => cb(0));
      });

      expect(screen.getByRole('status')).toHaveClass('opacity-100', 'translate-y-0');
    } finally {
      rafSpy.mockRestore();
      cafSpy.mockRestore();
    }
  });
});
