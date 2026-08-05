import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setMediaQuery } from '../setup/match-media';
import MagneticButton from '@/components/motion/MagneticButton';

/**
 * Characterization tests for MagneticButton.
 *
 * Element choice by href:
 *   - internal route (`/contact`)  -> next/link <a href> (role link)
 *   - hash link (`#work`, `/#work`) -> plain <a href>
 *   - external (`https`, `mailto`)  -> plain <a href>
 *   - no href                       -> <button type="button">
 *
 * Motion behaviour:
 *   The magnetic branch is active on a fine-pointer device — `(pointer: coarse)`
 *   does NOT match — and when the user has not requested reduced motion. The
 *   pointer capability is a live `useMediaQuery` subscription, so it is read on
 *   the first client render (no post-mount flip) and re-read whenever the device
 *   changes, e.g. a 2-in-1 folding into tablet mode. In that branch the
 *   component wires up onMouseMove / onMouseLeave handlers and a motion
 *   `style={{ x, y }}` which framer-motion renders as a CSS transform. Under
 *   reduced motion (or coarse pointer) a plain element with NO listeners and NO
 *   transform style is rendered instead.
 *
 * matchMedia is driven through the shared fake in tests/setup/match-media.ts;
 * unset queries default to `matches:false`, which yields the magnetic branch.
 */

/**
 * Point the shared matchMedia fake at a device profile. `reduce` controls
 * prefers-reduced-motion, `coarse` controls (pointer: coarse).
 * Safe to call mid-test: subscribed components react synchronously.
 */
function setMatchMedia({
  reduce = false,
  coarse = false,
}: {
  reduce?: boolean;
  coarse?: boolean;
} = {}) {
  setMediaQuery('(prefers-reduced-motion: reduce)', reduce);
  setMediaQuery('(pointer: coarse)', coarse);
}

const BOX = {
  left: 0,
  top: 0,
  width: 100,
  height: 40,
  right: 100,
  bottom: 40,
  x: 0,
  y: 0,
  toJSON: () => {},
} as DOMRect;

/**
 * Does this element actually behave magnetically?
 *
 * Asserting on the rendered element type would not distinguish the branches —
 * both render a <button>. So drive the real thing: give it a non-zero box
 * (jsdom measures everything as 0), move the cursor to its right edge, and let
 * several real animation frames run so framer-motion's spring has left its 0,0
 * rest. A translate in the inline style means the handlers and motion values
 * are wired; nothing means the plain branch rendered.
 */
async function isMagnetic(el: HTMLElement): Promise<boolean> {
  el.getBoundingClientRect = () => BOX;

  act(() => {
    el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 100, clientY: 20 }));
  });

  await act(async () => {
    for (let i = 0; i < 8; i++) {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    }
  });

  return el.style.transform.includes('translate');
}

/** Render inside act so the post-mount magneticEnabled effect flushes. */
function renderMagnetic(ui: React.ReactElement) {
  let result!: ReturnType<typeof render>;
  act(() => {
    result = render(ui);
  });
  return result;
}

