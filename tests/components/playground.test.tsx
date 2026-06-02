import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CopyChip from '@/components/playground/CopyChip';
import SegmentedControl from '@/components/playground/SegmentedControl';
import SpringSlider from '@/components/playground/SpringSlider';

describe('SegmentedControl', () => {
  it('renders all segment options inside a radiogroup', () => {
    render(<SegmentedControl />);

    const group = screen.getByRole('radiogroup', { name: 'Workflow stage' });
    expect(group).toBeInTheDocument();

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios.map((r) => r.textContent)).toEqual(['Design', 'Build', 'Ship']);
  });

  it('defaults to "Build" being selected', () => {
    render(<SegmentedControl />);

    expect(screen.getByRole('radio', { name: 'Build' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Design' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: 'Ship' })).toHaveAttribute('aria-checked', 'false');
  });

  it('updates the active selection when a different segment is clicked', async () => {
    const user = userEvent.setup();
    render(<SegmentedControl />);

    await user.click(screen.getByRole('radio', { name: 'Ship' }));

    expect(screen.getByRole('radio', { name: 'Ship' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Build' })).toHaveAttribute('aria-checked', 'false');
  });

  it('moves the selection with arrow keys (roving tabindex radiogroup)', async () => {
    const user = userEvent.setup();
    render(<SegmentedControl />);

    // The selected radio ("Build") is the only one in the tab order.
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Build' })).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Ship' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Ship' })).toHaveFocus();

    // Arrow wraps around from the end back to the start.
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Design' })).toHaveAttribute('aria-checked', 'true');

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'Ship' })).toHaveAttribute('aria-checked', 'true');
  });

  it('jumps to the bounds with Home and End', async () => {
    const user = userEvent.setup();
    render(<SegmentedControl />);

    await user.tab();
    await user.keyboard('{End}');
    expect(screen.getByRole('radio', { name: 'Ship' })).toHaveAttribute('aria-checked', 'true');

    await user.keyboard('{Home}');
    expect(screen.getByRole('radio', { name: 'Design' })).toHaveAttribute('aria-checked', 'true');
  });
});

describe('SpringSlider', () => {
  it('renders a slider with sensible ARIA bounds and the default value', () => {
    render(<SpringSlider />);

    const slider = screen.getByRole('slider', { name: 'Value' });
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
    expect(slider).toHaveAttribute('aria-valuenow', '64');
  });

  it('shows the current value in the readout', () => {
    render(<SpringSlider />);
    expect(screen.getByText('64')).toBeInTheDocument();
  });

  it('increments / decrements by 1 with arrow keys and updates the readout', async () => {
    const user = userEvent.setup();
    render(<SpringSlider />);

    const slider = screen.getByRole('slider', { name: 'Value' });
    slider.focus();

    await user.keyboard('{ArrowRight}');
    expect(slider).toHaveAttribute('aria-valuenow', '65');
    expect(screen.getByText('65')).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(slider).toHaveAttribute('aria-valuenow', '63');
    expect(screen.getByText('63')).toBeInTheDocument();
  });

  it('steps by 10 with PageUp/PageDown and clamps at the bounds with Home/End', async () => {
    const user = userEvent.setup();
    render(<SpringSlider />);

    const slider = screen.getByRole('slider', { name: 'Value' });
    slider.focus();

    await user.keyboard('{PageUp}');
    expect(slider).toHaveAttribute('aria-valuenow', '74');

    await user.keyboard('{End}');
    expect(slider).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('100')).toBeInTheDocument();

    // Already at max — does not exceed it.
    await user.keyboard('{ArrowUp}');
    expect(slider).toHaveAttribute('aria-valuenow', '100');

    await user.keyboard('{Home}');
    expect(slider).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('0')).toBeInTheDocument();

    // Already at min — does not go below it.
    await user.keyboard('{ArrowDown}');
    expect(slider).toHaveAttribute('aria-valuenow', '0');
  });
});

describe('CopyChip', () => {
  const VALUE = 'hakimi.nima1@gmail.com';

  // jsdom does not implement navigator.clipboard, and user-event v14's
  // `setup()` installs its own clipboard stub — so the mock must be applied
  // *after* setup() (and right before render) to be the one the component hits.
  const mockClipboard = () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText },
    });
    return writeText;
  };

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the value and an idle "Copy" label', () => {
    render(<CopyChip />);

    expect(screen.getByText(VALUE)).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Copy ${VALUE}` })).toBeInTheDocument();
  });

  it('copies the value to the clipboard and shows the copied state on click', async () => {
    const user = userEvent.setup();
    const writeText = mockClipboard();
    render(<CopyChip />);

    await user.click(screen.getByRole('button'));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(VALUE);

    // Copied state is driven directly by React state (not gated by the
    // AnimatePresence cross-fade): the button relabels and the live region
    // announces. Assert those rather than the animated label swap.
    expect(await screen.findByRole('button', { name: 'Copied to clipboard' })).toBeInTheDocument();
    expect(screen.getByText('Copied to clipboard')).toBeInTheDocument();
  });

  it('reverts to the idle state after the 1.5s timer elapses', async () => {
    vi.useFakeTimers();
    mockClipboard();
    render(<CopyChip />);

    // Use fireEvent (no internal user-event timers to deadlock the fake clock)
    // and flush the awaited clipboard promise so `copied` flips to true.
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    expect(screen.getByRole('button', { name: 'Copied to clipboard' })).toBeInTheDocument();

    // The 1.5s timer flips `copied` back to false: the button reverts.
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByRole('button', { name: `Copy ${VALUE}` })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copied to clipboard' })).not.toBeInTheDocument();
  });

  it('still flashes the copied state even if the clipboard write rejects', async () => {
    const user = userEvent.setup();
    const writeText = mockClipboard();
    writeText.mockRejectedValueOnce(new Error('blocked'));
    render(<CopyChip />);

    await user.click(screen.getByRole('button'));

    expect(writeText).toHaveBeenCalledWith(VALUE);
    expect(
      await screen.findByRole('button', { name: 'Copied to clipboard' }),
    ).toBeInTheDocument();
  });
});
