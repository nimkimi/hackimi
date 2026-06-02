import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PlaygroundSection from '@/components/playground/PlaygroundSection';

/**
 * Composition / smoke test for the Playground section wrapper.
 *
 * PlaygroundSection frames three self-contained interactive demos
 * (SegmentedControl, SpringSlider, CopyChip) under a "Playground" heading.
 * The inner behaviour of each demo is covered in
 * tests/components/playground.test.tsx, so here we only assert that the
 * section composes the heading, intro copy, captions and one distinctive
 * landmark element from each demo — not their internals.
 *
 * The demos are `motion/react` client islands relying on matchMedia; the
 * jsdom setup (tests/setup/jsdom-setup.ts) already stubs that, so the tree
 * renders in full without extra mocking.
 */
describe('PlaygroundSection', () => {
  it('renders the Playground heading and intro copy', () => {
    render(<PlaygroundSection />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Playground');
    expect(
      screen.getByText('Small interactions, built to feel right.'),
    ).toBeInTheDocument();
  });

  it('composes all three interactive demos', () => {
    render(<PlaygroundSection />);

    // SegmentedControl — its ARIA radiogroup.
    expect(
      screen.getByRole('radiogroup', { name: 'Workflow stage' }),
    ).toBeInTheDocument();

    // SpringSlider — its ARIA slider thumb.
    expect(screen.getByRole('slider', { name: 'Value' })).toBeInTheDocument();

    // CopyChip — its copy button.
    expect(
      screen.getByRole('button', { name: /^Copy / }),
    ).toBeInTheDocument();
  });

  it('renders a caption for each demo', () => {
    render(<PlaygroundSection />);

    expect(screen.getByText('Segmented control')).toBeInTheDocument();
    expect(screen.getByText('Spring slider')).toBeInTheDocument();
    expect(screen.getByText('Copy chip')).toBeInTheDocument();
  });
});