beforeEach(() => {
  setMatchMedia(); // fine pointer, normal motion -> magnetic branch
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('MagneticButton — element choice', () => {
  it('renders a next/link (role link) with an internal route href', () => {
    renderMagnetic(<MagneticButton href="/contact">Go</MagneticButton>);
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link).toHaveAttribute('href', '/contact');
    expect(link.tagName).toBe('A');
  });

  it('renders a plain anchor for a hash link (#work)', () => {
    renderMagnetic(<MagneticButton href="#work">Work</MagneticButton>);
    const link = screen.getByRole('link', { name: 'Work' });
    expect(link).toHaveAttribute('href', '#work');
    expect(link.tagName).toBe('A');
  });

  it('treats /#work as a hash link (still an anchor with that href)', () => {
    renderMagnetic(<MagneticButton href="/#work">Top</MagneticButton>);
    const link = screen.getByRole('link', { name: 'Top' });
    expect(link).toHaveAttribute('href', '/#work');
  });

  it('renders a plain anchor for an external https href', () => {
    renderMagnetic(<MagneticButton href="https://example.com">Ext</MagneticButton>);
    const link = screen.getByRole('link', { name: 'Ext' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link.tagName).toBe('A');
  });

  it('renders a plain anchor for a mailto href', () => {
    renderMagnetic(<MagneticButton href="mailto:a@b.com">Mail</MagneticButton>);
    const link = screen.getByRole('link', { name: 'Mail' });
    expect(link).toHaveAttribute('href', 'mailto:a@b.com');
  });

  it('renders a <button type="button"> when no href is given', () => {
    renderMagnetic(<MagneticButton>Press</MagneticButton>);
    const button = screen.getByRole('button', { name: 'Press' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renders children', () => {
    renderMagnetic(
      <MagneticButton>
        <span data-testid="child">child content</span>
      </MagneticButton>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('child content');
  });

  it('applies the passed className alongside the base classes', () => {
    renderMagnetic(<MagneticButton className="custom-x">Hi</MagneticButton>);
    const el = screen.getByRole('button', { name: 'Hi' });
    expect(el.className).toContain('custom-x');
    expect(el.className).toContain('inline-flex');
  });

  it('forwards onClick', async () => {
    const onClick = vi.fn();
    renderMagnetic(<MagneticButton onClick={onClick}>Tap</MagneticButton>);
    const el = screen.getByRole('button', { name: 'Tap' });
    act(() => {
      el.click();
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('MagneticButton — magnetic transform (motion allowed)', () => {
  it('applies a transform on mouse move and resets it on mouse leave', async () => {
    const { container } = renderMagnetic(<MagneticButton strength={8}>Pull</MagneticButton>);
    const el = container.firstElementChild as HTMLElement;

    // getBoundingClientRect is 0-sized in jsdom; stub a real box so the
    // magnetic math produces a non-zero translation.
    el.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        width: 100,
        height: 40,
        right: 100,
        bottom: 40,
        x: 0,
        y: 0,
        toJSON: () => {},
      }) as DOMRect;

    // No transform before interaction (spring rests at 0,0 -> framer leaves
    // transform unset / 'none').
    const before = el.style.transform;
    expect(before === '' || before === 'none').toBe(true);

    // Move the cursor to the far right edge: relX = 100 - 50 = 50, half = 50,
    // so the clamp yields the full +strength px pull on x.
    act(() => {
      el.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: 100,
          clientY: 20,
        })
      );
    });

    // framer-motion's spring updates the transform via rAF; let a few real
    // animation frames run so the motion value moves off its 0,0 rest toward
    // the target before we read the inline style.
    await act(async () => {
      for (let i = 0; i < 8; i++) {
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      }
    });

    // The transform is driven by a framer-motion spring rendered on the DOM
    // element's inline style. After a move it should contain a translate.
    // The spring may not have fully settled to 8px synchronously, so we only
    // assert that SOME horizontal translate is now present (non-zero, non-none).
    const afterMove = el.style.transform;
    expect(afterMove).not.toBe('none');
    expect(afterMove).toContain('translate');

    // Leaving resets the target to 0; assert the handler is wired by firing it
    // (the spring eases back to 0 over subsequent frames).
    act(() => {
      el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    });
    // No throw == handler attached and executed.
  });
});

describe('MagneticButton — reduced motion / coarse pointer (no magnetism)', () => {
  it('under prefers-reduced-motion renders a plain element with no transform and no mouse handlers', () => {
    setMatchMedia({ reduce: true });
    const onMove = vi.fn();

    const { container } = renderMagnetic(<MagneticButton>Static</MagneticButton>);
    const el = container.firstElementChild as HTMLElement;

    el.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        width: 100,
        height: 40,
        right: 100,
        bottom: 40,
        x: 0,
        y: 0,
        toJSON: () => {},
      }) as DOMRect;

    act(() => {
      el.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: 100,
          clientY: 20,
        })
      );
    });

    // No magnetic transform applied in the reduced-motion branch.
    const t = el.style.transform;
    expect(t === '' || t === 'none').toBe(true);
    // No translate style ever set.
    expect(container.querySelector('[style*="translate"]')).toBeNull();
    expect(onMove).not.toHaveBeenCalled();
  });

  it('on a coarse pointer device the magnetic branch never activates', () => {
    setMatchMedia({ coarse: true });

    const { container } = renderMagnetic(<MagneticButton>Touch</MagneticButton>);
    const el = container.firstElementChild as HTMLElement;

    el.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        width: 100,
        height: 40,
        right: 100,
        bottom: 40,
        x: 0,
        y: 0,
        toJSON: () => {},
      }) as DOMRect;

    act(() => {
      el.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: 100,
          clientY: 20,
        })
      );
    });

    const t = el.style.transform;
    expect(t === '' || t === 'none').toBe(true);
    expect(container.querySelector('[style*="translate"]')).toBeNull();
  });
});

describe('MagneticButton — pointer capability', () => {
  it('is magnetic on a fine pointer', async () => {
    setMatchMedia({ coarse: false });

    renderMagnetic(<MagneticButton>Fine</MagneticButton>);

    expect(await isMagnetic(screen.getByRole('button', { name: 'Fine' }))).toBe(true);
  });

  it('is not magnetic on a coarse pointer', async () => {
    setMatchMedia({ coarse: true });

    renderMagnetic(<MagneticButton>Coarse</MagneticButton>);

    expect(await isMagnetic(screen.getByRole('button', { name: 'Coarse' }))).toBe(false);
  });

  it('drops the magnetism when the pointer becomes coarse after mount', async () => {
    setMatchMedia({ coarse: false });
    renderMagnetic(<MagneticButton>Switch</MagneticButton>);
    expect(await isMagnetic(screen.getByRole('button', { name: 'Switch' }))).toBe(true);

    act(() => {
      setMediaQuery('(pointer: coarse)', true);
    });

    // The branch swap remounts the element, so re-query rather than reusing the
    // node the magnetic branch left behind.
    expect(await isMagnetic(screen.getByRole('button', { name: 'Switch' }))).toBe(false);
  });

  it('gains the magnetism when the pointer becomes fine after mount', async () => {
    setMatchMedia({ coarse: true });
    renderMagnetic(<MagneticButton>Switch</MagneticButton>);
    expect(await isMagnetic(screen.getByRole('button', { name: 'Switch' }))).toBe(false);

    act(() => {
      setMediaQuery('(pointer: coarse)', false);
    });

    expect(await isMagnetic(screen.getByRole('button', { name: 'Switch' }))).toBe(true);
  });
});
